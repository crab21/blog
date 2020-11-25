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
  //M对应的g0的高位空间栈地址
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
  //所有的mask初始化
	sigprocmask(_SIG_SETMASK, &sigset_all, &oset)
	err = pthread_create(&attr, funcPC(mstart_stub), unsafe.Pointer(mp))
  // oset地址置nil
	sigprocmask(_SIG_SETMASK, &oset, nil)
	if err != 0 {
		write(2, unsafe.Pointer(&failthreadcreate[0]), int32(len(failthreadcreate)))
		exit(1)
	}
}
```

#### [pthread_attr_init细节](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/sys_darwin_arm64.s#L402)

> 汇编代码：

```go
TEXT runtime·pthread_attr_init_trampoline(SB),NOSPLIT,$0
	MOVD	0(R0), R0	// arg 1 attr
	BL	libc_pthread_attr_init(SB)
	RET
```



#### [pthread_attr_getstacksize细节](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/sys_darwin_arm64.s#L407)

```go
TEXT runtime·pthread_attr_getstacksize_trampoline(SB),NOSPLIT,$0
	MOVD	8(R0), R1	// arg 2 size
	MOVD	0(R0), R0	// arg 1 attr
	BL	libc_pthread_attr_getstacksize(SB)
	RET
```

#### [sigprocmask_trampoline细节](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/sys_darwin_arm64.s#L266)

```go
TEXT runtime·sigprocmask_trampoline(SB),NOSPLIT,$0
	MOVD	8(R0), R1	// arg 2 new
	MOVD	16(R0), R2	// arg 3 old
	MOVW	0(R0), R0	// arg 1 how
	BL	libc_pthread_sigmask(SB)
	CMP	$0, R0
	BEQ	2(PC)
	BL	notok<>(SB)
	RET
```

#### [pthread_create细节](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/sys_darwin_arm64.s#L342)

```go
// mstart_stub is the first function executed on a new thread started by pthread_create.
// It just does some low-level setup and then calls mstart.
// Note: called with the C calling convention.
TEXT runtime·mstart_stub(SB),NOSPLIT,$0
	// DI points to the m.
	// We are already on m's g0 stack.

	// Save callee-save registers.
	SUBQ	$40, SP
	MOVQ	BX, 0(SP)
	MOVQ	R12, 8(SP)
	MOVQ	R13, 16(SP)
	MOVQ	R14, 24(SP)
	MOVQ	R15, 32(SP)

	MOVQ	m_g0(DI), DX // g

	// Initialize TLS entry.
	// See cmd/link/internal/ld/sym.go:computeTLSOffset.
	MOVQ	DX, 0x30(GS)

	// Someday the convention will be D is always cleared.
	CLD

	CALL	runtime·mstart(SB)

	// Restore callee-save registers.
	MOVQ	0(SP), BX
	MOVQ	8(SP), R12
	MOVQ	16(SP), R13
	MOVQ	24(SP), R14
	MOVQ	32(SP), R15

	// Go is all done with this OS thread.
	// Tell pthread everything is ok (we never join with this thread, so
	// the value here doesn't really matter).
	XORL	AX, AX

	ADDQ	$40, SP
	RET

```



### execLock.rlock()





```go

// rlock locks rw for reading.
func (rw *rwmutex) rlock() {
	// The reader must not be allowed to lose its P or else other
	// things blocking on the lock may consume all of the Ps and
	// deadlock (issue #20903). Alternatively, we could drop the P
	// while sleeping.
	acquirem()
	if int32(atomic.Xadd(&rw.readerCount, 1)) < 0 {
		// A writer is pending. Park on the reader queue.
		systemstack(func() {
			lockWithRank(&rw.rLock, lockRankRwmutexR)
			if rw.readerPass > 0 {
				// Writer finished.
				rw.readerPass -= 1
				unlock(&rw.rLock)
			} else {
				// Queue this reader to be woken by
				// the writer.
				m := getg().m
				m.schedlink = rw.readers
				rw.readers.set(m)
				unlock(&rw.rLock)
				notesleep(&m.park)
				noteclear(&m.park)
			}
		})
	}
}
```





#### acquirem()

> 加锁获取M

```go
//go:nosplit
func acquirem() *m {
	_g_ := getg()
	_g_.m.locks++
	return _g_.m
}
```

#### notesleep()

> 比较有趣的是sleep是用队列实现,前后加锁

```go
func notesleep(n *note) {
	gp := getg()
	...
	// Queued. Sleep.
	gp.m.blocked = true
	if *cgo_yield == nil {
		semasleep(-1)
	} else {
		// Sleep for an arbitrary-but-moderate interval to poll libc interceptors.
		const ns = 10e6
		for atomic.Loaduintptr(&n.key) == 0 {
			semasleep(ns)
			asmcgocall(*cgo_yield, nil)
		}
	}
	gp.m.blocked = false
}
```



### execLock.runlock()

```go

// runlock undoes a single rlock call on rw.
func (rw *rwmutex) runlock() {
	if r := int32(atomic.Xadd(&rw.readerCount, -1)); r < 0 {
		....
	}
	releasem(getg().m)
}
```

#### releasem

```go
//go:nosplit
//lock数量➖1，恢复到preempt的状态.
func releasem(mp *m) {
	_g_ := getg()
	mp.locks--
	if mp.locks == 0 && _g_.preempt {
		// restore the preemption request in case we've cleared it in newstack
		_g_.stackguard0 = stackPreempt
	}
}
```



先分析到这儿吧........关于这一节的流程图，会整理出来的，，，，

不然就白分析这么多了，及时学习，及时总结。

晚安😴......