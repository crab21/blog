---
title: 「49」Go runtime操作「持续更新」
date: 2021/05/06 21:55:30
updated: '2021/05/08 22:56:17'
keywords: 'Go,GPM,G0,M0'
top: true
tags:
  - Runtime
  - Day
  - Go
  - Go源码
mathjax: true
---

主要从以下几个方面：
* 变量的含义和存在的作用
* 方法的用途
* 设计方式分析

<!--more-->

### 变量作用：


#### 全局的
```go
var (
	// 全局m
	allm       *m
	// proc最大值
	gomaxprocs int32
	// cpu数量
	ncpu       int32
	forcegc    forcegcstate
	// 调度过程中的结构体
	sched      schedt
	// gomaxprocs数量
	newprocs   int32

	// allpLock protects P-less reads and size changes of allp, idlepMask,
	// and timerpMask, and all writes to allp.
	// 全局p对应的lock
	allpLock mutex
	// len(allp) == gomaxprocs; may change at safe points, otherwise
	// immutable.
	// P的全局队列
	allp []*p
	......
	....
	...
)
```

#### [👉👉sudog](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L332)

**waiting list**

#### [👉👉g](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L395)

```go
// panic结构
_panic		*_panic
// defer函数结构
_defer		*_defer
// 绑定的m
m     		 *m
// goid序号
goid		 int64
// 抢占关系 
preempt		 bool
// 等待的队列
waiting		 *sudog
//cached for time.sleep
timer		 *timer
.....
....
...
```

#### [👉👉m](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L477)

```go
g0 		*g
currg 	*g
procid  uint64
// 自旋
spinning bool 
// 随机数
fastrand [2]uint32

park     note
alllink *m

```

#### [👉👉p](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L556)

```go
id		int32
status 	uint32
m 		*m
// timer使用相关
timerslock mutex
timers []*timer
numTimers uint32
// 抢占关系
preempt bool
```

#### [👉👉_defer](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L865)
```go
	...
	fn        *funcval // can be nil for open-coded defers
	_panic    *_panic  // panic that is running defer
	link      *_defer
	...
```

#### [👉👉_panic](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L903)

```go
// A _panic holds information about an active panic.
//
// A _panic value must only ever live on the stack.
//
// The argp and link fields are stack pointers, but don't need special
// handling during stack growth: because they are pointer-typed and
// _panic values only live on the stack, regular stack pointer
// adjustment takes care of them.
type _panic struct {
	// function
	argp      unsafe.Pointer // pointer to arguments of deferred call run during panic; cannot move - known to liblink
	// 参数
	arg       interface{}    // argument to panic
	// link to _panic
	link      *_panic        // link to earlier panic
	pc        uintptr        // where to return to in runtime if this panic is bypassed
	sp        unsafe.Pointer // where to return to in runtime if this panic is bypassed
	// recover标志
	recovered bool           // whether this panic is over
	aborted   bool           // the panic was aborted
	goexit    bool
}
```

### 持续更新...🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️