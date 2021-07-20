---
title: 「60」wireshark usage
date: 2021-07-19 10:43:34
tags:
---

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_090654.png)

<!--more-->

### [👉🏿wireshark介绍](https://baike.baidu.com/item/Wireshark/10876564)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_112815.png)
### Modules

#### [👉👉http](https://www.wireshark.org/docs/dfref/h/http.html)

##### http.accept

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_095722.png)

#### http.request.method
>http.request.method==GET

>http.request.method==POST

>......


![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_100002.png)

##### http.response

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_100229.png)

##### http.response.code

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_100414.png)

##### http.request.uri

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_100519.png)

##### http.request.full_uri

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_100739.png)


##### other

参考上面的例子，使用其余的字段值。

#### ip

##### ip.addr
>addr:127.0.0.1     http请求    port:8001
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_105408.png)

##### ip.host

>官方解释：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_110147.png)

>eg：
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_110319.png)

##### ip.proto

>[→→→→官方文档：](https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_110553.png)

>eg: ICMP

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_110643.png)

>eg: UDP

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_111049.png)

##### ip.version

>官方文档
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_113128.png)

>eg: IPV4

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_113100.png)

##### ip.ttl

>eg:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_113728.png)

#### tcp

##### tcp.dstport

>eg: 9026
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_114812.png)

##### tcp.port

>eg: 9026

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_114949.png)

##### tcp.stream

>eg: ==0
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_120621.png)

#### tls

### Import/Export package

>导入和导出方法异曲同工

#### export

##### 方法一：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_101005.png)

##### 方法二：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_101111.png)

#### import

##### 方法一：
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_101232.png)

##### 方法二：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210719_101322.png)


### Preferences

### Others

### Reference