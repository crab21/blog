---
title: 「83」mysql小记
date: '2021/12/30 22:09:37'
tags:
  - MySQL
  - 小记
abbrlink: b09eedc6
---


MySQL常见的问题：
* select 
    * group by、order by、having 、 join等执行顺序
    * 关于_rowid隐藏列
    * group by用法
* MMVC
    * 解决的问题

* 误区  
    * group by和having

* 索引不命中情况

* 效率问题
    * in后面接大量数据效率低问题
* .......
<!--more-->
### select 问题

#### group by、order by、having 、 join等执行顺序

>[摘抄自MySQL ☞ 13.2.10 SELECT Statement](https://dev.mysql.com/doc/refman/8.0/en/select.html)
```sql
SELECT
    [ALL | DISTINCT | DISTINCTROW ]
    [HIGH_PRIORITY]
    [STRAIGHT_JOIN]
    [SQL_SMALL_RESULT] [SQL_BIG_RESULT] [SQL_BUFFER_RESULT]
    [SQL_NO_CACHE] [SQL_CALC_FOUND_ROWS]
    select_expr [, select_expr] ...
    [into_option]
    [FROM table_references
      [PARTITION partition_list]]
    [WHERE where_condition]
    [GROUP BY {col_name | expr | position}, ... [WITH ROLLUP]]
    [HAVING where_condition]
    [WINDOW window_name AS (window_spec)
        [, window_name AS (window_spec)] ...]
    [ORDER BY {col_name | expr | position}
      [ASC | DESC], ... [WITH ROLLUP]]
    [LIMIT {[offset,] row_count | row_count OFFSET offset}]
    [into_option]
    [FOR {UPDATE | SHARE}
        [OF tbl_name [, tbl_name] ...]
        [NOWAIT | SKIP LOCKED]
      | LOCK IN SHARE MODE]
    [into_option]

into_option: {
    INTO OUTFILE 'file_name'
        [CHARACTER SET charset_name]
        export_options
  | INTO DUMPFILE 'file_name'
  | INTO var_name [, var_name] ...
}
```

这个看看自然明白：

```
1. 先连接from后的数据源(若有join，则先执行on后条件，再连接数据源)。
2. 执行where条件
3. 执行group by
4. 执行having
5. 执行order by
```
#### 关于_rowid隐藏列

同样的，先看[☞官方资料](https://dev.mysql.com/doc/refman/8.0/en/create-table.html)


>不过有一点需要注意：

>If a table has a PRIMARY KEY or UNIQUE NOT NULL index that consists of a single column that has an integer type, you can use _rowid to refer to the indexed column in SELECT statements, as described in [Unique Indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html#create-index-unique).

#### group by用法
[官方资料: ☞ GROUP BY](https://dev.mysql.com/doc/refman/8.0/en/group-by-handling.html)

注意点：

> Before 5.7.5, MySQL does not detect functional dependency and ONLY_FULL_GROUP_BY is not enabled by default. For a description of pre-5.7.5 behavior, see the MySQL [5.6 Reference Manual](https://dev.mysql.com/doc/refman/5.6/en/sql-mode.html).


### MMVC问题

[☞官方资料](https://dev.mysql.com/doc/refman/8.0/en/innodb-multi-versioning.html)

这里不做过多解释了，就是个逻辑+锁的实现。



### 使用误区

#### group by和having
group by 和having的顺序小问题：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/2022/clipboard_20220129_060235.png)

```sql
select id,name,_rowid from test.table_name having  id>2 group by  id; ❎
select id,name,_rowid from test.table_name  group by  id where  id>2; √
select id,name,_rowid from test.table_name where  id>2 group by  id;  √
```

### 索引不命中情况

### 效率问题

#### IN 和 Exists

[IN](https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html#operator_in)
[EXISTS](https://dev.mysql.com/doc/refman/8.0/en/exists-and-not-exists-subqueries.html)


看完总结下：
in：需要遍历后面的数据
exists: 需要查询数据库

select * from A where id in(select id from B)
select * from A where exists (select 1 from B where A.id=B.id);

B表数据大，推荐用exists。

### 工具使用

### Reference

* [☛ MMVC](https://segmentfault.com/a/1190000037557620)
* [☛ MySQL隐藏列](https://www.51cto.com/article/680143.html)
* [☛ 12.20.3 MySQL Handling of GROUP BY](https://dev.mysql.com/doc/refman/8.0/en/group-by-handling.html)
* [☛ 13.2.11.6 Subqueries with EXISTS or NOT EXISTS](https://dev.mysql.com/doc/refman/8.0/en/exists-and-not-exists-subqueries.html)