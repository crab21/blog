---
title: 「51」getg()函数实现源码
date: '2021/05/13 22:30:30'
updated: '2021/05/13 23:20:17'
keywords: 'Go,GPM,G0,M0'
tags:
  - GPM
  - Day
  - Go
  - Go源码
mathjax: true
abbrlink: 82f0ffe7
---

在学习[👉🏾schedinit()函数](https://blog.imrcrab.com/archives/a90dcb34.html#call-schedinit%E5%87%BD%E6%95%B0)过程中发现有这个么函数：
>getg()

多处都有使用的情况，但是问题来了，到底是如何实现的，如何获取的G呢？

<!--more-->

### 定义
源码中的定义：[🙌🏽  func getg() *g](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/stubs.go#L18)


![](https://github.com/crab21/Images/tree/master/clipboard_20210513_113610.png)


### 使用：

从上面的结果来看，主要from TLS or 编译器:

[👉🏾1.14呈现：](https://github.com/golang/go/blob/release-branch.go1.14/src/cmd/compile/internal/amd64/ssa.go#L895)


![](https://github.com/crab21/Images/tree/master/clipboard_20210513_114619.png)


>根据是否使用TLS分两种：

![](https://github.com/crab21/Images/tree/master/clipboard_20210513_115015.png)

### END