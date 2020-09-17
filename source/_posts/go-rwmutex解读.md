---
title: go rwmutex解读
date: 2020-09-17 01:24:32
keywords: golang,go 源码,go 读写锁, rwmutex 解读
tags:
    - Go
    - Go源码
    - Go Package
---
    好久没有更新文章了，表达能力生疏了许多😄....
    今天扯扯:rwmutex 被称为读写锁。一说到【锁】最直接的联想可能就是lock()、Rlock()、unlock()、Runlock()之类的，但是作为程序猿，还是要了解下底层的设计和相关的逻
实现，以便于把这种锁的设计思想应用到其它场景中，好了，不废话了，开题吧。
    从锁的结构设计-->加锁的过程--->加锁的粒度---->解锁释放，整个生命周期来看rwmutex的具体实现。
    <!-- more -->

    ### 同向对比rwmutex锁的设计
    java实现：AQS(AbstractQueuedSynchronizer)


    ### 结构设计

    ### 加锁过程

    ### 加锁的粒度

    ### 解锁释放