---
title: Git常用技巧
date: 2020-09-01 19:22:02
keywords: git,git技巧,git常用技巧
tags:
    - Git
---
### 学习方式
多练多得，直接学习[官网](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%85%B3%E4%BA%8E%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6)理解。

以下仅仅是部分用到的场景和部分场景记录，不代表全部情况，如有错误，请及时指正。

### Git版本：
```
1944 ± git version 
git version 2.28.0
```
### 先说说Git的常用命令：(可跳过)
<!-- more -->
```
2081 ◯  git 
用法：git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]

这些是各种场合常见的 Git 命令：

开始一个工作区（参见：git help tutorial）
   clone             克隆仓库到一个新目录
   init              创建一个空的 Git 仓库或重新初始化一个已存在的仓库

在当前变更上工作（参见：git help everyday）
   add               添加文件内容至索引
   mv                移动或重命名一个文件、目录或符号链接
   restore           恢复工作区文件
   rm                从工作区和索引中删除文件
   sparse-checkout   初始化及修改稀疏检出

检查历史和状态（参见：git help revisions）
   bisect            通过二分查找定位引入 bug 的提交
   diff              显示提交之间、提交和工作区之间等的差异
   grep              输出和模式匹配的行
   log               显示提交日志
   show              显示各种类型的对象
   status            显示工作区状态

扩展、标记和调校您的历史记录
   branch            列出、创建或删除分支
   commit            记录变更到仓库
   merge             合并两个或更多开发历史
   rebase            在另一个分支上重新应用提交
   reset             重置当前 HEAD 到指定状态
   switch            切换分支
   tag               创建、列出、删除或校验一个 GPG 签名的标签对象

协同（参见：git help workflows）
   fetch             从另外一个仓库下载对象和引用
   pull              获取并整合另外的仓库或一个本地分支
   push              更新远程引用和相关的对象

命令 'git help -a' 和 'git help -g' 显示可用的子命令和一些概念帮助。
查看 'git help <命令>' 或 'git help <概念>' 以获取给定子命令或概念的
帮助。
有关系统的概述，查看 'git help git'
```

### Git使用：

#### 生成密钥
```
ssh-keygen -t rsa -C "这里换上你的邮箱"
```

最后得到`id_rsa`和`id_rsa.pub`两个文件。

#### Git配置信息

##### 查看配置信息
```
查看系统配置信息
* git config --system --list

当前用户配置
* git config --global --list

查看当前仓库配置
* git config --local --list
```

##### 设置用户信息
全局设置：
```
git config --global user.name "crab"
git config --global user.email "imrcrab@163.com"
```

当前仓库生效：
```
git config --local user.name "crab"
git config --local user.email "imrcrab@163.com"
```



#### Git Remote

##### 新增remote地址

```
git remote add upstream http://github/**remote**/test.git
git remote -v 可以查看具体路径
```
##### merge/fetch远程代码到XXX分支
```
1、git fetch upstream。
2、切回到master分支。
3、git merge upstream/master 合并远程upstream分支到本地master。
4、解决冲突或其他问题。
```

#### Git 误删除恢复

```
1、git  fsck --lost -found :查看最近移除的文件.
2、git show  '误删编号'：查看删除文件内容.
3、git merge ‘误删编号’： 本地合并误删的文件内容.
```

#### Git reset撤回操作
```
1、git reflog
2、git reset COMMITID    就可以回到COMMITID那个分支和版本。
```

#### Git分支

##### 用法 
>获取用法：Git branch -d --help

