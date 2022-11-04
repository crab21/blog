---
title: 「61」redis hash解读
date: '2021/08/17 12:36:44'
updated: '2021/08/17 12:36:44'
tags:
  - Redis
  - Hash
  - 源码
abbrlink: 68b4ef49
---

### 前序

hash在日常开发中上镜频率还是比较高，例：

```
1、java中的Hashmap...
2、Go中的Map...
3、分布式的节点分布...
3、Redis中的hash
```

### 好奇点

* Redis的hash结构到底是怎么存的呢？
* Redis hash如果做到高效的？
* Rehash操作，do what?
* "XX" vs ht「hashtable」?Why?

<!--more-->

>一个个来看吧：

### hash结构：

```c++
typedef struct dictht {
    dictEntry **table;
    unsigned long size;
    unsigned long sizemask;
    unsigned long used;
} dictht;

typedef struct dict {
    dictType *type;
    void *privdata;
    dictht ht[2];
    long rehashidx; /* rehashing not in progress if rehashidx == -1 */
    int16_t pauserehash; /* If >0 rehashing is paused (<0 indicates coding error) */
} dict;
```

>用一张图来描述

![](https://github.com/crab21/Images/tree/master/clipboard_20210817_094456.png)

### redis的hash为何高效？

>讲道理，不是最高效的，但是适合大众场景。

```go
hset hello w 1
hset hello wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww 1
```

这2条命令在redis中的存储方式决定了是否高效。

其实Redis提供了[👉🏻两种存hash编码](https://github.com/redis/redis/blob/6.2/src/server.h#L701)的结构：

![](https://github.com/crab21/Images/tree/master/clipboard_20210817_095231.png)

#### 类型转换关键点

* hash_max_ziplist_value [👉🏿 源码判断](https://github.com/redis/redis/blob/6.2/src/t_hash.c#L47)
* hash_max_ziplist_entries [👉🏿 源码判断](https://github.com/redis/redis/blob/6.2/src/t_hash.c#L235)

```go

满足以下条件之一的，会将hash的类型从ziplist转换为hashtable。

1、当hset的value大小超过设置的「hash_max_ziplist_value」，默认512字节. 
2、当key的个数超过指定个数：「hash_max_ziplist_entries」，默认64个.
```



### rehash

* 产生原因：

```go
负载因子不在一个合理的范围内，简单的说：
1、产生hash冲突
2、单个table节点过长或者分布不均衡。
```

![](https://github.com/crab21/Images/tree/master/clipboard_20210817_104655.png)


* 触发的时机

```go
1、定时任务。
2、对dict的find/delete/add等操作时触发。
```

![](https://github.com/crab21/Images/tree/master/clipboard_20210817_115402.png)
>具体rehash过程，后续会讲到。

### ZIPLIST VS HASHTABLE

todo 数据采集中.....

理论上分析：

ZIPLIST:   get操作是 O(N)+1
HASHTABLE: get操作是 O(1)