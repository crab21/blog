---
title: 「32」Go  Ticker 内存泄露
date: '2021/2/4 12:01:17'
updated: '2021/2/4 12:01:17'
keywords: 'time,zone,Go,ticker,定时器'
tags:
  - Go
  - ticker
  - Day
  - defer
abbrlink: 53e1932f
---

### 前序：
不知道你们有没有经历过这种情况：
>测试示例图片：

![](https://github.com/crab21/Images/tree/master/clipboard_20210204_051425.webp)

<!--more-->

>说的简单点：内存炸了呗....OOM


### 引言

>go version go1.14.14 darwin/amd64

```go
最近的坑是真的多，当然这种坑在大项目中，一不小心就写出来了,

人多，项目大，各种各样的花式操作都出来了,在所难免，
能做的就是分析问题，总结，记录，防止下次自己犯错，同时也可以加深理解。
```

### 起因：

```go
func XXX() {
    // 业务代码 几十行...
    for i:=0;i<100000;i++{
	    ticker := time.NewTicker(10 * time.Second)
		defer func() {
            //模拟业务代码
			fmt.Println("defer close")
		}()
		go func(){
            for {
                select {
                case <-ticker.C:
                // 业务代码.....
                    fmt.Println("time 5")
                case <-doneChan:
                    return
			}
		}
        }()

        
    }
    // 业务代码 几十行...
    return
}
```

#### 发生了什么？

>上面的代码，不晓得看出来什么问题了么.....

### 关键点：

ticker没有stop

[官方解释](https://github.com/golang/go/blob/master/src/time/tick.go#L62)

#### Ticker不能被回收导致
![](https://github.com/crab21/Images/tree/master/clipboard_20210204_053201.webp)


#### 为何不能被回收？

##### NewTicker实现：

[NewTicker官方实现](https://github.com/golang/go/blob/master/src/time/tick.go#L39)


[startTimer底层实现](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/time.go#L203)

###### addtimer
```go
// addtimer adds a timer to the current P.
// This should only be called with a newly created timer.
// That avoids the risk of changing the when field of a timer in some P's heap,
// which could cause the heap to become unsorted.
func addtimer(t *timer) {
	// when must never be negative; otherwise runtimer will overflow
	// during its delta calculation and never expire other runtime timers.
	if t.when < 0 {
		t.when = maxWhen
	}
	if t.status != timerNoStatus {
		throw("addtimer called with initialized timer")
	}
	t.status = timerWaiting

	when := t.when

	pp := getg().m.p.ptr() // 获取当前的P
	lock(&pp.timersLock) // 加锁
	cleantimers(pp) // 调整p.timers栈顶元素
	doaddtimer(pp, t) // t绑定下p
	unlock(&pp.timersLock) 

	wakeNetPoller(when)
}
```

###### doaddtimer

```go
// doaddtimer adds t to the current P's heap.
// The caller must have locked the timers for pp.
func doaddtimer(pp *p, t *timer) {
	// Timers rely on the network poller, so make sure the poller
	// has started.
	if netpollInited == 0 {
		netpollGenericInit()
	}

	if t.pp != 0 {
		throw("doaddtimer: P already set in timer")
	}
	t.pp.set(pp)
	i := len(pp.timers)
	pp.timers = append(pp.timers, t) // p上添加一个timer
	siftupTimer(pp.timers, i) // 堆调整算法
	if t == pp.timers[0] {
		atomic.Store64(&pp.timer0When, uint64(t.when))
	}
	atomic.Xadd(&pp.numTimers, 1)
}
```


### 拓展：
#### cleantimers过程：

* 判断长度
* 判断上一个timer状态

```go
// cleantimers cleans up the head of the timer queue. This speeds up
// programs that create and delete timers; leaving them in the heap
// slows down addtimer. Reports whether no timer problems were found.
// The caller must have locked the timers for pp.
func cleantimers(pp *p) {
	for {
		if len(pp.timers) == 0 { // 判断长度
			return
		}
		t := pp.timers[0] //取第一个
		if t.pp.ptr() != pp {
			throw("cleantimers: bad p")
		}
		switch s := atomic.Load(&t.status); s { //需要判断状态
		case timerDeleted:
			if !atomic.Cas(&t.status, s, timerRemoving) { //非删除中
				continue
			}
			dodeltimer0(pp) //移除timer0
			if !atomic.Cas(&t.status, timerRemoving, timerRemoved) {
				badTimer()
			}
			atomic.Xadd(&pp.deletedTimers, -1)
		case timerModifiedEarlier, timerModifiedLater: // 修改前或者修改后的状态
			if !atomic.Cas(&t.status, s, timerMoving) {
				continue
			}
			// Now we can change the when field.
			t.when = t.nextwhen // 指针后移
			// Move t to the right position.
			dodeltimer0(pp) // 删除最底下的元素
			doaddtimer(pp, t) // 重新绑定P和t的关系
			if s == timerModifiedEarlier {
				atomic.Xadd(&pp.adjustTimers, -1)
			}
			if !atomic.Cas(&t.status, timerMoving, timerWaiting) {
				badTimer()
			}
		default:
			// Head of timers does not need adjustment.
			return
		}
	}
}
```

##### dodeltimer0

```go
// dodeltimer0 removes timer 0 from the current P's heap.
// We are locked on the P when this is called.
// It reports whether it saw no problems due to races.
// The caller must have locked the timers for pp.
func dodeltimer0(pp *p) {
	if t := pp.timers[0]; t.pp.ptr() != pp {
		throw("dodeltimer0: wrong P")
	} else {
		t.pp = 0
	}
	last := len(pp.timers) - 1 // 获取第一个timers
	if last > 0 {
		pp.timers[0] = pp.timers[last] // 栈底--->栈顶
	}
	pp.timers[last] = nil // 置空
	pp.timers = pp.timers[:last] //重新赋值
	if last > 0 {
		siftdownTimer(pp.timers, 0)  // 重新排序
	}
	updateTimer0When(pp) // 更新P中的when
	atomic.Xadd(&pp.numTimers, -1) // 更新数量
}

```

### 参考
* [NewTicker官方实现](https://github.com/golang/go/blob/master/src/time/tick.go#L39)


* [StartTimer底层实现](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/time.go#L203)
* atomic
    * atomic.Store64
    * atomic.Xadd