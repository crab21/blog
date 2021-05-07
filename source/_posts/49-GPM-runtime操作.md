---
title: 「49」GPM runtime操作「持续更新」
date: 2021/05/06 21:55:30
updated: '2021/05/07 22:56:17'
keywords: 'Go,GPM,G0,M0'
top: true
tags:
  - GPM
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
// 竞争关系 
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
// 竞争关系
preempt bool
```

#### [👉👉_defer](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L865)

#### [👉👉_panic](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/runtime2.go#L903)

### 持续更新...🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️🧞‍♂️