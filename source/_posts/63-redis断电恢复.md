---
title: Redis断电恢复
date: '2021/08/28 18:01:32'
updated: '2022/09/22 21:43:30'
tags:
  - Redis
  - 源码
abbrlink: e9e58399
---


继[→ 30篇 RDB数据保存](https://blog.imrcrab.com/archives/44b34745.html)的问题，接着说断电恢复问题,
先看下主要研究的模块：
<!--more-->
![](https://raw.githubusercontent.com/crab21/Images/master/2022/redis-%E6%96%AD%E7%94%B5%E6%81%A2%E5%A4%8D-1.png)



跟着源代码，看下大概流程吧：

![](https://raw.githubusercontent.com/crab21/Images/master/2022/redis%E6%96%AD%E7%94%B5%E6%81%A2%E5%A4%8D-2.png)

## 待更
