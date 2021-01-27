---
title: 「30」redis rdb源码-1
date: '2021/1/25 22:00:17'
updated: '2021/1/25 22:00:17'
keywords: 'redis,RDB'
tags:
  - Day
  - Redis
  - RDB
  - 源码
abbrlink: 44b34745
---

>RDB和AOF常常被提起,好奇RDB这个到底是怎么实现的,这样才能运用的更加灵活和精准.
### 学完预期的目标:
* 学习数据异步处理流程 
* RDB持久化数据的关键过程
* RDB的缺点
* RDB适用的场景
* RDB改进点或bug?
* 数据持久化,应该是个什么过程?
<!--more-->
### 实现流程:

* 这里罗列了几个比较重要的过程:

![](https://crab-1251738482.cos.accelerate.myqcloud.com/redis-rdb-1.png)
### 待更新ing....