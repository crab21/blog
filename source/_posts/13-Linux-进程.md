---
title: 「13」Linux 进程
date: '2020/09/24 19:09:49'
updated: '2020/09/24 20:00:00'
keywords: 'Linux,Linux 进程'
top: false
sticky: 4
tags:
  - Linux
  - 进程
abbrlink: ba455c1d
---

进程这是个老生常谈的问题，当然我不是那个老生，我只是个loser。

今天用chrome，占用很多的内存和资源，查了查，说chrome是多进程的，于是就想了解下进程一些相关的内容。
主要从以下几个角度了解下进程：
* 来源
* 定义
* 特征
* 多进程如何工作？
* 通信

<!--more-->

### 来源

抽象正在运行的程序，或者说是对计算机系统存储器的调度和管理。

### 定义

进程：并发程序在执行过程中资源分配和管理的最基本的单元（资源分配的最小单元，执行的最小单元）。一个程序一旦开始执行，就是一个进程。每一个进程都有自己的独立空间，系统会分配一定的地址空间和完整的数据段空间。

ps:[线程：程序执行的最小单位。]

组成：程序、数据、控制块组成。

### 特征

* 动态性 ： 多个程序执行过程中的一次执行过程，进程是动态产生，动态销毁的。
* 并发性 ： 任何进程可以和其它进程并发执行。
* 独立性 ： 是独立运行的基本单元，也是资源分配和调度的独立单元。
* 异步性 ： 由于进程间的相互制约，进程间是各自独立，各自向前。

### 多进程工作：

#### 进程的状态：
>3种状态：
* 就绪
* 运行
* 阻塞

##### 3态图：

![](https://raw.githubusercontent.com/crab21/Images/master/linux_process_3.1.png)

##### 5态图：

![](https://raw.githubusercontent.com/crab21/Images/master/linux_p3.png)

##### 7态图：

新增两种状态：
* 挂起就绪状态：表明进程具备了运行的条件，目前在二级存储器里面。
* 挂起等待状态：表明进程正在等待某一个事件的结束且目前在二级存储器里面。


![](https://raw.githubusercontent.com/crab21/Images/master/linux_process_7.png)

### 进程间通信

#### 共享内存

映射一段能被其它进程访问的内存，一个进程创建，其它进程可访问。共享内存是最快的IPC方式，往往和信号量一起使用，达到进程间的同步和互斥。

#### 管道

实质就是一个缓冲区。
管道限制：

* 半双工
* 只能在亲缘进程间通信

**特点:**
```
写满时，不能再写，读空时，不能再读
没写满，不能读，没读空，不能写
```

#### 消息队列

是一种消息的链表，解决了信号传递信息少，管道只能承载无格式字节流及管道大小限制的缺点。

#### 信号

通知和接受进程某个事件已经发生了的。

#### 信号量

实质上就是个计数器，用来控制多个进程对于共享资源的访问情况。

#### 套接字（Socket）

进程间通信的一种机制，多用于不同机器进程间的通信。

#### 优缺点：

```go
1、管道：速度慢，容量有限，只有父子进程能通讯.
2、FIFO：任何进程间都能通讯，但速度慢.
3、消息队列：容量受到系统限制，且要注意第一次读的时候，要考虑上一次没有读完数据的问题.
4、信号量：不能传递复杂消息，只能用来同步.
5、共享内存区：能够很容易控制容量，速度快，但要保持同步，比如一个进程在写的时候，另一个进程要注意读写的问题，相当于线程中的线程安全，当然，共享内存区同样可以用作线程间通讯，不过没这个必要，线程间本来就已经共享了同一进程内的一块内存.
```

### END