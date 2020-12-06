---
title: 「25」GPM sysmon函数
date: '2020/12/06 20:00:17'
updated: '2020/12/06 20:00:17'
keywords: 'GPM,Go,Go调度器,Go资源调度器'
tags:
  - Go
  - GPM
  - Go源码
abbrlink: c770fe49
---


前面主要是了解newm的全过程和其中难过一些细节逻辑，，，
如果没了解的，建议先去看下大概的过程，虽然不是非常详细，
最起码得知道newm过程，主要完成了什么操作，有利于后续理解。


这次主要是来学学这个sysmon，系统监控调度的逻辑。
<!--more-->
### 前序

在深入之前呢，先对下面这些变量有个概念，后续提到也就不陌生了。「摘抄自sysmon函数」

```go
var (
	allglen    uintptr //g
	allm       *m      //m
	allp       []*p  // p     len(allp) == gomaxprocs; may change at safe points, otherwise immutable
	allpLock   mutex // 全局lock。   Protects P-less reads of allp and all writes
	gomaxprocs int32 //最大process数量
	ncpu       int32 //cpu个数
	forcegc    forcegcstate //强制GC
	sched      schedt //预分配的一些变量值
	newprocs   int32  //新的process

	// Information about what cpu features are available.
	// Packages outside the runtime should not use these
	// as they are not an external api.
	// Set on startup in asm_{386,amd64}.s
	processorVersionInfo uint32
	isIntel              bool
	lfenceBeforeRdtsc    bool

	goarm                uint8 // set by cmd/link on arm systems
	framepointer_enabled bool  // set by cmd/link
)

```

### sysmon函数

#### 概览
```go

func sysmon() {
	lock(&sched.lock)//加锁
	sched.nmsys++ //数量+1
	checkdead() //检查是否dead
	unlock(&sched.lock) //释放lock

	lasttrace := int64(0)
	idle := 0 // how many cycles in succession we had not wokeup somebody
	delay := uint32(0)
	for{
		......
	}
}
```


![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/GPM-sysmon-1.png)



### 循环干什么？

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20201206_085755.png)


>一个个过吧

#### 获取系统的纳秒时间
```go
now := nanotime()
```

#### timeSleepUntil

```go
// timeSleepUntil returns the time when the next timer should fire,
// and the P that holds the timer heap that that timer is on.
// This is only called by sysmon and checkdead.
func timeSleepUntil() (int64, *p) {
	next := int64(maxWhen)
	var pret *p

	// Prevent allp slice changes. This is like retake.
	lock(&allpLock)
	for _, pp := range allp {
		if pp == nil {
			// This can happen if procresize has grown
			// allp but not yet created new Ps.
			continue
		}

		c := atomic.Load(&pp.adjustTimers)
		if c == 0 {
			w := int64(atomic.Load64(&pp.timer0When))
			//划重点
			if w != 0 && w < next {
				next = w
				pret = pp
			}
			continue
		}

		lock(&pp.timersLock)
		for _, t := range pp.timers {
			//划重点
			switch s := atomic.Load(&t.status); s {
			case timerWaiting:
				if t.when < next {
					next = t.when
				}
			case timerModifiedEarlier, timerModifiedLater:
				if t.nextwhen < next {
					next = t.nextwhen
				}
				if s == timerModifiedEarlier {
					c--
				}
			}
			// The timers are sorted, so we only have to check
			// the first timer for each P, unless there are
			// some timerModifiedEarlier timers. The number
			// of timerModifiedEarlier timers is in the adjustTimers
			// field, used to initialize c, above.
			//
			// We don't worry about cases like timerModifying.
			// New timers can show up at any time,
			// so this function is necessarily imprecise.
			// Do a signed check here since we aren't
			// synchronizing the read of pp.adjustTimers
			// with the check of a timer status.
			if int32(c) <= 0 {
				break
			}
		}
		unlock(&pp.timersLock)
	}
	unlock(&allpLock)

	return next, pret
}
```

#### sched和gomaxprocs判断「sleep&wakeup过程」
```go
//双层判断，防止在加锁这段时间值发生变化
if debug.schedtrace <= 0 && (sched.gcwaiting != 0 || atomic.Load(&sched.npidle) == uint32(gomaxprocs)) {
			lock(&sched.lock)
			if atomic.Load(&sched.gcwaiting) != 0 || atomic.Load(&sched.npidle) == uint32(gomaxprocs) {
				if next > now {
					atomic.Store(&sched.sysmonwait, 1)
					unlock(&sched.lock)
					// Make wake-up period small enough
					// for the sampling to be correct.
					sleep := forcegcperiod / 2
					if next-now < sleep {
						sleep = next - now
					}
					shouldRelax := sleep >= osRelaxMinNS
					if shouldRelax {
						osRelax(true)
					}
					notetsleep(&sched.sysmonnote, sleep)
					if shouldRelax {
						osRelax(false)
					}
					now = nanotime()
					next, _ = timeSleepUntil()
					lock(&sched.lock)
					atomic.Store(&sched.sysmonwait, 0)
					noteclear(&sched.sysmonnote)
				}
				idle = 0
				delay = 20
			}
			unlock(&sched.lock)
		}
```

#### poll network

```go
		// poll network if not polled for more than 10ms
		lastpoll := int64(atomic.Load64(&sched.lastpoll))
		if netpollinited() && lastpoll != 0 && lastpoll+10*1000*1000 < now {
			atomic.Cas64(&sched.lastpoll, uint64(lastpoll), uint64(now))
			list := netpoll(0) // non-blocking - returns list of goroutines
			if !list.empty() {
				// Need to decrement number of idle locked M's
				// (pretending that one more is running) before injectglist.
				// Otherwise it can lead to the following situation:
				// injectglist grabs all P's but before it starts M's to run the P's,
				// another M returns from syscall, finishes running its G,
				// observes that there is no work to do and no other running M's
				// and reports deadlock.
				incidlelocked(-1)
				injectglist(&list)
				incidlelocked(1)
			}
		}
		if next < now {
			// There are timers that should have already run,
			// perhaps because there is an unpreemptible P.
			// Try to start an M to run them.
			//划重点
			startm(nil, false)
		}
```


