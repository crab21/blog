---
title: 「36」defer panic源码分析
date: '2021/2/18 11:10:17'
updated: '2021/2/18 11:10:17'
keywords: 'Go,Runtime'
tags:
  - Go
  - Runtime
  - Day
  - 源码
mathjax: true
abbrlink: b630d910
---


### 前序

[「35」runtime:recover not correctly recover from panic](https://blog.imrcrab.com/archives/d586b949.html#more)说到了v1.16修复的一个panic问题,这次顺带看看底层关于defer的处理.

<!--more-->
### version

>go version go1.14.14 darwin/amd64
### defer处理

#### 程序

```go
package main

func main() {
	f()
}

func f() {
	defer sum(1, 2)
}

func sum(a, b int) int {
	return a + b
}

```

#### 汇编表示:「关于汇编的参考[Plan 9汇编相关](https://blog.imrcrab.com/archives/2ce846ed.html)」


```go
    0x0000 00000 (src/main/ssp.go:7)        TEXT    "".f(SB), ABIInternal, $128-0
    0x0000 00000 (src/main/ssp.go:7)        MOVQ    (TLS), CX
    0x0009 00009 (src/main/ssp.go:7)        CMPQ    SP, 16(CX)
    0x000d 00013 (src/main/ssp.go:7)        PCDATA  $0, $-2
    0x000d 00013 (src/main/ssp.go:7)        JLS     119
    0x000f 00015 (src/main/ssp.go:7)        PCDATA  $0, $-1
    0x000f 00015 (src/main/ssp.go:7)        ADDQ    $-128, SP
    0x0013 00019 (src/main/ssp.go:7)        MOVQ    BP, 120(SP)
    0x0018 00024 (src/main/ssp.go:7)        LEAQ    120(SP), BP
    0x001d 00029 (src/main/ssp.go:7)        FUNCDATA        $0, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
    0x001d 00029 (src/main/ssp.go:7)        FUNCDATA        $1, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
    0x001d 00029 (src/main/ssp.go:8)        MOVL    $24, ""..autotmp_0+24(SP)
    0x0025 00037 (src/main/ssp.go:8)        LEAQ    "".sum·f(SB), AX
    0x002c 00044 (src/main/ssp.go:8)        MOVQ    AX, ""..autotmp_0+48(SP)
    0x0031 00049 (src/main/ssp.go:8)        MOVQ    $1, ""..autotmp_0+96(SP)
    0x003a 00058 (src/main/ssp.go:8)        MOVQ    $2, ""..autotmp_0+104(SP)
    0x0043 00067 (src/main/ssp.go:8)        LEAQ    ""..autotmp_0+24(SP), AX
    0x0048 00072 (src/main/ssp.go:8)        MOVQ    AX, (SP)
    0x004c 00076 (src/main/ssp.go:8)        PCDATA  $1, $0
    0x004c 00076 (src/main/ssp.go:8)        CALL    runtime.deferprocStack(SB) // 划重点,函数调用部分
    0x0051 00081 (src/main/ssp.go:8)        TESTL   AX, AX
    0x0053 00083 (src/main/ssp.go:8)        JNE     103
    0x0055 00085 (src/main/ssp.go:8)        JMP     87
    0x0057 00087 (src/main/ssp.go:9)        XCHGL   AX, AX
    0x0058 00088 (src/main/ssp.go:9)        CALL    runtime.deferreturn(SB)  // 划重点,函数调用部分
    0x005d 00093 (src/main/ssp.go:9)        MOVQ    120(SP), BP
    0x0062 00098 (src/main/ssp.go:9)        SUBQ    $-128, SP
    0x0066 00102 (src/main/ssp.go:9)        RET
    0x0067 00103 (src/main/ssp.go:8)        XCHGL   AX, AX
    0x0068 00104 (src/main/ssp.go:8)        CALL    runtime.deferreturn(SB)  // 划重点,函数调用部分
    0x006d 00109 (src/main/ssp.go:8)        MOVQ    120(SP), BP
    0x0072 00114 (src/main/ssp.go:8)        SUBQ    $-128, SP
    0x0076 00118 (src/main/ssp.go:8)        RET
    0x0077 00119 (src/main/ssp.go:8)        NOP
    0x0077 00119 (src/main/ssp.go:7)        PCDATA  $1, $-1
    0x0077 00119 (src/main/ssp.go:7)        PCDATA  $0, $-2
    0x0077 00119 (src/main/ssp.go:7)        CALL    runtime.morestack_noctxt(SB)
    0x007c 00124 (src/main/ssp.go:7)        PCDATA  $0, $-1
    0x007c 00124 (src/main/ssp.go:7)        JMP     0

```

#### [defer官方定义](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L865):

```go
// A _defer holds an entry on the list of deferred calls.
// If you add a field here, add code to clear it in freedefer and deferProcStack
// This struct must match the code in cmd/compile/internal/gc/reflect.go:deferstruct
// and cmd/compile/internal/gc/ssa.go:(*state).call.
// Some defers will be allocated on the stack and some on the heap. // 堆栈的不确定性
// All defers are logically part of the stack, so write barriers to
// initialize them are not required. All defers must be manually scanned,
// and for heap defers, marked.
type _defer struct {
	siz     int32 // includes both arguments and results
	started bool
	heap    bool
	// openDefer indicates that this _defer is for a frame with open-coded
	// defers. We have only one defer record for the entire frame (which may
	// currently have 0, 1, or more defers active).
	openDefer bool
	sp        uintptr  // sp at time of defer
	pc        uintptr  // pc at time of defer
	fn        *funcval // can be nil for open-coded defers 指向函数
	_panic    *_panic  // panic that is running defer
	link      *_defer  // 同一个goroutine所有的defer连城的链表

	// If openDefer is true, the fields below record values about the stack
	// frame and associated function that has the open-coded defer(s). sp
	// above will be the sp for the frame, and pc will be address of the
	// deferreturn call in the function.
	fd   unsafe.Pointer // funcdata for the function associated with the frame
	varp uintptr        // value of varp for the stack frame
	// framepc is the current pc associated with the stack frame. Together,
	// with sp above (which is the sp associated with the stack frame),
	// framepc/sp can be used as pc/sp pair to continue a stack trace via
	// gentraceback().
	framepc uintptr
}

```

#### [deferproc](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/panic.go#L218)

```go
// Create a new deferred function fn with siz bytes of arguments.
// The compiler turns a defer statement into a call to this.
//go:nosplit
func deferproc(siz int32, fn *funcval) { // arguments of fn follow fn
	gp := getg()
	if gp.m.curg != gp {
		// go code on the system stack can't defer
		throw("defer on system stack")
	}

	// the arguments of fn are in a perilous state. The stack map
	// for deferproc does not describe them. So we can't let garbage
	// collection or stack copying trigger until we've copied them out
	// to somewhere safe. The memmove below does that.
	// Until the copy completes, we can only call nosplit routines.
    // 获取调用者的sp「栈顶」
	sp := getcallersp()
	argp := uintptr(unsafe.Pointer(&fn)) + unsafe.Sizeof(fn)
	callerpc := getcallerpc() // 获取caller的pc

    // 从poll中获取或allocate一个
	d := newdefer(siz)
	if d._panic != nil {
		throw("deferproc: d.panic != nil after newdefer")
	}
    // 变量的初始化信息
	d.link = gp._defer
	gp._defer = d
	d.fn = fn
	d.pc = callerpc
	d.sp = sp
	switch siz { // 关于siz的值的处理
	case 0:
		// Do nothing.
	case sys.PtrSize:
		*(*uintptr)(deferArgs(d)) = *(*uintptr)(unsafe.Pointer(argp))
	default:
		memmove(deferArgs(d), unsafe.Pointer(argp), uintptr(siz))
	}

	// deferproc returns 0 normally.
	// a deferred func that stops a panic
	// makes the deferproc return 1.
	// the code the compiler generates always
	// checks the return value and jumps to the
	// end of the function if deferproc returns != 0.
    // 正常返回0,异常返回1
	return0()
	// No code can go here - the C return register has
	// been set and must not be clobbered.
}
```

#### newdefer

```go
// Allocate a Defer, usually using per-P pool. // pool池子
// Each defer must be released with freedefer.  The defer is not
// added to any defer chain yet.
//
// This must not grow the stack because there may be a frame without
// stack map information when this is called.
//
//go:nosplit
func newdefer(siz int32) *_defer {
	var d *_defer
	sc := deferclass(uintptr(siz)) // 计算sc
	gp := getg()
	if sc < uintptr(len(p{}.deferpool)) {
		pp := gp.m.p.ptr()
		if len(pp.deferpool[sc]) == 0 && sched.deferpool[sc] != nil {
			// Take the slow path on the system stack so
			// we don't grow newdefer's stack.
            // 当缓存没有值了，就从全局pool中搞出来一部分
			systemstack(func() {
				lock(&sched.deferlock)
				for len(pp.deferpool[sc]) < cap(pp.deferpool[sc])/2 && sched.deferpool[sc] != nil {
					d := sched.deferpool[sc]
					sched.deferpool[sc] = d.link
					d.link = nil
					pp.deferpool[sc] = append(pp.deferpool[sc], d)
				}
				unlock(&sched.deferlock)
			})
		}
		if n := len(pp.deferpool[sc]); n > 0 {
			d = pp.deferpool[sc][n-1]
			pp.deferpool[sc][n-1] = nil
			pp.deferpool[sc] = pp.deferpool[sc][:n-1]
		}
	}
	if d == nil {
		// Allocate new defer+args.
        // 全局的pool不足/args过长
		systemstack(func() {
			total := roundupsize(totaldefersize(uintptr(siz)))
			d = (*_defer)(mallocgc(total, deferType, true))
		})
		if debugCachedWork {
			// Duplicate the tail below so if there's a
			// crash in checkPut we can tell if d was just
			// allocated or came from the pool.
			d.siz = siz
			d.link = gp._defer // 与之前绑定的g形成链表
			gp._defer = d
			return d
		}
	}
	d.siz = siz
	d.heap = true
	return d
}
```

#### [deferprocStack](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/panic.go#L271)

```go
// deferprocStack queues a new deferred function with a defer record on the stack.
// The defer record must have its siz and fn fields initialized. siz和fn必须初始化
// All other fields can contain junk.
// The defer record must be immediately followed in memory by
// the arguments of the defer.
// Nosplit because the arguments on the stack won't be scanned
// until the defer record is spliced into the gp._defer list.
//go:nosplit
func deferprocStack(d *_defer) {
	gp := getg() // 获取当前的g,也说明一件事,这个defer和g是相关联的哦
	if gp.m.curg != gp {
		// go code on the system stack can't defer
		throw("defer on system stack")
	}
	// siz and fn are already set.
	// The other fields are junk on entry to deferprocStack and
	// are initialized here. 
    // 这里写的很清楚了,siz和fn必须 提前初始化,其它的变量在这初始化.
	d.started = false
	d.heap = false
	d.openDefer = false
	d.sp = getcallersp()
	d.pc = getcallerpc()
	d.framepc = 0
	d.varp = 0
	// The lines below implement:
	//   d.panic = nil
	//   d.fd = nil
	//   d.link = gp._defer
	//   gp._defer = d
	// But without write barriers. The first three are writes to
	// the stack so they don't need a write barrier, and furthermore
	// are to uninitialized memory, so they must not use a write barrier.
	// The fourth write does not require a write barrier because we
	// explicitly mark all the defer structures, so we don't need to
	// keep track of pointers to them with a write barrier.
	*(*uintptr)(unsafe.Pointer(&d._panic)) = 0
	*(*uintptr)(unsafe.Pointer(&d.fd)) = 0
	*(*uintptr)(unsafe.Pointer(&d.link)) = uintptr(unsafe.Pointer(gp._defer))
	*(*uintptr)(unsafe.Pointer(&gp._defer)) = uintptr(unsafe.Pointer(d))

	return0()
	// No code can go here - the C return register has
	// been set and must not be clobbered.
}

```

#### [deferreturn](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/panic.go#L528)

```go
// Run a deferred function if there is one.
// The compiler inserts a call to this at the end of any
// function which calls defer.
// If there is a deferred function, this will call runtime·jmpdefer,
// which will jump to the deferred function such that it appears
// to have been called by the caller of deferreturn at the point
// just before deferreturn was called. The effect is that deferreturn
// is called again and again until there are no more deferred functions.
//
// Declared as nosplit, because the function should not be preempted once we start
// modifying the caller's frame in order to reuse the frame to call the deferred
// function.
//
// The single argument isn't actually used - it just has its address
// taken so it can be matched against pending defers.
//go:nosplit
func deferreturn(arg0 uintptr) {
	gp := getg()
	d := gp._defer
	if d == nil { // 递归调用的终止条件
		return
	}
	sp := getcallersp() 
	if d.sp != sp { // 当前的调用栈和defer中是否相同
		return
	}
	if d.openDefer {
		done := runOpenDeferFrame(gp, d)
		if !done {
			throw("unfinished open-coded defers in deferreturn")
		}
		gp._defer = d.link
		freedefer(d)
		return
	}

	// Moving arguments around.
	//
	// Everything called after this point must be recursively
	// nosplit because the garbage collector won't know the form
	// of the arguments until the jmpdefer can flip the PC over to
	// fn.
	switch d.siz {
	case 0:
		// Do nothing.
	case sys.PtrSize:
		*(*uintptr)(unsafe.Pointer(&arg0)) = *(*uintptr)(deferArgs(d))
	default:
		memmove(unsafe.Pointer(&arg0), deferArgs(d), uintptr(d.siz))
	}
	fn := d.fn
	d.fn = nil
	gp._defer = d.link
	freedefer(d) // 释放d,重新放回pool中
	// If the defer function pointer is nil, force the seg fault to happen
	// here rather than in jmpdefer. gentraceback() throws an error if it is
	// called with a callback on an LR architecture and jmpdefer is on the
	// stack, because the stack trace can be incorrect in that case - see
	// issue #8153).
	_ = fn.fn
	jmpdefer(fn, uintptr(unsafe.Pointer(&arg0)))
}

```


### panic

#### [官方定义-->](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L903)


```go
// A _panic holds information about an active panic.
//
// This is marked go:notinheap because _panic values must only ever
// live on the stack.
//
// The argp and link fields are stack pointers, but don't need special
// handling during stack growth: because they are pointer-typed and
// _panic values only live on the stack, regular stack pointer
// adjustment takes care of them.
//
//go:notinheap
type _panic struct {
	argp      unsafe.Pointer // pointer to arguments of deferred call run during panic; cannot move - known to liblink
	arg       interface{}    // argument to panic
	link      *_panic        // link to earlier panic
	pc        uintptr        // where to return to in runtime if this panic is bypassed
	sp        unsafe.Pointer // where to return to in runtime if this panic is bypassed
	recovered bool           // whether this panic is over // recover标识
	aborted   bool           // the panic was aborted // 终止标记
	goexit    bool
}

```

#### [gopanic](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/panic.go#L889)

```go
// reflectcallSave calls reflectcall after saving the caller's pc and sp in the
// panic record. This allows the runtime to return to the Goexit defer processing
// loop, in the unusual case where the Goexit may be bypassed by a successful
// recover.
func reflectcallSave(p *_panic, fn, arg unsafe.Pointer, argsize uint32) {
	if p != nil {
		p.argp = unsafe.Pointer(getargp(0))
		p.pc = getcallerpc()
		p.sp = unsafe.Pointer(getcallersp())
	}
	reflectcall(nil, fn, arg, argsize, argsize)
	if p != nil {
		p.pc = 0
		p.sp = unsafe.Pointer(nil)
	}
}

// The implementation of the predeclared function panic.
func gopanic(e interface{}) {
	gp := getg()
	if gp.m.curg != gp {
		print("panic: ")
		printany(e)
		print("\n")
		throw("panic on system stack")
	}

	if gp.m.mallocing != 0 {
		print("panic: ")
		printany(e)
		print("\n")
		throw("panic during malloc")
	}
	if gp.m.preemptoff != "" {
		print("panic: ")
		printany(e)
		print("\n")
		print("preempt off reason: ")
		print(gp.m.preemptoff)
		print("\n")
		throw("panic during preemptoff")
	}
	if gp.m.locks != 0 {
		print("panic: ")
		printany(e)
		print("\n")
		throw("panic holding locks")
	}

	var p _panic
	p.arg = e
	p.link = gp._panic
	gp._panic = (*_panic)(noescape(unsafe.Pointer(&p)))

	atomic.Xadd(&runningPanicDefers, 1)

	// By calculating getcallerpc/getcallersp here, we avoid scanning the
	// gopanic frame (stack scanning is slow...)
	addOneOpenDeferFrame(gp, getcallerpc(), unsafe.Pointer(getcallersp()))
	//	遍历链表
	for {
		d := gp._defer
		if d == nil {
			break
		}

		// If defer was started by earlier panic or Goexit (and, since we're back here, that triggered a new panic),
		// take defer off list. An earlier panic will not continue running, but we will make sure below that an
		// earlier Goexit does continue running.
		if d.started { // 已经启动
			if d._panic != nil {
				d._panic.aborted = true
			}
			d._panic = nil
			if !d.openDefer { // 没有打开则跳过
				// For open-coded defers, we need to process the
				// defer again, in case there are any other defers
				// to call in the frame (not including the defer
				// call that caused the panic).
				d.fn = nil
				gp._defer = d.link
				freedefer(d)
				continue
			}
		}

		// Mark defer as started, but keep on list, so that traceback
		// can find and update the defer's argument frame if stack growth
		// or a garbage collection happens before reflectcall starts executing d.fn.
		d.started = true //初始化

		// Record the panic that is running the defer.
		// If there is a new panic during the deferred call, that panic
		// will find d in the list and will mark d._panic (this panic) aborted.
		// 记录这个panic，如果在运行期间有了新的panic，标记这个Panic abort=true(强制终止)
		d._panic = (*_panic)(noescape(unsafe.Pointer(&p)))

		done := true
		if d.openDefer {
			done = runOpenDeferFrame(gp, d)
			if done && !d._panic.recovered {
				addOneOpenDeferFrame(gp, 0, nil)
			}
		} else {
			p.argp = unsafe.Pointer(getargp(0))
			// 调用defer
			reflectcall(nil, unsafe.Pointer(d.fn), deferArgs(d), uint32(d.siz), uint32(d.siz))
		}
		p.argp = nil

		// reflectcall did not panic. Remove d.
		if gp._defer != d {
			throw("bad defer entry in panic")
		}
		d._panic = nil

		// trigger shrinkage to test stack copy. See stack_test.go:TestStackPanic
		//GC()

		pc := d.pc
		sp := unsafe.Pointer(d.sp) // must be pointer so it gets adjusted during stack copy
		if done {
			d.fn = nil
			gp._defer = d.link // 遍历下一个
			freedefer(d)
		}
		if p.recovered { // 已经有recover被调用
			gp._panic = p.link
			if gp._panic != nil && gp._panic.goexit && gp._panic.aborted {
				// A normal recover would bypass/abort the Goexit.  Instead,
				// we return to the processing loop of the Goexit.
				gp.sigcode0 = uintptr(gp._panic.sp)
				gp.sigcode1 = uintptr(gp._panic.pc)
				mcall(recovery)
				throw("bypassed recovery failed") // mcall should not return
			}
			atomic.Xadd(&runningPanicDefers, -1)

			if done {
				// Remove any remaining non-started, open-coded
				// defer entries after a recover, since the
				// corresponding defers will be executed normally
				// (inline). Any such entry will become stale once
				// we run the corresponding defers inline and exit
				// the associated stack frame.
				d := gp._defer
				var prev *_defer
				for d != nil {
					if d.openDefer {
						if d.started {
							// This defer is started but we
							// are in the middle of a
							// defer-panic-recover inside of
							// it, so don't remove it or any
							// further defer entries
							break
						}
						if prev == nil {
							gp._defer = d.link
						} else {
							prev.link = d.link
						}
						newd := d.link
						freedefer(d)
						d = newd
					} else {
						prev = d
						d = d.link
					}
				}
			}

			gp._panic = p.link
			// Aborted panics are marked but remain on the g.panic list.
			// Remove them from the list.
			for gp._panic != nil && gp._panic.aborted {
				gp._panic = gp._panic.link
			}
			if gp._panic == nil { // must be done with signal
				gp.sig = 0
			}
			// Pass information about recovering frame to recovery.
			gp.sigcode0 = uintptr(sp)
			gp.sigcode1 = pc
			mcall(recovery)
			throw("recovery failed") // mcall should not return
		}
	}

	// ran out of deferred calls - old-school panic now
	// Because it is unsafe to call arbitrary user code after freezing
	// the world, we call preprintpanics to invoke all necessary Error
	// and String methods to prepare the panic strings before startpanic.
	preprintpanics(gp._panic)

	fatalpanic(gp._panic) // should not return
	*(*int)(nil) = 0      // not reached
}
```

### recover

#### 官方定义
>panic中的一个bool型
recovered bool           // whether this panic is over // recover标识

#### 实现

```go
// The implementation of the predeclared function recover.
// Cannot split the stack because it needs to reliably
// find the stack segment of its caller.
//
// TODO(rsc): Once we commit to CopyStackAlways,
// this doesn't need to be nosplit.
//go:nosplit
func gorecover(argp uintptr) interface{} {
	// Must be in a function running as part of a deferred call during the panic.
	// Must be called from the topmost function of the call
	// (the function used in the defer statement).
	// p.argp is the argument pointer of that topmost deferred function call.
	// Compare against argp reported by caller.
	// If they match, the caller is the one who can recover.
	gp := getg()
	p := gp._panic
	if p != nil && !p.goexit && !p.recovered && argp == uintptr(p.argp) {
		p.recovered = true // revover标识为true
		return p.arg
	}
	return nil
}

```
### 拓展:「下面程序会输出什么值」

#### eg-1:
```go
package main

import "fmt"

func main() {
	defer func() {
		if err:=recover();err!= nil {
			fmt.Println("===>",err)
		}
	}()
	f()

	select {
	}
}

func f() {
	defer func() {
		if err:=recover();err!= nil {
			fmt.Println("===",err)
		}
	}()
	go func() {
		defer sum(1, 2)
		panic(1)
	}()

}

func sum(a, b int) int {
	return a + b
}

```

##### output:

```go
panic: 1

goroutine 18 [running]:
main.f.func2()
        /Users/k/learn/go-memory/src/main/ssp.go:26 +0x6d
created by main.f
        /Users/k/learn/go-memory/src/main/ssp.go:24 +0x57
```

#### eg-2:

```go
package main

import "fmt"

func main() {
	defer func() {
		if err:=recover();err!= nil {
			fmt.Println("===>",err)
		}
	}()
	f()

	select {
	}
}

func f() {

	go func() {
		defer sum(1, 2)
		defer func() {
			if err:=recover();err!= nil {
				fmt.Println("===",err)
			}
		}()
		panic(1)
	}()

}

func sum(a, b int) int {
	return a + b
}

```

```go
=== 1
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [select (no cases)]:
main.main()
        /Users/k/learn/go-memory/src/main/ssp.go:13 +0x4a
```


#### eg-3:

```go
package main

import "fmt"

func main() {
	defer func() {
		if err:=recover();err!= nil {
			fmt.Println("===>",err)
		}
	}()
	f()

	select {
	}
}

func f() {
	defer func() {
		if err:=recover();err!= nil {
			fmt.Println("panic--f ===",err)
		}
	}()
	go func() {
		defer sum(1, 2)
		defer func() {
			if err:=recover();err!= nil {
				fmt.Println("===",err)
			}
		}()
		panic(1)
	}()

}

func sum(a, b int) int {
	return a + b
}

```

```go

=== 1
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [select (no cases)]:
main.main()
        /Users/k/learn/go-memory/src/main/ssp.go:13 +0x4a

```