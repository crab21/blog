---
title: 「60」wireshark usage
abbrlink: 8afe733
date: 2021-07-19 10:43:34
tags:
---

<!--more-->

## [👉🏿wireshark介绍](https://baike.baidu.com/item/Wireshark/10876564)

## Modules

### [👉👉HTTP](https://www.wireshark.org/docs/dfref/h/http.html)

```
http.request.method==GET
http.request.method==POST
http.response
http.response.code
http.request.uri
http.request.full_uri
```

### [👉👉IP](https://www.wireshark.org/docs/dfref/i/ip.html)

```
ip.addr
ip.host
ip.proto
ip.version
ip.ttl
```

### [👉👉TCP](https://www.wireshark.org/docs/dfref/t/tcp.html)



```
tcp.dstport
tcp.port
tcp.stream
tls.alert_message
tls.compress_certificate.algorithm
```


### [👉👉TLS](https://www.wireshark.org/docs/dfref/t/tls.html)

* [👉🏻👉🏻tls.alert_message](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.3)

* [👉🏻👉🏻tls.compress_certificate.algorithm](https://datatracker.ietf.org/doc/html/rfc5246#section-7.4.1.4.1)

* [👉🏿👉🏿tls.handshake.version](https://tlsfingerprint.io/top/versions)

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210720_052921.png)

### [👉👉JSON](https://www.wireshark.org/docs/dfref/j/json.html)

> 当Content-Type: application/json  时候可以查询相应的key或者value

```
json.key contains "xxxx"
json.value.string contains "xxxxxxxxxxxxxx"
```


## "TCP segment of reassembled PDU"

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210720_040500.png)

>关于这个网上有很多种解释，可以自行百度参考[👉🏿👉🏿👉🏿TCP segment of reassembled PDU](https://www.google.com.hk/search?newwindow=1&lei=oHX2YOmaPMiFr7wPj76ViAg&q=tcp%20segment%20of%20a%20reassembled%20pdu%E5%8E%9F%E5%9B%A0&ved=2ahUKEwjp6v7iivHxAhXIwosBHQ9fBYEQsKwBKAF6BAgwEAI&biw=2560&bih=1253)

>关于这个问题，抓包看看，ack是一样的，当前的next sequence number是下一个的sequence number.
![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210720_041222.png)


## 文档搜索

```
https://www.wireshark.org/docs/dfref/i/ip.html

https://www.wireshark.org/docs/dfref/首字母/模块名称.html
```

![](https://raw.githubusercontent.com/crab21/Images/master/2023/2023-03-21-22-24-33-ba663d3325437c7db78b614a272736a1-202303212224542-bfcff9.png)

## Reference

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


