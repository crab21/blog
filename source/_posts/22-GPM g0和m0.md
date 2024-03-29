---
title: 「22」GPM g0和m0
date: '2020/11/18 21:09:17'
updated: '2020/11/18 23:09:17'
keywords: 'GPM,Go,Go调度器,Go资源调度器'
tags:
  - Go
  - GPM
  - Go源码
abbrlink: 392d66f0
---

### 前序

GPM算是经典的调度模型，但是每个程序都需要一个启动的函数或者入口；
GPM也不例外。
直接分析源码，显得很枯燥，如果说要你设计GPM中的G和M的执行关系，你应该怎么设计呢？
<!--more-->
>go version: 1.14.3


### 尝试设计


![](https://raw.githubusercontent.com/crab21/Images/master/GPM202011182201.png)
如果只是这样的话，那总体的G和M是否需要管理者，毕竟在1.1版本之前只有GM模型，，，
那么为了好管理M和G，就需要第一个M和G成为管理者，类似于大总管这样的存在。

### 再次设计

![](https://raw.githubusercontent.com/crab21/Images/master/GPM202011182219.png)

### 关键点：
* p先启动
* g0的创建；用于创建新的G
* m0的创建；用于创建新的M
* 启动main调度整个系统
>上述这样比较合理点。


### Go源码的如何实现？

[bootstrap sequence](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/proc.go#L524)


```go
// The bootstrap sequence is:
//
//	call osinit
//	call schedinit
//	make & queue new G
//	call runtime·mstart
//
// The new G calls runtime·main.
```

>[g0和m0初始化过程](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/asm_amd64.s#L194)

```c#
// set the per-goroutine and per-mach "registers"
	get_tls(BX)
	LEAQ	runtime·g0(SB), CX
	MOVQ	CX, g(BX)
	LEAQ	runtime·m0(SB), AX

	// save m->g0 = g0
	MOVQ	CX, m_g0(AX)
	// save m0 to g0->m
	MOVQ	AX, g_m(CX)

	CLD				// convention is D is always left cleared
	CALL	runtime·check(SB)

	MOVL	16(SP), AX		// copy argc
	MOVL	AX, 0(SP)
	MOVQ	24(SP), AX		// copy argv
	MOVQ	AX, 8(SP)
	CALL	runtime·args(SB)
	CALL	runtime·osinit(SB)
	CALL	runtime·schedinit(SB)

	// create a new goroutine to start program
	MOVQ	$runtime·mainPC(SB), AX		// entry
	PUSHQ	AX
	PUSHQ	$0			// arg size
	CALL	runtime·newproc(SB)
	POPQ	AX
	POPQ	AX

	// start this M
	CALL	runtime·mstart(SB)
```



>到这里了，初始化思路基本确定了
```
1、initP
2、m0和g0的绑定
3、new groutine for main主线程启动
4、mstart
```

### m init涉及到的函数
* mstart
* mstart1
* mstartm0

#### mstart

```go
// mstart is the entry-point for new Ms.
//
// This must not split the stack because we may not even have stack
// bounds set up yet.
//
// May run during STW (because it doesn't have a P yet), so write
// barriers are not allowed.
//
//go:nosplit
//go:nowritebarrierrec
func mstart() {
	_g_ := getg()

    //低位判断
	osStack := _g_.stack.lo == 0
	if osStack {
		// Initialize stack bounds from system stack.
		// Cgo may have left stack size in stack.hi.
		// minit may update the stack bounds.
		size := _g_.stack.hi
		if size == 0 {
			size = 8192 * sys.StackGuardMultiplier
        }
        //g0的stack空间是真的大
		_g_.stack.hi = uintptr(noescape(unsafe.Pointer(&size)))
		_g_.stack.lo = _g_.stack.hi - size + 1024
	}
	// Initialize stack guard so that we can start calling regular
	// Go code.
	_g_.stackguard0 = _g_.stack.lo + _StackGuard
	// This is the g0, so we can also call go:systemstack
	// functions, which check stackguard1.
	_g_.stackguard1 = _g_.stackguard0
	mstart1()

	// Exit this thread.
	switch GOOS {
	case "windows", "solaris", "illumos", "plan9", "darwin", "aix":
		// Windows, Solaris, illumos, Darwin, AIX and Plan 9 always system-allocate
		// the stack, but put it in _g_.stack before mstart,
		// so the logic above hasn't set osStack yet.
		osStack = true
	}
	mexit(osStack)
}
```

#### mstart1

```go

func mstart1() {
	_g_ := getg()

    //启动非g0就崩盘了
	if _g_ != _g_.m.g0 {
		throw("bad runtime·mstart")
	}

    //初始化
	// Record the caller for use as the top of stack in mcall and
	// for terminating the thread.
	// We're never coming back to mstart1 after we call schedule,
	// so other calls can reuse the current frame.
	save(getcallerpc(), getcallersp())
	asminit()
	minit()

	// Install signal handlers; after minit so that minit can
    // prepare the thread to be able to handle the signals.
    //m0启动
	if _g_.m == &m0 {
		mstartm0()
	}

	if fn := _g_.m.mstartfn; fn != nil {
		fn()
	}

	if _g_.m != &m0 {
		acquirep(_g_.m.nextp.ptr())
		_g_.m.nextp = 0
    }
    //开始调度
	schedule()
}
```


#### mstartm0

```go
// mstart1的具体实现，仅run在m0上
// mstartm0 implements part of mstart1 that only runs on the m0.
//
// Write barriers are allowed here because we know the GC can't be
// running yet, so they'll be no-ops.
//
//go:yeswritebarrierrec
func mstartm0() {
	// Create an extra M for callbacks on threads not created by Go.
	// An extra M is also needed on Windows for callbacks created by
    // syscall.NewCallback. See issue #6751 for details.
    //windows下需要一个额外的M
	if (iscgo || GOOS == "windows") && !cgoHasExtraM {
		cgoHasExtraM = true
		newextram()
    }
    //初始化信号量,用于后续调度
	initsig(false)
}
```

#### [后续schedule函数](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/proc.go#L1119)

>管家有了，那么开始调度吧....。

### 下节：

* schedule