```
用法：git branch [<选项>] [-r | -a] [--merged | --no-merged]
  或：git branch [<选项>] [-l] [-f] <分支名> [<起始点>]
  或：git branch [<选项>] [-r] (-d | -D) <分支名>...
  或：git branch [<选项>] (-m | -M) [<旧分支>] <新分支>
  或：git branch [<选项>] (-c | -C) [<老分支>] <新分支>
  或：git branch [<选项>] [-r | -a] [--points-at]
  或：git branch [<选项>] [-r | -a] [--format]

通用选项
    -v, --verbose         显示哈希值和主题，若参数出现两次则显示上游分支
    -q, --quiet           不显示信息
    -t, --track           设置跟踪模式（参见 git-pull(1)）
    -u, --set-upstream-to <上游>
                          改变上游信息
    --unset-upstream      取消上游信息的设置
    --color[=<何时>]      使用彩色输出
    -r, --remotes         作用于远程跟踪分支
    --contains <提交>     只打印包含该提交的分支
    --no-contains <提交>  只打印不包含该提交的分支
    --abbrev[=<n>]        用 <n> 位数字显示 SHA-1 哈希值

具体的 git-branch 动作：
    -a, --all             列出远程跟踪及本地分支
    -d, --delete          删除完全合并的分支
    -D                    删除分支（即使没有合并）
    -m, --move            移动/重命名一个分支，以及它的引用日志
    -M                    移动/重命名一个分支，即使目标已存在
    -c, --copy            拷贝一个分支和它的引用日志
    -C                    拷贝一个分支，即使目标已存在
    -l, --list            列出分支名
    --show-current        显示当前分支名
    --create-reflog       创建分支的引用日志
    --edit-description    标记分支的描述
    -f, --force           强制创建、移动/重命名、删除
    --merged <提交>       只打印已经合并的分支
    --no-merged <提交>    只打印尚未合并的分支
    --column[=<风格>]     以列的方式显示分支
    --sort <key>          排序的字段名
    --points-at <对象>    只打印指向该对象的分支
    -i, --ignore-case     排序和过滤属于大小写不敏感
    --format <格式>       输出格式
```

##### 获取所有分支
```
git branch -r | grep -v '\->' | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
git fetch --all
git pull --all
```
##### add/remove分支
新建&切换:
```
git checkout -b iss53

是下面两条的简写：
git branch iss53
git checkout iss53
```
删除分支：
```
git branch -d iss53
```

#### Git stash

##### 常用：
```
（1）git stash save "save message"  : 执行存储时，添加备注，方便查找，只有git stash 也要可以的，但查找时不方便识别。
（2）git stash list  ：查看stash了哪些存储
（3）git stash show ：显示做了哪些改动，默认show第一个存储,如果要显示其他存贮，后面加stash@{$num}，比如第二个 git stash show stash@{1}
（4）git stash show -p : 显示第一个存储的改动，如果想显示其他存存储，命令：git stash show  stash@{$num}  -p ，比如第二个：git stash show  stash@{1}  -p
（5）git stash apply :应用某个存储,但不会把存储从存储列表中删除，默认使用第一个存储,即stash@{0}，如果要使用其他个，git stash apply stash@{$num} ， 比如第二个：git stash apply stash@{1} 
（6）git stash pop ：命令恢复之前缓存的工作目录，将缓存堆栈中的对应stash删除，并将对应修改应用到当前的工作目录下,默认为第一个stash,即stash@{0}，如果要应用并删除其他stash，命令：git stash pop stash@{$num} ，比如应用并删除第二个：git stash pop stash@{1}
（7）git stash drop stash@{$num} ：丢弃stash@{$num}存储，从列表中删除这个存储
（8）git stash clear ：删除所有缓存的stash
```

#### Git Tag

##### 常用：
```
2097 ± git tag -a --help
用法：git tag [-a | -s | -u <key-id>] [-f] [-m <消息> | -F <文件>]
		<标签名> [<头>]
  或：git tag -d <标签名>...
  或：git tag -l [-n[<数字>]] [--contains <提交>] [--no-contains <提交>] [--points-at <对象>]
		[--format=<格式>] [--[no-]merged [<提交>]] [<模式>...]
  或：git tag -v [--format=<格式>] <标签名>...

    -l, --list            列出标签名称
    -n[<n>]               每个标签信息打印 <n> 行
    -d, --delete          删除标签
    -v, --verify          验证标签

标签创建选项
    -a, --annotate        附注标签，需要一个说明
    -m, --message <说明>  标签说明
    -F, --file <文件>     从文件中读取提交说明
    -e, --edit            强制编辑标签说明
    -s, --sign            附注并附加 GPG 签名的标签
    --cleanup <模式>      设置如何删除提交说明里的空格和#注释
    -u, --local-user <key-id>
                          使用另外的私钥签名该标签
    -f, --force           如果存在，替换现有的标签
    --create-reflog       创建引用日志

标签列表选项
    --column[=<风格>]     以列的方式显示标签列表
    --contains <提交>     只打印包含该提交的标签
    --no-contains <提交>  只打印不包含该提交的标签
    --merged <提交>       只打印已经合并的标签
    --no-merged <提交>    只打印尚未合并的标签
    --sort <key>          排序的字段名
    --points-at <对象>    只打印指向该对象的标签
    --format <格式>       输出格式
    --color[=<何时>]      遵照格式中的颜色输出
    -i, --ignore-case     排序和过滤属于大小写不敏感
```

