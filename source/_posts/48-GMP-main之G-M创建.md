---
title: 「48」GMP main之G&M创建
date: 2021/05/06 21:55:30
updated: '2021/05/06 21:56:17'
keywords: 'Go,GPM,G0,M0'
tags:
  - GPM
  - Day
  - Go
  - Go源码
mathjax: true
---

前面说了GPM的main函数启动[👉👉👉「47」GPM main启动](https://blog.imrcrab.com/archives/66b6223a.html#more)，这次看下这个启动过程中如何创建第一个M和G的操作。

在main函数汇编的入口地方call这么几个函数：

* args 参数设定
* osinit  os系统初始化
* schedinit 调度初始化

<!--more-->

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210506_105845.png)


### [call 👉👉osinit函数](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/os_plan9.go#L291)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210506_105719.png)

>getpid()获取当前的proc的id号，赋值给当前g->m.procid

### 【call 👉👉schedinit函数](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/proc.go#L532)


```go

// The bootstrap sequence is:
//
//	call osinit
//	call schedinit
//	make & queue new G
//	call runtime·mstart
//
// The new G calls runtime·main.
func schedinit() {

    // 一大堆lock的初始化
	lockInit(&sched.lock, lockRankSched)
	lockInit(&sched.sysmonlock, lockRankSysmon)
	lockInit(&sched.deferlock, lockRankDefer)
	lockInit(&sched.sudoglock, lockRankSudog)
	lockInit(&deadlock, lockRankDeadlock)
	lockInit(&paniclk, lockRankPanic)
	lockInit(&allglock, lockRankAllg)
	lockInit(&allpLock, lockRankAllp)
	lockInit(&reflectOffs.lock, lockRankReflectOffs)
	lockInit(&finlock, lockRankFin)
	lockInit(&trace.bufLock, lockRankTraceBuf)
	lockInit(&trace.stringsLock, lockRankTraceStrings)
	lockInit(&trace.lock, lockRankTrace)
	lockInit(&cpuprof.lock, lockRankCpuprof)
	lockInit(&trace.stackTab.lock, lockRankTraceStackTab)
	// Enforce that this lock is always a leaf lock.
	// All of this lock's critical sections should be
	// extremely short.
	lockInit(&memstats.heapStats.noPLock, lockRankLeafRank)

	// raceinit must be the first call to race detector.
	// In particular, it must be done before mallocinit below calls racemapshadow.
    // 获取当前的g
	_g_ := getg()
	if raceenabled {
		_g_.racectx, raceprocctx0 = raceinit()
	}

    // 最大的m为1w个
	sched.maxmcount = 10000

	// The world starts stopped.
	worldStopped()

	moduledataverify()
    // stack初始化
	stackinit()
    // 内存分配器初始化
	mallocinit()
    // 随机数初始化
	fastrandinit() // must run before mcommoninit
    // id预分配
	mcommoninit(_g_.m, -1)
	cpuinit()       // must run before alginit
    // 内存堆齐初始化
	alginit()       // maps must not be used before this call
	modulesinit()   // provides activeModules
	typelinksinit() // uses maps, activeModules
	itabsinit()     // uses activeModules

	sigsave(&_g_.m.sigmask)
	initSigmask = _g_.m.sigmask

	if offset := unsafe.Offsetof(sched.timeToRun); offset%8 != 0 {
		println(offset)
		throw("sched.timeToRun not aligned to 8 bytes")
	}

	goargs()
	goenvs()
	parsedebugvars()
	gcinit()

	lock(&sched.lock)
	sched.lastpoll = uint64(nanotime())
	procs := ncpu
	if n, ok := atoi32(gogetenv("GOMAXPROCS")); ok && n > 0 {
		procs = n
	}
	if procresize(procs) != nil {
		throw("unknown runnable goroutine during bootstrap")
	}
	unlock(&sched.lock)

	// World is effectively started now, as P's can run.
	worldStarted()

	// For cgocheck > 1, we turn on the write barrier at all times
	// and check all pointer writes. We can't do this until after
	// procresize because the write barrier needs a P.
	if debug.cgocheck > 1 {
		writeBarrier.cgo = true
		writeBarrier.enabled = true
		for _, p := range allp {
			p.wbBuf.reset()
		}
	}

	if buildVersion == "" {
		// Condition should never trigger. This code just serves
		// to ensure runtime·buildVersion is kept in the resulting binary.
		buildVersion = "unknown"
	}
	if len(modinfo) == 1 {
		// Condition should never trigger. This code just serves
		// to ensure runtime·modinfo is kept in the resulting binary.
		modinfo = ""
	}
}
```

#### 大体流程
```markdown
1、lockinit
2、g:=getg()
3、maxmcount = 10000
4、stackinit
5、mallocinit「内存分配器初始化」
6、随机数
7、mcommon公公部分init
8、cpu和byte等初始化。
9、goenv初始化
10、gcinit()
11、GOMAXPROCS设置
12、cgo等初始化
```

### 关于gomaxprocs最大值

#### [👉👉Go 1.9中](https://github.com/golang/go/blob/release-branch.go1.9/src/runtime/runtime2.go#L523)

>最大为1024

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210506_115200.png)

#### [Go 1.9以后「👉👉1.14为例」](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L1018)

>最大为int32的最大值：
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210507_121640.png)

#### 坑点：

Go 1.14以后看似最大是int32最大值，但是有一个新问题，真的可以设置到最大值吗？实验一把：

```go
package main
func main() {
	runtime.GOMAXPROCS(int32(^uint32(0) >> 1))
	fmt.Println("hello world")
}
```
结果报错：

```go
fatal error: slice bounds out of range
fatal error: unexpected signal during runtime execution
panic during panic
[signal SIGSEGV: segmentation violation code=0x1 addr=0x4 pc=0x104098b]

...
....
.....
```

>🤔🤔🤔🤔🤔数组越界了？

>又反复看了看源码，问题找出来了：


![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210507_122730.png)


##### 问题的关键
```go
maskWords := (nprocs + 31) / 32

导致：maskWords数值溢出了，导致下面截取panic。

if nprocs <= int32(cap(allp)) {
	allp = allp[:nprocs]
}

```
### GOMAXPROCS最大值？？
>所以GOMAXPROCS最大为: int32(^uint32(0) >> 1)-31

### 🔚🔚🔚