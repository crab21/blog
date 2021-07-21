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

##### tls.alert_message
>[👉🏻👉🏻官方参考值](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.3)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_051727.png)

>eg:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_052127.png)

##### tls.compress_certificate.algorithm

>[👉🏻👉🏻官方参考值](https://datatracker.ietf.org/doc/html/rfc5246#section-7.4.1.4.1)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_051250.png)


>eg:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_050807.png)


##### tls.handshake.version

>[👉🏿👉🏿官方参考](https://tlsfingerprint.io/top/versions)

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_052921.png)

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

#### Resolve IP to {domain name}

>勾选此选项

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210721_074453.png)

> eg:

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210721_075010.png)

#### Follow TCP stream

>方式一：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210721_075630.png)

>方式二：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210721_075943.png)

>任选一个 eg: TCP stream「http stream方式相同，不再演示」

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210721_080616.png)


### Others



#### "TCP segment of reassembled PDU"

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_040500.png)

>关于这个网上有很多种解释，可以自行百度参考[👉🏿👉🏿👉🏿TCP segment of reassembled PDU](https://www.google.com.hk/search?newwindow=1&lei=oHX2YOmaPMiFr7wPj76ViAg&q=tcp%20segment%20of%20a%20reassembled%20pdu%E5%8E%9F%E5%9B%A0&ved=2ahUKEwjp6v7iivHxAhXIwosBHQ9fBYEQsKwBKAF6BAgwEAI&biw=2560&bih=1253)

>关于这个问题，抓包看看，ack是一样的，当前的next sequence number是下一个的sequence number.
![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210720_041222.png)

### Reference

* [☞ wireshark官网](https://www.wireshark.org/)

* [→→datatracker](https://datatracker.ietf.org/doc/html/rfc5246#section-7.3)

* [→→micrsoft](https://techcommunity.microsoft.com/t5/iis-support-blog/ssl-tls-alert-protocol-and-the-alert-codes/ba-p/377132)

* [→→tls finger print](https://tlsfingerprint.io/top/versions)
* [→→tls version](https://tlsfingerprint.io/top/versions)
* [→→List of IP protocol numbers](https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers)

* [👉🏻 module: tls](https://www.wireshark.org/docs/dfref/t/tls.html)
* [👉🏻 module: IP](https://www.wireshark.org/docs/dfref/i/ip.html)
* [👉🏻 module: HTTP](https://www.wireshark.org/docs/dfref/h/http.html)

* [☛ wireshak过滤规则](https://www.cnblogs.com/v1vvwv/p/Wireshark-filtering-rules.html)

* [☛ wireshark基本用法及过滤规则](https://www.jianshu.com/p/d4d7ad6cc95f)


