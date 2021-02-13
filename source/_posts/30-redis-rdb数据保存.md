---
title: 「30」redis rdb源码-1
date: '2021/1/25 22:00:17'
updated: '2021/02/13 22:27:28'
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

### Version

>Redis 6.0.9

### 实现流程:

* 这里罗列了几个比较重要的过程:

![](https://crab-1251738482.cos.accelerate.myqcloud.com/redis-rdb-1.png)
### rdbSaveKeyValuePair「2021-01-31 22:57:28」

* 错误返回-1,正常返回1,其它返回0
* 主逻辑只需负责入参和返回值「抽象」
* 优先级: expire > lru > lfu > [<key,values>]


#### rdbSaveRio
```c

/* Produces a dump of the database in RDB format sending it to the specified
 * Redis I/O channel. On success C_OK is returned, otherwise C_ERR
 * is returned and part of the output, or all the output, can be
 * missing because of I/O errors.
 *
 * When the function returns C_ERR and if 'error' is not NULL, the
 * integer pointed by 'error' is set to the value of errno just after the I/O
 * error. */
int rdbSaveRio(rio *rdb, int *error, int rdbflags, rdbSaveInfo *rsi) {
    dictIterator *di = NULL;
    dictEntry *de;
    char magic[10];
    int j;
    uint64_t cksum;
    size_t processed = 0;

    if (server.rdb_checksum)
        rdb->update_cksum = rioGenericUpdateChecksum;
    snprintf(magic,sizeof(magic),"REDIS%04d",RDB_VERSION); // 04指的是版本号
    if (rdbWriteRaw(rdb,magic,9) == -1) goto werr;
    if (rdbSaveInfoAuxFields(rdb,rdbflags,rsi) == -1) goto werr; // redis辅助信息，返回了-1，代表还是比较重要的
    if (rdbSaveModulesAux(rdb, REDISMODULE_AUX_BEFORE_RDB) == -1) goto werr; // 模块化信息

    for (j = 0; j < server.dbnum; j++) {
        redisDb *db = server.db+j;
        dict *d = db->dict;
        if (dictSize(d) == 0) continue; // 大小为0，则跳过
        di = dictGetSafeIterator(d); // 分配内存，返回迭代器

        /* Write the SELECT DB opcode */
        if (rdbSaveType(rdb,RDB_OPCODE_SELECTDB) == -1) goto werr;
        if (rdbSaveLen(rdb,j) == -1) goto werr;

        /* Write the RESIZE DB opcode. */
        uint64_t db_size, expires_size;
        db_size = dictSize(db->dict);
        expires_size = dictSize(db->expires);
        if (rdbSaveType(rdb,RDB_OPCODE_RESIZEDB) == -1) goto werr;
        if (rdbSaveLen(rdb,db_size) == -1) goto werr;
        if (rdbSaveLen(rdb,expires_size) == -1) goto werr;

        /* Iterate this DB writing every entry */ // 遍历每一个entry
        while((de = dictNext(di)) != NULL) { // dictNext为函数取值的方式
            sds keystr = dictGetKey(de); // 获取key
            robj key, *o = dictGetVal(de); //获取value
            long long expire;

            initStaticStringObject(key,keystr); // 初始化obj，「类型，数量，指针指向的地址」
            expire = getExpire(db,&key); // 通过key来找过期时间
            if (rdbSaveKeyValuePair(rdb,&key,o,expire) == -1) goto werr;

            /* When this RDB is produced as part of an AOF rewrite, move
             * accumulated diff from parent to child while rewriting in
             * order to have a smaller final write. */  // 把父级别的积累缓冲到缓冲区，在重写完成后串联在一起。
            if (rdbflags & RDBFLAGS_AOF_PREAMBLE &&
                rdb->processed_bytes > processed+AOF_READ_DIFF_INTERVAL_BYTES)
            {
                processed = rdb->processed_bytes;
                aofReadDiffFromParent();
            }
        }
        dictReleaseIterator(di); // 内存释放，在每一次循环中，用完就释放，「内存周期管理」
        di = NULL; /* So that we don't release it again on error. */
    }

    /* If we are storing the replication information on disk, persist
     * the script cache as well: on successful PSYNC after a restart, we need
     * to be able to process any EVALSHA inside the replication backlog the
     * master will send us. */
    if (rsi && dictSize(server.lua_scripts)) {
        di = dictGetIterator(server.lua_scripts);
        while((de = dictNext(di)) != NULL) {
            robj *body = dictGetVal(de);
            if (rdbSaveAuxField(rdb,"lua",3,body->ptr,sdslen(body->ptr)) == -1)
                goto werr;
        }
        dictReleaseIterator(di);
        di = NULL; /* So that we don't release it again on error. */
    }

    if (rdbSaveModulesAux(rdb, REDISMODULE_AUX_AFTER_RDB) == -1) goto werr; // 再次保存辅助的信息，「上一步可能会改变」

    /* EOF opcode */
    if (rdbSaveType(rdb,RDB_OPCODE_EOF) == -1) goto werr; // 保存文件类型，结束位置的标志

    /* CRC64 checksum. It will be zero if checksum computation is disabled, the
     * loading code skips the check in this case. */
    cksum = rdb->cksum;
    memrev64ifbe(&cksum);
    if (rioWrite(rdb,&cksum,8) == 0) goto werr; // checksum 校验位插入文件最后
    return C_OK; // 返回0，一切ok

werr:
    if (error) *error = errno;
    if (di) dictReleaseIterator(di); // 一旦错误发生后，及时释放内存
    return C_ERR;
}

```

#### rdbSaveKeyValuePair实现

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