##### 打Tag
```
git tag -a v0.0.1 -m "V0.0.1" 
```

##### 删除Tag

```
git tag -d v0.0.1
```

##### 推送Tag

```
git push origin master --tags
```

#### Git push

##### 用法
```
用法：git push [<选项>] [<仓库> [<引用规格>...]]

    -v, --verbose         更加详细
    -q, --quiet           更加安静
    --repo <仓库>         仓库
    --all                 推送所有引用
    --mirror              镜像所有引用
    -d, --delete          删除引用
    --tags                推送标签（不能使用 --all or --mirror）
    -n, --dry-run         演习
    --porcelain           机器可读的输出
    -f, --force           强制更新
    --force-with-lease[=<引用名>:<期望值>]
                          要求引用旧的取值为设定值
    --recurse-submodules (check|on-demand|no)
                          控制子模组的递归推送
    --thin                使用精简打包
    --receive-pack <receive-pack>
                          接收包程序
    --exec <receive-pack>
                          接收包程序
    -u, --set-upstream    设置 git pull/status 的上游
    --progress            强制显示进度报告
    --prune               清除本地删除的引用
    --no-verify           绕过 pre-push 钩子
    --follow-tags         推送缺失但有关的标签
    --signed[=(yes|no|if-asked)]
                          用 GPG 为推送签名
    --atomic              需要远端支持原子事务
    -o, --push-option <server-specific>
                          传输选项
    -4, --ipv4            只使用 IPv4 地址
    -6, --ipv6            只使用 IPv6 地址
```

#### Git rebase

##### 变基遵守的原则

```
如果提交存在于你的仓库之外，而别人可能基于这些提交进行开发，那么不要执行变基。---[官网变基](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%8F%98%E5%9F%BA)

TODO 后续更新此过程
```


##### 经典用法：
>git rebase --help
```
Assume the following history exists and the current branch is "topic":

              A---B---C topic
             /
        D---E---F---G master
From this point, the result of either of thefollowing 

commands:
    git rebase master
    git rebase master topic


would be:
                      A'--B'--C' topic
                     /
        D---E---F---G master
```

##### rebase场景：

[官网例子](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%8F%98%E5%9F%BA)



### Git 快速场景：
其实还是对上述命令的活学活用。

#### Git Reset场景
```
1. 本地修改了一堆文件(并没有使用git add到暂存区)，想放弃修改。
单个文件/文件夹：

git checkout -- filename

所有文件/文件夹：

git checkout .
 
2. 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
单个文件/文件夹：

$ rm filename / rm dir -rf

所有文件/文件夹：

$ git clean -xdf

// 删除新增的文件，如果文件已经已经git add到暂存区，并不会删除！

3. 本地修改/新增了一堆文件，已经git add到暂存区，想放弃修改。
单个文件/文件夹：

git reset HEAD filename

所有文件/文件夹：

git reset HEAD .
 
4. 本地通过git add & git commit 之后，想要撤销此次commit和代码

git reset commit_id

这个id是你想要回到的那个节点，可以通过git log查看，可以只选前6位
// 撤销之后，你所做的已经commit的修改还在工作区！

git reset --hard commit_id

这个id是你想要回到的那个节点，可以通过git log查看，可以只选前6位
// 撤销之后，你所做的已经commit的修改将会清除，仍在工作区/暂存区的代码不会清除！

5. git add & git commit 提交后，只想回滚commit：
	git reset --soft HEAD^
	注意这仅仅是回滚了你的commit，代码依旧在的。
```

### 持续更新......