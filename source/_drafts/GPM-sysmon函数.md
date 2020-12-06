---
title: GPM-sysmon函数
tags:
---



前面主要是了解newm的全过程和其中难过一些细节逻辑，，，
如果没了解的，建议先去看下大概的过程，虽然不是非常详细，
最起码得知道newm过程，主要完成了什么操作，有利于后续理解。


这次主要是来学学这个sysmon，系统监控调度的逻辑。
<!--more-->
### 前序

在深入之前呢，先对下面这些变量有个概念，后续提到也就不陌生了。「摘抄自sysmon函数」

```go
var (
	allglen    uintptr //g
	allm       *m      //m
	allp       []*p  // p     len(allp) == gomaxprocs; may change at safe points, otherwise immutable
	allpLock   mutex // 全局lock。   Protects P-less reads of allp and all writes
	gomaxprocs int32 //最大process数量
	ncpu       int32 //cpu个数
	forcegc    forcegcstate //强制GC
	sched      schedt //预分配的一些变量值
	newprocs   int32  //新的process

	// Information about what cpu features are available.
	// Packages outside the runtime should not use these
	// as they are not an external api.
	// Set on startup in asm_{386,amd64}.s
	processorVersionInfo uint32
	isIntel              bool
	lfenceBeforeRdtsc    bool

	goarm                uint8 // set by cmd/link on arm systems
	framepointer_enabled bool  // set by cmd/link
)

```




