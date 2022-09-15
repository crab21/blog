---
title: 「44」redis-sds源码
date: '2021/04/12 23:15:43'
updated: '2021/07/26 13:09:17'
tags:
  - Redis
  - SDS
abbrlink: 9989a7c4
---

>SDS在redis中也算是用来存储string高效的做法，采用header+string的形式。



### 学完预期的目标:
* SDS 结构类型
* SDS 结构为何高效？
* 创建？
* 扩容？
* 释放？
* 复制？
* Join连接？
* Resize the allocation ？？
* 其它
<!--more-->

### SDS结构


> [☞☞ SDS官方定义](https://github.com/redis/redis/blob/unstable/src/sds.h#L43) 


>⚙️ 4种大小的定义，适配不同的场景需求。

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210726_112207.png)

### why高效?

#### 获取字符串长度：O(1)

sds: O(1)
c字符串： O(N)

#### 防止内存溢出

sds: 封装好的函数，易于操作和检查
c字符串：操作不当易内存溢出

#### 内存分配

sds: 空间预分配和惰性释放
c字符串：无此特性

#### 二进制安全

sds: 按照二进制方式处理，因此无限制
c字符串：必须符合编码（ascii），限制c中不能保存图片和音频等

### SDS API列表

>待更新...

### Reference

* [☞ SDS官方定义](https://github.com/redis/redis/blob/unstable/src/sds.h#L43)




* [👉🏿 Simple Dynamic Strings](https://github.com/antirez/sds)