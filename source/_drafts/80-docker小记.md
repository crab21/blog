---
title: 80-docker小记
date: 2021-09-07 09:24:23
tags:
---


#### 删除所有的images
eg: 删除所有的none镜像
```go
docker rmi $(docker images | grep '<none>' | awk '{print $3}')
```

#### 一键安装docker「centos/ubuntu/debian」

```go
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```