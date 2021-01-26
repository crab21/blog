---
title: 「28」sync-mutex传参复制问题
date: '2021/1/2 21:00:17'
updated: '2021/1/2 21:00:17'
keywords: 'time,zone,Go,sync,Mutex'
tags:
  - Go
  - sync
  - Day
  - Mutex
abbrlink: a82ae489
---
### Go version:

```go
7384 ◯  go version
go version go1.14.9 darwin/amd64
```

### 起因:

```
sync.Mutex当参数,值传递后出错.

```

### 现象:

>不废话,上代码:


<!--more-->

```go

package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup
var age int

type Person struct {
	mux sync.Mutex
}

func (p Person) AddAge() {
	defer wg.Done()
	p.mux.Lock()
	age++
	defer p.mux.Unlock()
}

func main() {
	p1 := Person{
		mux: sync.Mutex{},
	}
	wg.Add(100)
	for i := 0; i < 100; i++ {
		go p1.AddAge()
	}
    wg.Wait()
    
	fmt.Println(age)
}

```
#### 这个age的输出应该是多少?

#### 不妨可以多尝试几次,结果:

>100/99/98都有可能.


### What? Lock难道不是加锁的么

>Lock加锁难道不是这么用的么,颠覆认知!

#### Lock源码: 
*A Mutex must not be copied after first use*

### 根源:

* Go参数传递属于值传递
* Mutex复制后中的state属于前一状态,没有改变
* Mutex中的Lock和Unlock「方法」属于指针类型<sup>图1</sup>


![](https://crab-1251738482.cos.accelerate.myqcloud.com/clipboard_20210102_102753.png)
**<center>图<sup>1</sup></center>**

### 解决办法


* 当然是参考源码,「图1」

```go

缺点:
    每次使用之前需要初始化,毕竟是指针类型的

优点:
    设计源于源码,追随Go的设计.

```
* 加锁的地方尽量是全局的

```go
这个就不分析了,毕竟不适用所有场景.

不适用的场景:
    临时的Map需要加锁,如果用全局锁,则效率降低.
```

### Sync包不可复制性

```go
使用sync包下的功能,可能得注意了,都是不可复制的.
```


### End

>每次看源码,都会有不一样的收获.「也许是我理解能力差哈」
