---
title: Debian 升级kernel
tags:
  - linux
  - debian
  - vps
abbrlink: 2ea02468
date: 2022-09-15 22:15:33
updated: 2022-09-15 22:15:33
---


好久都没升级内核了，来试试升级下，尝下新特性。
当前系统：Debian 11 
内核： 5.10
目标内核： 5.18（当前最新的）
<!-- more -->

## 修改源（国外机器跳过）

> /etc/apt/source.list

[→ 清华源](https://mirrors.tuna.tsinghua.edu.cn/help/debian/)

```
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main contrib non-free
 
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-backports main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-backports main contrib non-free
 
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security bullseye-security main contrib non-free

```

## 更新源和软件

```
 sudo apt-get update && sudo apt-get dist-upgrade
```


## 安装内核

```
apt -t bullseye-backports install linux-image-amd64
apt -t bullseye-backports install linux-headers-amd64

reboot
```

### 精准安装
先找到想安装的版本，再重复【安装内核】过程
```
apt-cache search linux-image 
```
![](https://raw.githubusercontent.com/crab21/Images/master/2022/clipboard_20220916_012249.png)


## 效果图：

![](https://raw.githubusercontent.com/crab21/Images/master/2022/clipboard_20220916_012132.png)


## 🔚