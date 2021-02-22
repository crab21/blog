---
title: 「39」Go select源码实现分析
date: '2021/2/22 12:10:17'
updated: '2021/2/22 12:10:17'
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

```go
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
