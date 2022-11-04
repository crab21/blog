---
title: 「39」Go select源码实现分析
date: '2021/2/22 12:10:17'
updated: '2021/2/23 21:10:17'
keywords: 'Go,select,selectgo源码'
tags:
  - Go
  - 源码
  - Day
mathjax: true
abbrlink: e1051649
---

### 前序

关于Go中select的特性，很多坑，也容易栽。

好奇底层 到计算机层面到底是如何处理的？！

如果有Go的相关经验，就晓得select经常性配合chan一起来使用，
有个问题：线程安全吗？ 多个case到底是如何选择的？ 随机么？why?

<!--more-->
### version
>go version 1.14

### 简单使用

>例1:

```go
package main

import "fmt"

func SelectGo(cc, end chan int) {
	x, y := -1, 0
	for {
		select {
		case cc <- x:
			x, y = y, x+y
		case <-end:
			fmt.Println("end")
			return
		}
	}
}
```

>上面的结构会等待 cc <- x或者 <-end两个任意一个返回，无论哪个表达式返回都会立刻执行case的代码块。

>当select中的两个case都满足条件，那就随机触发其中一个。


#### 汇编实现：

```go

$ go tool compile -N -l -S sselect.go 
"".SelectGo STEXT size=490 args=0x10 locals=0xf0 funcid=0x0 
        // SelectGo 函数
        0x0000 00000 (sselect.go:5)     TEXT    "".SelectGo(SB), ABIInternal, $240-16
        0x0000 00000 (sselect.go:5)     MOVQ    (TLS), CX
        0x0009 00009 (sselect.go:5)     LEAQ    -112(SP), AX
        0x000e 00014 (sselect.go:5)     CMPQ    AX, 16(CX)
        0x0012 00018 (sselect.go:5)     PCDATA  $0, $-2
        0x0012 00018 (sselect.go:5)     JLS     480
        0x0018 00024 (sselect.go:5)     PCDATA  $0, $-1
        0x0018 00024 (sselect.go:5)     SUBQ    $240, SP
        0x001f 00031 (sselect.go:5)     MOVQ    BP, 232(SP)
        0x0027 00039 (sselect.go:5)     LEAQ    232(SP), BP
        0x002f 00047 (sselect.go:5)     FUNCDATA        $0, gclocals·dc9b0298814590ca3ffc3a889546fc8b(SB)
        0x002f 00047 (sselect.go:5)     FUNCDATA        $1, gclocals·90105ebf2cf472b05305b6351ad183b7(SB)
        0x002f 00047 (sselect.go:5)     FUNCDATA        $2, "".SelectGo.stkobj(SB)
        0x002f 00047 (sselect.go:6)     MOVQ    $0, "".x+80(SP)
        0x0038 00056 (sselect.go:6)     MOVQ    $1, "".y+72(SP)
        0x0041 00065 (sselect.go:7)     JMP     67
        0x0043 00067 (sselect.go:9)     JMP     69
        0x0045 00069 (sselect.go:9)     MOVQ    "".c+248(SP), AX
        0x004d 00077 (sselect.go:9)     MOVQ    AX, ""..autotmp_4+128(SP)
        0x0055 00085 (sselect.go:9)     MOVQ    "".x+80(SP), AX
        0x005a 00090 (sselect.go:9)     MOVQ    AX, ""..autotmp_5+96(SP)
        0x005f 00095 (sselect.go:11)    MOVQ    "".quit+256(SP), AX
        0x0067 00103 (sselect.go:11)    MOVQ    AX, ""..autotmp_6+120(SP)
        0x006c 00108 (sselect.go:8)     XORPS   X0, X0
        0x006f 00111 (sselect.go:8)     MOVUPS  X0, ""..autotmp_8+200(SP)
        0x0077 00119 (sselect.go:8)     MOVUPS  X0, ""..autotmp_8+216(SP)
        0x007f 00127 (sselect.go:9)     MOVQ    ""..autotmp_4+128(SP), AX
        0x0087 00135 (sselect.go:9)     MOVQ    AX, ""..autotmp_8+200(SP)
        0x008f 00143 (sselect.go:9)     LEAQ    ""..autotmp_5+96(SP), AX
        0x0094 00148 (sselect.go:9)     MOVQ    AX, ""..autotmp_8+208(SP)
        0x009c 00156 (sselect.go:11)    MOVQ    ""..autotmp_6+120(SP), AX
        0x00a1 00161 (sselect.go:11)    MOVQ    AX, ""..autotmp_8+216(SP)
        0x00a9 00169 (sselect.go:8)     LEAQ    ""..autotmp_8+200(SP), AX
        0x00b1 00177 (sselect.go:8)     MOVQ    AX, ""..autotmp_12+152(SP)
        0x00b9 00185 (sselect.go:8)     LEAQ    ""..autotmp_9+88(SP), AX
        0x00be 00190 (sselect.go:8)     MOVQ    AX, ""..autotmp_13+144(SP)
        0x00c6 00198 (sselect.go:8)     MOVQ    ""..autotmp_12+152(SP), CX
        0x00ce 00206 (sselect.go:8)     MOVQ    CX, (SP)
        0x00d2 00210 (sselect.go:8)     MOVQ    AX, 8(SP)
        0x00d7 00215 (sselect.go:8)     MOVQ    $0, 16(SP)
        0x00e0 00224 (sselect.go:8)     MOVQ    $1, 24(SP)
        0x00e9 00233 (sselect.go:8)     MOVQ    $1, 32(SP)
        0x00f2 00242 (sselect.go:8)     MOVB    $1, 40(SP)
        0x00f7 00247 (sselect.go:8)     PCDATA  $1, $0
        0x00f7 00247 (sselect.go:8)     CALL    runtime.selectgo(SB)
        0x00fc 00252 (sselect.go:8)     MOVQ    48(SP), AX
        0x0101 00257 (sselect.go:8)     MOVBLZX 56(SP), CX
        0x0106 00262 (sselect.go:8)     MOVQ    AX, ""..autotmp_10+112(SP)
        0x010b 00267 (sselect.go:8)     MOVB    CL, ""..autotmp_11+71(SP)
        0x010f 00271 (sselect.go:9)     CMPQ    ""..autotmp_10+112(SP), $0
        0x0115 00277 (sselect.go:9)     JEQ     281
        0x0117 00279 (sselect.go:9)     JMP     327
        0x0119 00281 (sselect.go:10)    MOVQ    "".x+80(SP), AX
        0x011e 00286 (sselect.go:10)    ADDQ    "".y+72(SP), AX
        0x0123 00291 (sselect.go:10)    MOVQ    AX, ""..autotmp_14+104(SP)
        0x0128 00296 (sselect.go:10)    MOVQ    "".y+72(SP), AX
        0x012d 00301 (sselect.go:10)    MOVQ    AX, "".x+80(SP)
        0x0132 00306 (sselect.go:10)    MOVQ    ""..autotmp_14+104(SP), AX
        0x0137 00311 (sselect.go:10)    MOVQ    AX, "".y+72(SP)
        0x013c 00316 (sselect.go:9)     JMP     318
        0x013e 00318 (sselect.go:9)     PCDATA  $1, $-1
        0x013e 00318 (sselect.go:9)     NOP
        0x0140 00320 (sselect.go:9)     JMP     322
        0x0142 00322 (sselect.go:9)     JMP     67
        0x0147 00327 (sselect.go:11)    CMPQ    ""..autotmp_10+112(SP), $1
        0x014d 00333 (sselect.go:11)    JEQ     340
        0x014f 00335 (sselect.go:11)    JMP     478
        0x0154 00340 (sselect.go:12)    XORPS   X0, X0
        0x0157 00343 (sselect.go:12)    MOVUPS  X0, ""..autotmp_7+160(SP)
        0x015f 00351 (sselect.go:12)    LEAQ    ""..autotmp_7+160(SP), AX
        0x0167 00359 (sselect.go:12)    MOVQ    AX, ""..autotmp_16+136(SP)
        0x016f 00367 (sselect.go:12)    TESTB   AL, (AX)
        0x0171 00369 (sselect.go:12)    LEAQ    type.string(SB), CX
        0x0178 00376 (sselect.go:12)    MOVQ    CX, ""..autotmp_7+160(SP)
        0x0180 00384 (sselect.go:12)    LEAQ    ""..stmp_0(SB), CX
        0x0187 00391 (sselect.go:12)    MOVQ    CX, ""..autotmp_7+168(SP)
        0x018f 00399 (sselect.go:12)    TESTB   AL, (AX)
        0x0191 00401 (sselect.go:12)    JMP     403
        0x0193 00403 (sselect.go:12)    MOVQ    AX, ""..autotmp_15+176(SP)
        0x019b 00411 (sselect.go:12)    MOVQ    $1, ""..autotmp_15+184(SP)
        0x01a7 00423 (sselect.go:12)    MOVQ    $1, ""..autotmp_15+192(SP)
        0x01b3 00435 (sselect.go:12)    MOVQ    AX, (SP)
        0x01b7 00439 (sselect.go:12)    MOVQ    $1, 8(SP)
        0x01c0 00448 (sselect.go:12)    MOVQ    $1, 16(SP)
        0x01c9 00457 (sselect.go:12)    PCDATA  $1, $1
        0x01c9 00457 (sselect.go:12)    CALL    fmt.Println(SB)
        0x01ce 00462 (sselect.go:13)    MOVQ    232(SP), BP
        0x01d6 00470 (sselect.go:13)    ADDQ    $240, SP
        0x01dd 00477 (sselect.go:13)    RET
        0x01de 00478 (sselect.go:11)    PCDATA  $1, $-1
        0x01de 00478 (sselect.go:11)    XCHGL   AX, AX
        0x01df 00479 (sselect.go:11)    NOP
        0x01df 00479 (sselect.go:5)     PCDATA  $1, $-1
        0x01df 00479 (sselect.go:5)     PCDATA  $0, $-2
        0x01df 00479 (sselect.go:5)     NOP
        0x01e0 00480 (sselect.go:5)     CALL    runtime.morestack_noctxt(SB)
        0x01e5 00485 (sselect.go:5)     PCDATA  $0, $-1
        0x01e5 00485 (sselect.go:5)     JMP     0
        ......
        ....
        ...
        ..
        .
```


