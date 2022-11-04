---
title: 「52」Mysql Top N问题
date: '2021/05/19 00:50:51'
updated: '2021/05/19 00:51:51'
mathjax: true
tags:
  - Day
  - MySQL
abbrlink: 2dfee217
---


### 问题是这样的：
![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210519_125155.png)

>求不同的age分组，按照createTime正序「从小到大」排序的前N个。

<!--more-->

### 解决办法：

```go

SELECT
        t1.*
    FROM
    table_a t1
    where (SELECT count(*) + 1 FROM table_a t2 WHERE t2.age = t1.age AND t2.create_time > t1.create_time ) <=1 order by create_time desc

```

#### 结果：

> 按照age分组，createTime正序排序的Top 2数据

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210519_125510.png)


### END

