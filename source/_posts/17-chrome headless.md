---
title: 「17」chrome headless「截图/PDF/DOM...」
keywords: 'chrome,chrome headless'
tags:
  - chrome
  - Day
abbrlink: 5544baea
date: 2020-11-10 19:25:32
updated: 2020-11-10 19:25:32
---

>最近在搞一个需求：html「文件」渲染成png/jpg；chrome不能装在服务器中，可以打成docker镜像。
说到这个，很多人肯定说很容易啊，chrome headless有现成的，直接用，它是不香么。
然而事情并没有这么简单；

### 难点：
```go
    1、服务器中不能装chrome
    2、chrome必须打在docker里面
    3、渲染效果要和在本地效果一样：图片不能丢失字体，不能失真。
    4、不能启动新的服务
```

<!--more-->
### 切入点：
```go 
docker && chrome
```

>so先去搜一把有没有现成的可用？

![](https://raw.githubusercontent.com/crab21/Images/master/20201110-193745.png)

分析分析吧：

* [browserless](https://github.com/browserless/chrome)
* [puppeteer](https://github.com/puppeteer/puppeteer)
* [prisma-archive](https://github.com/prisma-archive/chromeless)
..........
    * 适合启动服务，然后进行测试或者跑服务
    * 入参数为url

>所以上述的基本不符合需求，再寻找.....

### [Zenika/alpine-chrome](https://github.com/Zenika/alpine-chrome)

>看起来可行：

![](https://raw.githubusercontent.com/crab21/Images/master/20201110-194452.png)


这个经过验证总会有一个错误：
```
[1110/031547.366909:ERROR:bus.cc(393)] Failed to connect to the bus: Failed to connect to socket /var/run/dbus/system_bus_socket: No such file or directory
[1110/031547.367451:WARNING:dns_config_service_posix.cc(342)] Failed to read DnsConfig.
[1110/031547.437879:WARNING:dns_config_service_posix.cc(342)] Failed to read DnsConfig.
[1110/031549.073431:ERROR:headless_shell.cc(591)] Writing to file code/ss.png was unsuccessful, could not open file: FILE_ERROR_ACCESS_DENIED
```

文件没权限哦，尴尬了,再修正：
>发现源码有一段添加了用户，汗，太搞了.

[点击查看](https://github.com/Zenika/alpine-chrome/blob/master/Dockerfile#L38)

![](https://raw.githubusercontent.com/crab21/Images/master/20201110-194711.png)


```
很郁闷这个chrome用户干嘛的，如果真用这个，那得确定你跑的环境要允许你添加一个user出来，很明显不行,
这样导致整个alpine-chrome服务权限都是乱的「chrome用户的」,最明显的是无法读写文件，因为你这个add chrome没权限。

最直接的，去掉就好了。

果然去掉后，跑docker就可以了
```

[docker镜像地址](https://hub.docker.com/r/zenika/alpine-chrome)

这个是可以了，但是有一个新的问题，图像失真了，再去查github源码，坑那，压根没有装全文字库，只简单装了lib***的库。


### 再尝试「自己搞个docker images」

>别人都能搞，为何我不可以勒

### 分析：
* 本地跑这个服务是ok的，那chrome就是依赖macos/linux系统的
* 那可以搞个linux系统，再装个chrome
* 最后把字体装完就ok了
* 最后的最后，想办法直接可以用这个docker，不用启动服务，也就是说docker run之后有了结果，直接rm掉。


### 思路：
* 1、搞个docker debain系统
* 2、想办法把chrome装上
* 3、在里面跑一个测试，看能否生成图片
* 4、安装缺失的字体
* 5、container跑起来
* 6、导出container，再导入到本地的images；让container变成images
* 7、自己搞个Dockerfile，把「RUN」接口留出来，方便可以直接跑起来
* 8、再把搞好的images导出来用就可以了。

### 步骤：
#### 1
```
docker pull debian
```

#### 2/3/4/5
```
1、进入系统
docker exec -it XXXXX /bin/bash
2、更新源
apt-get update
3、下载wget
apt-get install wget
4、下载chrome linux版本的
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
5、安装chrome
 dpkg -i ******.deb
 解决依赖关系：
    apt-get -f install
6、跑一把发现汉字变问好「？」了
7、安装缺失的字体
apt-get install ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy
```

#### 6导出container
```
1、导出container
docker export container_name > chrome.tar
2、导入到images中
docker load < chrome.tar
```

#### 7自己搞Dockerfile,预留「RUN」接口

Dockerfile文件：
```
#这个是上一步导入的images
FROM gogoowang/chrome:v1
RUN mkdir -p /home
WORKDIR /home
ENTRYPOINT ["chrome","--headless","--disable-gpu"]
```

>构建成镜像：docker build -t gogoo/chrome:v2 . 

PS:「/home」的含义就是这个images的工作目录是/home文件夹下面

#### 8跑一把，收工

### 注意点：
#### PS-1
```
1、错误❌
docker container run -it --rm -v /tmp:/home gogoowang/chrome:v1 --no-sandbox --screenshot --hide-scrollbars /XXXX/XXXX.html
2、正确
docker container run -i --rm -v /tmp:/home gogoowang/chrome:v1 --no-sandbox --screenshot=/home/xx.png --hide-scrollbars /XXXX/XXXX.html

少一个 -t，这个 -t：再搞一个临时的TTy来跑程序，既然是后台跑的，那就没必要了
```

#### PS-2

```
docker container run -i --rm -v /tmp:/home gogoowang/chrome:v1 --no-sandbox --screenshot=/home/xx.png --hide-scrollbars /XXXX/XXXX.html

1、关于这个-v的问题,后面就固定了，具体见Dockerfile中
2、--screenshot路径问题，既然是docker镜像，那就得填个docker镜像中的地址，那就是/home下面了
```


### 优化后一键脚本
Dockerfile文件：
```
FROM debian
RUN apt-get update 
RUN apt-get install -y wget 
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
RUN dpkg -i google-chrome-stable_current_amd64.deb || true
RUN apt-get -f -y install
RUN apt-get install -y ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy
RUN mkdir -p /home
WORKDIR /home
ENTRYPOINT ["/opt/google/chrome/chrome","--headless","--disable-gpu"]
```
构建：
>docker build -t google-chrome:latest .