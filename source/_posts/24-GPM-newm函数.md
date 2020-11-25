---
title: 「24」GPM newm函数
date: '2020/11/25 20:00:17'
updated: '2020/11/25 20:00:17'
keywords: 'GPM,Go,Go调度器,Go资源调度器'
tags:
  - Go
  - GPM
  - Go源码
---



上节看了go的入口函数，，，也就是你执行main函数前后所做的准备工作。



继续深入学习。「newm」第一个M，到底是怎么来的？



<!--more-->



> go version: 1.14.3

### 入口

先看下主体，主要在M创建的过程中，干了what，，，，，「PS : 关键看值得学习的点」

```go
// Create a new m. It will start off with a call to fn, or else the scheduler.
// fn needs to be static and not a heap allocated closure.
// May run with m.p==nil, so write barriers are not allowed.
//go:nowritebarrierrec
func newm(fn func(), _p_ *p) {
  //分配内存
	mp := allocm(_p_, fn)
  //设置p
	mp.nextp.set(_p_)
  //初始化信号量
	mp.sigmask = initSigmask
  //获取到gp后，判断M&（系统锁定｜｜cgo执行中）；；；plan9的系统跳过下面操作....
	if gp := getg(); gp != nil && gp.m != nil && (gp.m.lockedExt != 0 || gp.m.incgo) && GOOS != "plan9" {
		// We're on a locked M or a thread that may have been
		// started by C. The kernel state of this thread may
		// be strange (the user may have locked it for that
		// purpose). We don't want to clone that into another
		// thread. Instead, ask a known-good thread to create
		// the thread for us.
		//
		// This is disabled on Plan 9. See golang.org/issue/22227.
		//
		// TODO: This may be unnecessary on Windows, which
		// doesn't model thread creation off fork.
		lock(&newmHandoff.lock)
		if newmHandoff.haveTemplateThread == 0 {
			throw("on a locked thread with no template thread")
		}
		mp.schedlink = newmHandoff.newm
		newmHandoff.newm.set(mp)
		if newmHandoff.waiting {
			newmHandoff.waiting = false
			notewakeup(&newmHandoff.wake)
		}
		unlock(&newmHandoff.lock)
		return
	}
  //new m1指第一个M的创建过程.
	newm1(mp)
}
```



### newm1

> go to 「newm1」

看起来很简短

```go
func newm1(mp *m) {
  //cgo程序执行中?
	if iscgo {
		var ts cgothreadstart
		if _cgo_thread_start == nil {
			throw("_cgo_thread_start missing")
		}
		ts.g.set(mp.g0)
		ts.tls = (*uint64)(unsafe.Pointer(&mp.tls[0]))
		ts.fn = unsafe.Pointer(funcPC(mstart))
		if msanenabled {
			msanwrite(unsafe.Pointer(&ts), unsafe.Sizeof(ts))
		}
		execLock.rlock() // Prevent process clone.
		asmcgocall(_cgo_thread_start, unsafe.Pointer(&ts))
		execLock.runlock()
		return
	}
  
	execLock.rlock() // Prevent process clone.
  //涉及到系统进程创建
	newosproc(mp)
	execLock.runlock()
}
```



### newosproc

> M创建之前，系统的操作和相关地址的变化



```go
// May run with m.p==nil, so write barriers are not allowed.
//go:nowritebarrierrec
func newosproc(mp *m) {
//这个stk操作很奇怪，有兴趣的可以研究下....[看起来啥也没干那]
	stk := unsafe.Pointer(mp.g0.stack.hi)
	if false {
		print("newosproc stk=", stk, " m=", mp, " g=", mp.g0, " id=", mp.id, " ostk=", &mp, "\n")
	}

	// Initialize an attribute object.
	var attr pthreadattr
	var err int32
  //汇编，变量初始化
	err = pthread_attr_init(&attr)
	if err != 0 {
		write(2, unsafe.Pointer(&failthreadcreate[0]), int32(len(failthreadcreate)))
		exit(1)
	}

	// Find out OS stack size for our own stack guard.
	var stacksize uintptr
	if pthread_attr_getstacksize(&attr, &stacksize) != 0 {
		write(2, unsafe.Pointer(&failthreadcreate[0]), int32(len(failthreadcreate)))
		exit(1)
	}
	mp.g0.stack.hi = stacksize // for mstart
	//mSysStatInc(&memstats.stacks_sys, stacksize) //TODO: do this?

	// Tell the pthread library we won't join with this thread.
	if pthread_attr_setdetachstate(&attr, _PTHREAD_CREATE_DETACHED) != 0 {
		write(2, unsafe.Pointer(&failthreadcreate[0]), int32(len(failthreadcreate)))
		exit(1)
	}

	// Finally, create the thread. It starts at mstart_stub, which does some low-level
	// setup and then calls mstart.
	var oset sigset
	sigprocmask(_SIG_SETMASK, &sigset_all, &oset)
	err = pthread_create(&attr, funcPC(mstart_stub), unsafe.Pointer(mp))
	sigprocmask(_SIG_SETMASK, &oset, nil)
	if err != 0 {
		write(2, unsafe.Pointer(&failthreadcreate[0]), int32(len(failthreadcreate)))
		exit(1)
	}
}
```

