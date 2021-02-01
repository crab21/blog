---
title: 「30」redis rdb源码-1
date: '2021/1/25 22:00:17'
updated: '2021/01/31 22:57:28'
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
### rdbSaveKeyValuePair「2021-01-31 22:57:28」

* 错误返回-1,正常返回1,其它返回0
* 主逻辑只需负责入参和返回值「抽象」
* 优先级: expire > lru > lfu > [<key,values>]

```c
/* Save a key-value pair, with expire time, type, key, value.
 * On error -1 is returned.
 * On success if the key was actually saved 1 is returned, otherwise 0
 * is returned (the key was already expired). */
int rdbSaveKeyValuePair(rio *rdb, robj *key, robj *val, long long expiretime) {
    int savelru = server.maxmemory_policy & MAXMEMORY_FLAG_LRU;
    int savelfu = server.maxmemory_policy & MAXMEMORY_FLAG_LFU;

    //  保存过期时间
    /* Save the expire time */
    if (expiretime != -1) {
        if (rdbSaveType(rdb,RDB_OPCODE_EXPIRETIME_MS) == -1) return -1;
        if (rdbSaveMillisecondTime(rdb,expiretime) == -1) return -1;
    }

    // LRU方式保存
    /* Save the LRU info. */
    if (savelru) {
        uint64_t idletime = estimateObjectIdleTime(val);
        idletime /= 1000; /* Using seconds is enough and requires less space.*/
        if (rdbSaveType(rdb,RDB_OPCODE_IDLE) == -1) return -1;
        if (rdbSaveLen(rdb,idletime) == -1) return -1;
    }

    // LFU方式保存
    /* Save the LFU info. */
    if (savelfu) {
        uint8_t buf[1];
        buf[0] = LFUDecrAndReturn(val);
        /* We can encode this in exactly two bytes: the opcode and an 8
         * bit counter, since the frequency is logarithmic with a 0-255 range.
         * Note that we do not store the halving time because to reset it
         * a single time when loading does not affect the frequency much. */
        if (rdbSaveType(rdb,RDB_OPCODE_FREQ) == -1) return -1;
        if (rdbWriteRaw(rdb,buf,1) == -1) return -1;
    }

    // 保存类型、key、value等
    /* Save type, key, value */
    if (rdbSaveObjectType(rdb,val) == -1) return -1;
    if (rdbSaveStringObject(rdb,key) == -1) return -1;
    if (rdbSaveObject(rdb,val,key) == -1) return -1;

    // 延迟请求
    /* Delay return if required (for testing) */
    if (server.rdb_key_save_delay)
        usleep(server.rdb_key_save_delay);

    return 1;
}

```

### 待更ing...