---
title: 「91」regex
abbrlink: ff6a07f
date: 2022-08-15 19:10:16
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
