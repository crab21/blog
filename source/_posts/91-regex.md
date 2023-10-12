---
title: 「91」regex
abbrlink: ff6a07f
date: 2022-08-15 19:10:16
updated: 2022-11-12 19:10:16
tags:
---

### 场景：vscode
```
搜索空白：
^\s*(?=\r?$)\n


删除某些字符所在的行：
^.*(string1|string2|string3).*\n
```

### Linux

#### 删除文本中的空行
```shell
grep实现:

grep -v '^\s*$' test.txt
```

### awk

```
1、求和

cat data|awk '{sum+=$1} END {print "Sum = ", sum}'

2、求平均

cat data|awk '{sum+=$1} END {print "Average = ", sum/NR}'

3、求最大值

cat data|awk 'BEGIN {max = 0} {if ($1>max) max=$1 fi} END {print "Max=", max}'

4、求最小值（min的初始值设置一个超大数即可）

awk 'BEGIN {min = 1999999} {if ($1<min) min=$1 fi} END {print "Min=", min}'
```