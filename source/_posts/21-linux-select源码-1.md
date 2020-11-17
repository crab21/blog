---
title: 21-linux select源码-1
date: '2020/11/17 19:09:17'
updated: '2020/11/17 19:09:17'
keywords: 
tags:
  - Linux
  - Day
---


> select poll epoll三个老生长谈的问题.这次不是来讲区别的，后续会更新一篇关于三者区别的。

### 前序 
select属于linux系列的文件系统「fs」的范畴，每次的系统调用、打开软件、启动程序等等都会涉及都文件的读写，
这个是在所难免的。

那么I/O事件的基本思路：文件准备ok，开始读写，等函数返回，根据结果继续运行.

如果是自己实现，大体上无非以下思路：
* 创建多个进程/线程来监听
* Non-blocking读写监听的轮询
* 异步I/O与Unix Signal事件机制

先来学习下linux源码是怎么处理select机制的：

### select切入点

既然知道了select属于fs系列的，那就很容易找到:[fs/select.c]

查看select命令：
```shell
man 2 select
```

下面按照以下顺序来解读，一起学习：

* 入口
* 核心函数
* 设备驱动的操作函数
* scull驱动
* poll_wait与设备的等待队列
* fd数量限制「why」
* select与poll


### 先回家....再更新
