---
title: 「34」Go memory leak about RSS
date: '2021/2/17 21:01:17'
updated: '2021/2/17 21:01:17'
keywords: 'Go,Runtime'
tags:
  - Go
  - Runtime
  - Day
  - v1.16
mathjax: true
abbrlink: c0e329b8
---

### 前序:
今天收到了封邮件 Go 1.16 release:

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210217_094336.webp)

进去了看了看全部的特性,发现有个关于memory  leak「RSS」相关的issues,去看看关于Go的RSS到底是怎么计算的,
顺带也看看这个老哥为何会问内存泄露的问题.

<!--more-->

### 问题:

[runtime: memory leaked observed in go program #40448](https://github.com/golang/go/issues/40448)

#### 简述起因:

>一个tcp接受程序导致RSS不断上升. 
> 这个起了5个goroutine协程来处理请求,但是请求处理结束后,RAM并没有趋于稳定或者降低.导致了看似的memory leak.

* 描述:

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210217_095036.png)

#### [关于RSS解释](https://github.com/golang/go/issues/40448#issuecomment-666350046)

```
The current minimum heap size of a Go program is 4mb. In addition to this the operating system threads that back goroutines should be added to that as well as some non heap memory used by the runtime. In your case this may be somewhere between 7 and 9mb.

// 下面的解释划重点,简单的说就是RSS受很多值的影响:swap,avaliability values等
Please remember that RSS is not how much memory is a program using, it is the resident segment size. Many things influence the value reported in RSS including the availability of swap and how much of the process may be swapped, if the system has reclaimed pages which we have madvise(DONTNEED) as part of the scavenger. A high RSS value does not necessarily mean that memory is not available for other processes, and so on.

If memory consumption is your primary objective I would suggest investigating https://tinygo.org/ who may (I cannot confirm) have a different approach to memory allocation.

I'll defer to @randall77 and @mknyszek on the question of if the minimum heap size can be reduced.
```

### [解决办法](https://github.com/golang/go/issues/40448#issuecomment-667196117)

* runtime/debug.SetGCPercent (设置gc的百分比,-1为不GC)
* runtime.GC (调用系统GC)
* runtime/debug.FreeOSMemory (accelerate the pace of returning unused pages to the OS)

### 其它方面的问题

>从这里看的话,其实这个哥们的问题并不属于go的bug,只是说对于内存使用的理解有偏差,
觉得go运行时环境很像是unix系统,内存有多少用多少,不会是用完就释放给系统.

毕竟有句话: ***空间换时间***