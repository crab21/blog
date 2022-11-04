---
title: 「46」chan布局和设计「源码」
date: '2021/04/28 22:10:17'
updated: '2021/04/29 08:10:17'
keywords: 'Go,chan,hchan'
tags:
  - chan
  - Day
  - Go
  - Go源码
mathjax: true
abbrlink: a0547b09
---

chan在Go中很常用，平时用的不少，但是总是没用的完整，
下来看了多次chan源码，总结记录下：

### 结构方面

![](https://github.com/crab21/Images/tree/master/Canvas%201.png)

<!--more-->

### makechan方面

![](https://github.com/crab21/Images/tree/master/makechan.png)

### chansend「c<-"aaa"」消息发送

![](https://github.com/crab21/Images/tree/master/chansend.png)


### chanrecv 「<-c」 消息消费


![](https://github.com/crab21/Images/tree/master/chanrecv.png)

### closed过程

![](https://github.com/crab21/Images/tree/master/closed.png)

### summary

![](https://github.com/crab21/Images/tree/master/summary.png)

### 待更...