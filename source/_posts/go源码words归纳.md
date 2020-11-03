---
title: go源码words归纳
date: 2020/11/03 10:45:07
updated: 2020/11/03 10:45:07
keywords: 汇编,Go,Plan9
tags:
    - Go
    - Day
---
### 前序

好久没有更新了，不是不更新，最近感冒严重，一直没好，太影响身体了.....「身体还是很重要的!」

当然了，在生病期间也看了很多东西，更多的思考了许多：人生规划的、如何学习技术、后续的生涯发展之类的。「思考的方式很多种，不建议去生病了才去思考.」

>后续会更新一篇，主要是结合之前的成长和技术的壁垒来说说后续想怎么学，怎么发展，生涯规划吧。

不扯了，这篇主要想记录一些词汇，主要还是在阅读Go源码中的一些词汇，毕竟英文有点差，再不积累就更差了。

### Words

#### 全称
```go
「11/3」
Preempt  v 抢占、掠夺                                   --> /proc.go
retake   v 重新获取「重新分配」                           --> /proc.go
syscall  v 系统调用                                     --> /proc.go
decrement v 递减                                       --> /proc.go
pretending  v 假装、伪装                                --> /proc.go
contended  v 竞争                                      --> /proc.go
procresize  v 扩大                                     --> /proc.go 
```


#### 简写

```go
「11/3」
sysmon -> system monitor 系统监控                                               /proc.go
incidlelocked  --> increment idle locked   增加空闲锁                           /proc.go
sysmontick  --> system monitor ticket   系统监控数量                            /proc.go
```

### 持续更新....
