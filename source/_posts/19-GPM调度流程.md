---
title: 「19」GPM 调度流程
date: '2020/11/16 21:09:17'
updated: '2020/11/16 21:09:17'
keywords: 'GPM,Go,Go调度器,Go资源调度器'
tags:
  - Go
  - GPM
  - Go源码
abbrlink: 5c6a362f
---

工欲善其事，必先知其所以然......
学习GPM调度之前，先看下源码部分的准备工作吧，不然一脸茫然的看源码，基本不会有太多的收获.

### 函数& 变量初识
>[challenge]: 以下多少是一看就知道在GPM中作用的?

<!--more-->

>go version: 1.14.3

#### 函数

> /proc.go
* main
* sysmon
* findrunnable
* gopark「1.1」
* gosched 「1.2」
* mstart
* wakep
* schedule
* cpuinit
* schedinit
* ready
* readgstatus
* startm
* pollWork
* injectglist
* park_m
* goyield
* retake
* globrunqput
* globrunqputbatch
* globrunqputhead

#### 变量

> /proc.go
* m0
* g0
* allgs
* allglock


> /runtime2.go
* g
* p
* m
* allglen
* allm
* allp
* allpLock
* gomaxprocs
* sched



> /runtime2.go 常量
* _Grunnable/_Grunning/_Gwaiting.....

### 上述这些函数/变量/常量 what？

写这么多，肯定不是简单的从源码仓库里面超出来，这些是一些比较重要的函数，当然还有很多没有罗列，这里主要想记录，也是思考的点：

* GPM为何会有这么多的状态
* 这些状态之间是如何配合和协调的
* 著名的工作偷取「P」是怎么操作的
* 如果让你设计，你应该会怎么设计GPM这个调度的过程「🏁重点」

### 切入点
* main:入口函数
* sysmon：监控调度线程
* schedule：真实的调度器逻辑
* m0/g0：特殊的存在体


### 如何开始？

>简单点，从main开始.


### 瞎扯

```
看了很长时间的go源码了，觉得一个好的设计，从来不是简单的学习别人的源码，
更多的是学习源码的设计思路和当时设计时是基于哪种场景下的。

考虑更多的场景，有没有其它的设计思路，可能没有现有的设计更出色，但更加适合别的场景。
```

### 未完待续.