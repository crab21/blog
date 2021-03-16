---
title: 「30」redis rdb源码-1
date: '2021/1/25 22:00:17'
updated: '2021/03/16 07:01:00'
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

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/redis-rdb-1.png)

#### rdbSaveBackground
```c++
int rdbSaveBackground(char *filename, rdbSaveInfo *rsi) {
    pid_t childpid;

    if (hasActiveChildProcess()) return C_ERR;

    server.dirty_before_bgsave = server.dirty;
    server.lastbgsave_try = time(NULL);
    openChildInfoPipe();

    if ((childpid = redisFork(CHILD_TYPE_RDB)) == 0) { // fork一个子进程
        int retval;

        /* Child */
        redisSetProcTitle("redis-rdb-bgsave"); // 设置标题
        redisSetCpuAffinity(server.bgsave_cpulist); // 设置cpu亲和力
        retval = rdbSave(filename,rsi); // rdb保存
        if (retval == C_OK) {
            sendChildCOWInfo(CHILD_TYPE_RDB, "RDB");
        }
        exitFromChild((retval == C_OK) ? 0 : 1); // 子进程退出
    } else {
        /* Parent */
        if (childpid == -1) { // -1 发生错误了
            closeChildInfoPipe();
            server.lastbgsave_status = C_ERR;
            serverLog(LL_WARNING,"Can't save in background: fork: %s",
                strerror(errno));
            return C_ERR;
        }
        serverLog(LL_NOTICE,"Background saving started by pid %d",childpid); // 下面是一些重新初始化的部分
        server.rdb_save_time_start = time(NULL);
        server.rdb_child_pid = childpid;
        server.rdb_child_type = RDB_CHILD_TYPE_DISK;
        return C_OK;
    }
    return C_OK; /* unreached */
}

```

##### rdbSaveInfo「struct」
```c++
/* This structure can be optionally passed to RDB save/load functions in
 * order to implement additional functionalities, by storing and loading
 * metadata to the RDB file.
 *
 * Currently the only use is to select a DB at load time, useful in
 * replication in order to make sure that chained slaves (slaves of slaves)
 * select the correct DB and are able to accept the stream coming from the
 * top-level master. */
typedef struct rdbSaveInfo {
    /* Used saving and loading. */
    int repl_stream_db;  /* DB to select in server.master client. */ // 选中复制的db

    /* Used only loading. */
    int repl_id_is_set;  /* True if repl_id field is set. */
    char repl_id[CONFIG_RUN_ID_SIZE+1];     /* Replication ID. */ 副本ID
    long long repl_offset;                  /* Replication offset. */ 偏移量
} rdbSaveInfo;
```

#### rdbSave
```c++
/* Save the DB on disk. Return C_ERR on error, C_OK on success. */
int rdbSave(char *filename, rdbSaveInfo *rsi) {
    char tmpfile[256];
    char cwd[MAXPATHLEN]; /* Current working dir path for error messages. */
    FILE *fp = NULL;
    rio rdb;
    int error = 0;

    snprintf(tmpfile,256,"temp-%d.rdb", (int) getpid()); // 临时文件命名 pid
    fp = fopen(tmpfile,"w"); // 只读模式
    if (!fp) {
        char *cwdp = getcwd(cwd,MAXPATHLEN);
        serverLog(LL_WARNING,
            "Failed opening the RDB file %s (in server root dir %s) "
            "for saving: %s",
            filename,
            cwdp ? cwdp : "unknown",
            strerror(errno));
        return C_ERR;
    }

    rioInitWithFile(&rdb,fp); // rdb初始化
    startSaving(RDBFLAGS_NONE);

    if (server.rdb_save_incremental_fsync)
        rioSetAutoSync(&rdb,REDIS_AUTOSYNC_BYTES);

    if (rdbSaveRio(&rdb,&error,RDBFLAGS_NONE,rsi) == C_ERR) { // rdb保存「重点」
        errno = error;
        goto werr;
    }

    /* Make sure data will not remain on the OS's output buffers */ // 刷新fp文件中内容
    if (fflush(fp)) goto werr;
    if (fsync(fileno(fp))) goto werr;
    if (fclose(fp)) { fp = NULL; goto werr; }
    fp = NULL;
    
    /* Use RENAME to make sure the DB file is changed atomically only
     * if the generate DB file is ok. */
    if (rename(tmpfile,filename) == -1) { // 临时文件重新命名
        char *cwdp = getcwd(cwd,MAXPATHLEN);
        serverLog(LL_WARNING,
            "Error moving temp DB file %s on the final "
            "destination %s (in server root dir %s): %s",
            tmpfile,
            filename,
            cwdp ? cwdp : "unknown",
            strerror(errno));
        unlink(tmpfile);
        stopSaving(0);
        return C_ERR;
    }

    serverLog(LL_NOTICE,"DB saved on disk"); // 日志保存
    server.dirty = 0; // 最后的变量该置空&该保存状态的
    server.lastsave = time(NULL);
    server.lastbgsave_status = C_OK;
    stopSaving(1); // 停止保存
    return C_OK;

werr:
    serverLog(LL_WARNING,"Write error saving DB on disk: %s", strerror(errno));
    if (fp) fclose(fp);
    unlink(tmpfile);
    stopSaving(0);
    return C_ERR;
}

```

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

### 使用场景:「2021-03-16」
* 执行command
* 条件命令 conf配置
* shutdown时

#### rdbSave usage location:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210316_083902.png)

>关于rdbSaveBackgroud的使用地方:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210316_085205.png)

### 关于rdbsave和redis如何联系的？
>写到这里的才慢慢理解这个里面的关系，如果你问我为啥不在前面就列出来关系图呢？

>那我只能说这是一个学习的正常流程，抓住其中的关键点，先看实现，然后再向外扩散，由内而外.

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/redis-2021-03-16-13-48-23.png)


**如果区分下redis的上下层面的关系，那就可以大致分为三层：command+底层实现+最底层的IO操作等.**

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/redis-2021-03-16-13-58-41.png)

**再细分下中间的过程**
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210316_021414.png)

### Todo
- [x] rdb快速备份原因: fork主进程
- [ ] 故障「断电」等恢复机制
- [ ] 主备复制怎么进行的？

### End