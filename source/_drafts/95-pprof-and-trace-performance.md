---
title:「95」pprof and performance Diagnostics
date: 2022-11-09 10:40:30
tags:
---


## std

### runtime.ReadMemStats

MemStats是一个结构体，里面指标很多，常用的有：

* HeapObjects：堆中已经分配的对象总数，GC内存回收后HeapObjects取值相应减小。
* HeapAlloc:  堆中已经分配给对象的字节数，GC内存回收后HeapAlloc取值相应减小。
* TotalAlloc:  堆中已经分配给对象的总的累计字节数，只增不减，GC内存回收后也不减小。
* HeapSys: 从操作系统为堆申请到的字节数。
* HeapIdle: 堆的闲置区间，包括已经归还给操作系统的物理字节数（HeapReleased）
* HeapReleased: 已经归还给操作系统的物理字节数，是HeapIdle的子集。


## [→ pprof](https://pkg.go.dev/net/http/pprof)

```go
1、第一步: 导入package
import _ "net/http/pprof"


2、启动一个server服务

go func() {
	log.Println(http.ListenAndServe("localhost:6060", nil))
}()


```

## trace

>两个过程:

1、go run main.go > trace.out

2、go tool trace trace.out

![](https://raw.githubusercontent.com/crab21/Images/master/2022/2022-11-09-23-08-27-596ef9e51dfcd927c4db6e77299077de-20221109230824-78fe3d.png)

![](https://raw.githubusercontent.com/crab21/Images/master/2022/2022-11-09-23-13-40-adac2db909145907b6366dc1192793bf-20221109231337-b00b06.png)

## Reference

* https://tip.golang.org/doc/diagnostics#execution-tracer
* https://pkg.go.dev/net/http/pprof
