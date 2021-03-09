---
title: 「42」Git Log常用场景
date: '2021/03/09 08:10:17'
updated: '2021/03/09 08:10:17'
keywords: 'Git'
tags:
  - Git
  - Day
mathjax: true
---

## 前序：
前面有总结过[Git常用的一些操作](https://blog.imrcrab.com/archives/3c1dd822.html)

最近有很多使用到git log -- 的命令和需求，所以来搞搞这个git log的用法:

<!--more-->

## git log命令基本使用：

>这里只能用go仓库的log来演示和学习log相关操作。

### 版本：

```go
$ git version
git version 2.24.3 (Apple Git-128)
```


### 常用及展示：

#### git log --help

>查看使用方法「划重点」：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_010044.png)

**图中option地方为可选的配置项**

#### git log 

>组成部分：

* commit ID
* author
* date
* commit message

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_125518.png)

#### git log --s***

>git log --s 然后按tab建就可以看到下面的信息，

```git
$ git log --s
--shortstat               -- generate summary diffstat
--show-linear-break       -- show a barrier between commits from different branches
--show-signature          -- validate GPG signature of commit
--simplify-by-decoration  -- show only commits that are referenced by a ref
--simplify-merges         -- milder version of --full-history
--since                   -- show commits more recent than given date
--single-worktree         -- examine the current working tree only
--skip                    -- skip given number of commits before output
--source                  -- show which ref each commit is reached from
--sparse                  -- when paths are given, display only commits that changes any of them
--src-prefix              -- use given prefix for source
--stat                    -- generate diffstat instead of patch
--stdin                   -- additionally read commits from standard input
--submodule               -- select output format for submodule differences
--summary                 -- generate condensed summary of extended header information

```

##### git log --stat

>可以看到diff的文件信息
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_010656.png)

#### git log --pretty=?

```git
下面命令按下tab自动补全的信息：
$ git log --pretty= 
email    -- use email headers like From and Subject
format   -- specify own format
full     -- all parts of commit messages
fuller   -- like full and includes dates
medium   -- most parts of messages
oneline  -- commit-ids and subject of messages
raw      -- the raw commits
short    -- few headers and only subject of messages
```

##### git log --pretty=fuller

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_011529.png)

#### git log --author=?

> git log --author="Alex Brainman"

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_011728.png)

#### 合并在一起，所有基本信息：

>git log --author="Alex Brainman" --stat --graph --tags --pretty=oneline --decorate

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_012016.png)

#### 某个文件的log

>查看所有src/runtime文件夹的具体提交信息

```git
git log  --stat --graph --tags --pretty=oneline --decorate src/runtime/
```

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_012342.png)


##### pretty=fuller和pretty=oneline的区别：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_012556.png)

#### git log --before=*** --after=***

>pretty: oneline VS fuller
```git
git log  --stat --graph --tags --pretty=oneline --before="2021-03-09" --after="2020-03-10"  --decorate src/runtime/

git log  --stat --graph --tags --pretty=fuller --before="2021-03-09" --after="2020-03-10" --decorate src/runtime/
```

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210309_013157.png)

### End