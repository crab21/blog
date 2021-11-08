---
title: 「82」openwrt 折腾记
date: 2021/11/07 18:38:24
tags:
    - openwrt
    - 软路由
    - 网络
---


最近买了个switch，因某些需求用到软路由，so....来折腾下。

<!--more-->


### openwrt 地址

[👉🏿 esir GDQ版本 :](https://drive.google.com/drive/folders/1dqNUrMf9n7i3y1aSh68U5Yf44WQ3KCuh)

具体选择见下图：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/1161636220122_.pic_hd.jpg)


### 配置问题：

我这里采用docker跑的程序，so....需要镜像 
客户端：imrcrab/naive-client:v0.1.95
服务端：imrcrab/naive-server:v0.2


>具体的可以在hub.docker.com里面搜索。

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20211107_065042.png)

#### 服务端：

>这里不多说，具体看教程：[Naive server搭建](https://hub.docker.com/r/imrcrab/naive-server)

#### 客户端：

```go
两步：
1、创建网络
2、docker run.....
```

##### 网络创建方式：

>三步完成：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20211107_065902.png)


##### 具体命令
openwrt装好后，直接跑docker命令即可：

```go
docker run -itd --restart=always --network=gogo -m 300m --kernel-memory 310m --name naive95-client -p 10899:10800 -v /etc/localtime:/etc/localtime  imrcrab/naive-client:v0.1.95.2
```

```markdown
    这里有一点很重要:
        --network参数: 代表需要桥接的网络,我这里采用的是上一步自建的gogo
```


#### openwrt连接

```go
找一个可以sock5 proxy的软件，填上上面的proxy port: 10800。

确认好即可。
```

### 目前网络图：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20211107_070906.png)

### 致谢
 * [LEDE](https://github.com/coolsnowwolf/lede)
 * [esirplayground](https://github.com/esirplayground/AutoBuild-OpenWrt)
 * [Naive](https://github.com/klzgrad/naiveproxy)