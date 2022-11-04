---
title: 「62」redis rehash过程
date: '2021/08/28 18:01:32'
updated: '2021/08/28 18:36:44'
tags:
  - Redis
  - Hash
  - 源码
abbrlink: f733f408
---

### 前序

>之前有提到过[👉🏿 redis 中hash的介绍](https://blog.imrcrab.com/archives/68b4ef49.html#more),如果不了解可以先看看 热热身。


### rehash

#### 时机：

```go
1、定时任务。
2、对dict的find/delete/add等操作时触发。
```
<!--more-->
![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210817_115402.png)


#### 源码分析：

```c++

/* Performs N steps of incremental rehashing. Returns 1 if there are still
 * keys to move from the old to the new hash table, otherwise 0 is returned.
 *
 * Note that a rehashing step consists in moving a bucket (that may have more
 * than one key as we use chaining) from the old to the new hash table, however
 * since part of the hash table may be composed of empty spaces, it is not
 * guaranteed that this function will rehash even a single bucket, since it
 * will visit at max N*10 empty buckets in total, otherwise the amount of
 * work it does would be unbound and the function may block for a long time. */
int dictRehash(dict *d, int n) {
    // 最大可以接受的空bucket数量
    int empty_visits = n*10; /* Max number of empty buckets to visit. */
    if (!dictIsRehashing(d)) return 0;
    // ht第一个位置放的未rehash「没有转移前」的数据，第二个位置放的rehash后的数据。
    while(n-- && d->ht_used[0] != 0) {
        dictEntry *de, *nextde;

        /* Note that rehashidx can't overflow as we are sure there are more
         * elements because ht[0].used != 0 */
         // rehashidx的值不能超过最大值，发生溢出
        assert(DICTHT_SIZE(d->ht_size_exp[0]) > (unsigned long)d->rehashidx);
        while(d->ht_table[0][d->rehashidx] == NULL) {
            // 跳过空bucket
            d->rehashidx++;
            if (--empty_visits == 0) return 1;
        }
        // 取出数组的rehashidx下标对应的值，
        de = d->ht_table[0][d->rehashidx];
        /* Move all the keys in this bucket from the old to the new hash HT */
        while(de) {
            uint64_t h;

            nextde = de->next;
            /* Get the index in the new hash table */
            // 计算hash值
            h = dictHashKey(d, de->key) & DICTHT_SIZE_MASK(d->ht_size_exp[1]);
            de->next = d->ht_table[1][h];
            d->ht_table[1][h] = de;
            d->ht_used[0]--;
            d->ht_used[1]++;
            // de指向下一个
            de = nextde;
        }
        // 把ht【0】置空
        d->ht_table[0][d->rehashidx] = NULL;
        d->rehashidx++;
    }

    /* Check if we already rehashed the whole table... */
    if (d->ht_used[0] == 0) {
         // chek ht,并释放，ht第一个元素为空，则把 ht[0] = ht[1],这个时候ht[1]为空，ht[0]为整体rehash后的值
        zfree(d->ht_table[0]);
        /* Copy the new ht onto the old one */
        d->ht_table[0] = d->ht_table[1];
        d->ht_used[0] = d->ht_used[1];
        d->ht_size_exp[0] = d->ht_size_exp[1];
        _dictReset(d, 1);
        d->rehashidx = -1;
        return 0;
    }

    /* More to rehash... */
    return 1;
}
```

### doing....