### 场景


#### 非阻塞式：

```go
func main() {
	ch := make(chan int)
	select {
	case i := <-ch:
		println(i)

	default:
		println("default")
	}
}

$ go run main.go
default
```

>select同时监听多个case是否可执行，如果多个case不可执行，有default就执行。

#### 随机执行

>关于下面的程序到底是打印什么？

```go
func main() {
	ch := make(chan int)

	go func() {
		for range time.Tick(1 * time.Second) {
			ch <- 0
		}
	}()

	for {
		select {
		case <-ch:
			println("case1")
		case <-ch:
			println("case2")
		}

	}
}
```

##### outputs:

* 随机性
```go
case1
case2
case1
...
```

### 正题：为何是随机？

#### [select case的结构](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/select.go#L29)

```go
type scase struct {
	c           *hchan         // chan
	elem        unsafe.Pointer // data element
	kind        uint16
	pc          uintptr // race pc (for race detector / msan)
	releasetime int64
}
```

#### 实现原理

* go对于中间代码会有部分的优化： [walkselectcases](https://github.com/golang/go/blob/release-branch.go1.14/src/cmd/compile/internal/gc/select.go#L108)


```go
func walkselectcases(cases *Nodes) []*Node {
	ncas := cases.Len()
	sellineno := lineno

	// optimization: zero-case select 没有case的情况
	if ncas == 0 {
		return []*Node{mkcall("block", nil, nil)}
	}

	// optimization: one-case select: single op.
	if ncas == 1 {
        ..........
        ........
        ......
        ...
        ..
        .
    
}
```
##### 随机化原因？

![](https://github.com/crab21/Images/tree/master/clipboard_20210223_052947.png)

* 关于fastrandn后面单独分析吧，还挺有意思的。

##### 没有case,单单一个select情况:

>前几行就写的很清楚了。

```go
func block() {
	gopark(nil, nil, waitReasonSelectNoCases, traceEvGoStop, 1) // forever
}
```

###### 多看一步：
* waitReasonSelectNoCases干嘛的？

这里逻列了g wait的所有情况，有什么用，不是这次研究的重点！
有兴趣可以下来查查，看看哪里都用到了。
[链接🔗](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L948)

```go
const (
	waitReasonZero                  waitReason = iota // ""
	waitReasonGCAssistMarking                         // "GC assist marking"
	waitReasonIOWait                                  // "IO wait"
	waitReasonChanReceiveNilChan                      // "chan receive (nil chan)"
	waitReasonChanSendNilChan                         // "chan send (nil chan)"
	waitReasonDumpingHeap                             // "dumping heap"
	waitReasonGarbageCollection                       // "garbage collection"
	waitReasonGarbageCollectionScan                   // "garbage collection scan"
	waitReasonPanicWait                               // "panicwait"
	waitReasonSelect                                  // "select"
	waitReasonSelectNoCases                           // "select (no cases)"
	waitReasonGCAssistWait                            // "GC assist wait"
	waitReasonGCSweepWait                             // "GC sweep wait"
	waitReasonGCScavengeWait                          // "GC scavenge wait"
	waitReasonChanReceive                             // "chan receive"
	waitReasonChanSend                                // "chan send"
	waitReasonFinalizerWait                           // "finalizer wait"
	waitReasonForceGGIdle                             // "force gc (idle)"
	waitReasonSemacquire                              // "semacquire"
	waitReasonSleep                                   // "sleep"
	waitReasonSyncCondWait                            // "sync.Cond.Wait"
	waitReasonTimerGoroutineIdle                      // "timer goroutine (idle)"
	waitReasonTraceReaderBlocked                      // "trace reader (blocked)"
	waitReasonWaitForGCCycle                          // "wait for GC cycle"
	waitReasonGCWorkerIdle                            // "GC worker (idle)"
	waitReasonPreempted                               // "preempted"
)
```


##### 非阻塞的操作

像例子1那样，如果两个case，包含一个default，则为非阻塞的操作。
[walkselectcases](https://github.com/golang/go/blob/release-branch.go1.14/src/cmd/compile/internal/gc/select.go#L108)

```go
func walkselectcases(cases *Nodes) []*Node {
	ncas := cases.Len()
	sellineno := lineno

	// optimization: zero-case select
	if ncas == 0 {
		return []*Node{mkcall("block", nil, nil)}
	}

	// optimization: one-case select: single op.
	if ncas == 1 {
        // 包含default的情况
		cas := cases.First()
		setlineno(cas)
		l := cas.Ninit.Slice()
		if cas.Left != nil { // not default:
			n := cas.Left
			l = append(l, n.Ninit.Slice()...)
			n.Ninit.Set(nil)
			switch n.Op {
			default:
				Fatalf("select %v", n.Op)

			case OSEND:
				// already ok

			case OSELRECV, OSELRECV2:
				if n.Op == OSELRECV || n.List.Len() == 0 {
					if n.Left == nil {
						n = n.Right
					} else {
						n.Op = OAS
					}
					break
				}

				if n.Left == nil {
					nblank = typecheck(nblank, ctxExpr|ctxAssign)
					n.Left = nblank
				}

				n.Op = OAS2
				n.List.Prepend(n.Left)
				n.Rlist.Set1(n.Right)
				n.Right = nil
				n.Left = nil
				n.SetTypecheck(0)
				n = typecheck(n, ctxStmt)
			}

			l = append(l, n)
		}

		l = append(l, cas.Nbody.Slice()...)
		l = append(l, nod(OBREAK, nil, nil))
		return l
	}

    ....

}

```

#### 流程化问题


* 1、将所有的case转换成包含channel等信息的[runtime.scase结构](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/select.go#L29)
* 2、调用运行时函数selectgo从多个就绪的channel中选择一个可以执行的scase结构体。
* 3、for循环生成一组if语句，判断case是否被选中。

##### case转换为if的情况：

[reflect_rselect🔗](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/select.go#L542)

```go
//go:linkname reflect_rselect reflect.rselect
func reflect_rselect(cases []runtimeSelect) (int, bool) {
	if len(cases) == 0 {
		block()
	}
	sel := make([]scase, len(cases)) // 初始化
	orig := make([]int, len(cases))
	nsends, nrecvs := 0, 0
	dflt := -1
	for i, rc := range cases {
		var j int
		switch rc.dir {
		case selectDefault:
			dflt = i
			continue
		case selectSend:
			j = nsends
			nsends++
		case selectRecv:
			nrecvs++
			j = len(cases) - nrecvs
		}

		sel[j] = scase{c: rc.ch, elem: rc.val}
		orig[j] = i
	}

	// Only a default case. 只有default的情况
	if nsends+nrecvs == 0 {
		return dflt, false
	}

	// Compact sel and orig if necessary.
	if nsends+nrecvs < len(cases) {
		copy(sel[nsends:], sel[len(cases)-nrecvs:])
		copy(orig[nsends:], orig[len(cases)-nrecvs:])
	}

	order := make([]uint16, 2*(nsends+nrecvs))
	var pc0 *uintptr
	if raceenabled {
		pcs := make([]uintptr, nsends+nrecvs)
		for i := range pcs {
			selectsetpc(&pcs[i])
		}
		pc0 = &pcs[0]
	}
	//调用selectgo获取结果
	chosen, recvOK := selectgo(&sel[0], &order[0], pc0, nsends, nrecvs, dflt == -1)

	// Translate chosen back to caller's ordering.
	if chosen < 0 {
		chosen = dflt
	} else {
		chosen = orig[chosen]
	}
	return chosen, recvOK
}

```

#### selectgo主循环

>selectgo会根据不通的逻辑判断,跳转到不通的逻辑中,主要分为如下几部分:

* bufrecv 可以从缓存区读取数据
* bufsend 可以向缓存区写入数据
* recv 可以从休眠的发送方获取数据
* send 可以向休眠的接收方发送数据
* rclose 可以从关闭的channel读取EOF
* sclose 可以向关闭的channel发送数据
* retc 结束调用并返回

##### send & recv分析 

```go
.
..
...
....
.....

loop:
	// pass 1 - look for something already waiting
	var dfli int
	var dfl *scase
	var casi int
	var cas *scase
	var recvOK bool
	for i := 0; i < ncases; i++ {
		casi = int(pollorder[i])
		cas = &scases[casi]
		c = cas.c

		switch cas.kind {
		case caseNil:
			continue

		case caseRecv:
			sg = c.sendq.dequeue()
			if sg != nil {
				goto recv
			}
			if c.qcount > 0 {
				//缓存区total>0
				goto bufrecv
			}
			if c.closed != 0 {
				// chan已经关闭
				goto rclose
			}

		case caseSend:
			if raceenabled {
				racereadpc(c.raceaddr(), cas.pc, chansendpc)
			}
			if c.closed != 0 {
				// channel关闭了,但是向其发送消息
				goto sclose
			}
			sg = c.recvq.dequeue()
			if sg != nil {
				// 向出队的channel发送消息
				goto send
			}
			if c.qcount < c.dataqsiz {

				goto bufsend
			}

		case caseDefault:
			dfli = casi
			dfl = cas
		}
	}
.....
....
...
..
.
```

>这里可能要温习下hchan结构:

```go

type hchan struct {
	qcount   uint           // total data in the queue
	dataqsiz uint           // size of the circular queue
	buf      unsafe.Pointer // points to an array of dataqsiz elements
	elemsize uint16
	closed   uint32
	elemtype *_type // element type
	sendx    uint   // send index
	recvx    uint   // receive index
	recvq    waitq  // list of recv waiters
	sendq    waitq  // list of send waiters

	// lock protects all fields in hchan, as well as several
	// fields in sudogs blocked on this channel.
	//
	// Do not change another G's status while holding this lock
	// (in particular, do not ready a G), as this can deadlock
	// with stack shrinking.
	lock mutex
}
```

##### bufrecv:

```go
bufrecv:
	// can receive from buffer
	if raceenabled {
		if cas.elem != nil {
			raceWriteObjectPC(c.elemtype, cas.elem, cas.pc, chanrecvpc)
		}
		raceacquire(chanbuf(c, c.recvx))
		racerelease(chanbuf(c, c.recvx))
	}
	if msanenabled && cas.elem != nil {
		msanwrite(cas.elem, c.elemtype.size)
	}
	// recv 赋值
	recvOK = true
	qp = chanbuf(c, c.recvx) // chan指针指向
	if cas.elem != nil { 
		typedmemmove(c.elemtype, cas.elem, qp)
	}
	typedmemclr(c.elemtype, qp)
	c.recvx++
	if c.recvx == c.dataqsiz {
		c.recvx = 0
	}
	c.qcount--
	selunlock(scases, lockorder)
	goto retc

```

##### bufsend:

```go
bufsend:
	// can send to buffer
	if raceenabled {
		raceacquire(chanbuf(c, c.sendx))
		racerelease(chanbuf(c, c.sendx))
		raceReadObjectPC(c.elemtype, cas.elem, cas.pc, chansendpc)
	}
	if msanenabled {
		msanread(cas.elem, c.elemtype.size)
	}
	typedmemmove(c.elemtype, chanbuf(c, c.sendx), cas.elem)
	c.sendx++
	if c.sendx == c.dataqsiz { // 缓存区满了
		c.sendx = 0
	}
	c.qcount++
	selunlock(scases, lockorder)
	goto retc
```

##### recv:

```go
recv:
	// can receive from sleeping sender (sg)
	recv(c, sg, cas.elem, func() { selunlock(scases, lockorder) }, 2)
	if debugSelect {
		print("syncrecv: cas0=", cas0, " c=", c, "\n")
	}
	recvOK = true
	goto retc

```

##### rclose:

```go
	// read at end of closed channel
	selunlock(scases, lockorder)
	recvOK = false
	if cas.elem != nil {
		typedmemclr(c.elemtype, cas.elem)
	}
	if raceenabled {
		raceacquire(c.raceaddr())
	}
	goto retc
```

##### send:

```go
send:
	// can send to a sleeping receiver (sg)
	if raceenabled {
		raceReadObjectPC(c.elemtype, cas.elem, cas.pc, chansendpc)
	}
	if msanenabled {
		msanread(cas.elem, c.elemtype.size)
	}
	// send函数
	send(c, sg, cas.elem, func() { selunlock(scases, lockorder) }, 2)
	if debugSelect {
		print("syncsend: cas0=", cas0, " c=", c, "\n")
	}
	goto retc
```

##### sclose:

```go
sclose:
	// send on closed channel
	selunlock(scases, lockorder)
	// 向一个close的channel发送消息,就发生panic
	panic(plainError("send on closed channel"))
}
```


##### retc:

```go
retc:
	if cas.releasetime > 0 {
		blockevent(cas.releasetime-t0, 1)
	}
	return casi, recvOK
```

#### channel的recv和send方式:

```go

1、当 case 不包含 Channel 时；
    这种 case 会被跳过；
2、当 case 会从 Channel 中recv数据时；
    如果当前 Channel 的 sendq 上有等待的 Goroutine，就会跳到 recv 标签并从缓冲区读取数据后将等待 Goroutine 中的数据放入到缓冲区中相同的位置；
    如果当前 Channel 的缓冲区不为空，就会跳到 bufrecv 标签处从缓冲区获取数据；
    如果当前 Channel 已经被关闭，就会跳到 rclose 做一些清除的收尾工作；
3、当 case 会向 Channel send数据时；
    如果当前 Channel 已经被关，闭就会直接跳到 sclose 标签，触发 panic 尝试中止程序；
    如果当前 Channel 的 recvq 上有等待的 Goroutine，就会跳到 send 标签向 Channel 发送数据；
    如果当前 Channel 的缓冲区存在空闲位置，就会将待发送的数据存入缓冲区；
4、当 select 语句中包含 default 时；
    表示前面的所有 case 都没有被执行，这里会解锁所有 Channel 并返回，意味着当前 select 结构中的收发都是非阻塞的；

```

### End