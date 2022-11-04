---
title: 「84」tcpdump & wireshark
tags:
  - 抓包
  - 网络
  - tcpdump
  - 工具
abbrlink: a4b12394
date: 2022-02-03 18:00:37
---


[☞ tcpdump：](https://zh.wikipedia.org/wiki/Tcpdump)命令行下的转包工具。

<!--more-->

### 官方定义
[→ tcpdump官网](https://www.tcpdump.org/)

### 使用场景

```go
# -s 数据包的大小 port代表端口
tcpdump  -s 0 port 443

tcpdump -vvv -i eth0 
```
![](https://github.com/crab21/Images/tree/master/2022/clipboard_20220203_061422.png)
![](https://github.com/crab21/Images/tree/master/2022/clipboard_20220203_062657.png)
........
.......
.....

* 查看端口流量
* 抓取指定端口数据包，可用wireshark分析
* icmp/tcp/udp等抓包分析
* ....

### 基本用法

#### help用法

```
root@VM-4-8-debian:~# tcpdump --help
tcpdump version 4.99.0
libpcap version 1.10.0 (with TPACKET_V3)
OpenSSL 1.1.1k  25 Mar 2021
Usage: tcpdump [-AbdDefhHIJKlLnNOpqStuUvxX#] [ -B size ] [ -c count ] [--count]
		[ -C file_size ] [ -E algo:secret ] [ -F file ] [ -G seconds ]
		[ -i interface ] [ --immediate-mode ] [ -j tstamptype ]
		[ -M secret ] [ --number ] [ --print ] [ -Q in|out|inout ]
		[ -r file ] [ -s snaplen ] [ -T type ] [ --version ]
		[ -V file ] [ -w file ] [ -W filecount ] [ -y datalinktype ]
		[ --time-stamp-precision precision ] [ --micro ] [ --nano ]
		[ -z postrotate-command ] [ -Z user ] [ expression ]
```

>这么多的用法，不可能一个个说，可以见名知意的就不解释了。

这里有全部的命令行用法：

[⚡️ tcpdump library](https://packetlife.net/media/library/12/tcpdump.pdf)

#### 常见使用

```
# -e 打印header
tcpdump -e -i eth0  

# tcp-ack类型的
tcpdump -vv 'tcp-ack!=0' 
```


#### 高阶用法

[☞ tcpdump advanced](https://blog.wains.be/2007/2007-10-01-tcpdump-advanced-filters/)

```shell

root@VM-4-8-debian:~# tcpdump -vv 'tcp-ack!=0'
tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
18:47:10.998761 IP (tos 0x10, ttl 64, id 23027, offset 0, flags [DF], proto TCP (6), length 164)

    10.0.4.8.ssh > 111.18.5.47.8452: Flags [P.], cksum 0x82df (incorrect -> 0x3eec), seq 96990242:96990366, ack 1856675240, win 83, length 124
18:47:11.032067 IP (tos 0x64, ttl 46, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    111.18.5.47.8452 > 10.0.4.8.ssh: Flags [.], cksum 0x86f1 (correct), seq 1, ack 0, win 32579, length 0
18:47:11.043267 IP (tos 0x1c, ttl 249, id 8009, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54339 > 10.0.4.8.https: Flags [.], cksum 0xa0b6 (correct), seq 252872041, ack 855940619, win 65535, length 0
18:47:11.043320 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54339: Flags [R], cksum 0x353e (correct), seq 855940619, win 0, length 0
18:47:11.053616 IP (tos 0x64, ttl 46, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    111.18.5.47.8452 > 10.0.4.8.ssh: Flags [.], cksum 0x8676 (correct), seq 1, ack 124, win 32578, length 0
18:47:11.081297 IP (tos 0x10, ttl 64, id 23028, offset 0, flags [DF], proto TCP (6), length 172)
    10.0.4.8.ssh > 111.18.5.47.8452: Flags [P.], cksum 0x82e7 (incorrect -> 0x965f), seq 124:256, ack 1, win 83, length 132
18:47:11.081595 IP (tos 0x0, ttl 64, id 12233, offset 0, flags [DF], proto UDP (17), length 70)
    10.0.4.8.51812 > 183.60.83.19.domain: [bad udp cksum 0x189b -> 0xd360!] 24857+ PTR? 47.5.18.111.in-addr.arpa. (42)
18:47:11.117741 IP (tos 0x1c, ttl 249, id 57452, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54340 > 10.0.4.8.https: Flags [.], cksum 0xcd05 (correct), seq 1279984176, ack 855947195, win 65535, length 0
18:47:11.117792 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54340: Flags [R], cksum 0x1b8d (correct), seq 855947195, win 0, length 0
18:47:11.138039 IP (tos 0x64, ttl 46, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    111.18.5.47.8452 > 10.0.4.8.ssh: Flags [.], cksum 0x85f3 (correct), seq 1, ack 256, win 32577, length 0
18:47:11.192735 IP (tos 0x1c, ttl 249, id 22872, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54341 > 10.0.4.8.https: Flags [.], cksum 0x94a7 (correct), seq 1967847389, ack 855953771, win 65535, length 0
18:47:11.192787 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54341: Flags [R], cksum 0x01dc (correct), seq 855953771, win 0, length 0
18:47:11.268178 IP (tos 0x1c, ttl 249, id 1432, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54342 > 10.0.4.8.https: Flags [.], cksum 0x7592 (correct), seq 1082733059, ack 855960347, win 65535, length 0
18:47:11.268235 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54342: Flags [R], cksum 0xe82a (correct), seq 855960347, win 0, length 0
18:47:11.342841 IP (tos 0x1c, ttl 249, id 3667, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54343 > 10.0.4.8.https: Flags [.], cksum 0x39c7 (correct), seq 1302021899, ack 855966923, win 65535, length 0
18:47:11.342894 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54343: Flags [R], cksum 0xce79 (correct), seq 855966923, win 0, length 0
18:47:11.416171 IP (tos 0x1c, ttl 249, id 17285, offset 0, flags [none], proto TCP (6), length 40)
    203.205.249.190.54344 > 10.0.4.8.https: Flags [.], cksum 0x9d47 (correct), seq 473889590, ack 855973499, win 65535, length 0
18:47:11.416224 IP (tos 0x1c, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.249.190.54344: Flags [R], cksum 0xb4c8 (correct), seq 855973499, win 0, length 0
18:47:12.184512 IP (tos 0x60, ttl 247, id 56471, offset 0, flags [none], proto TCP (6), length 40)
    203.205.159.40.42283 > 10.0.4.8.https: Flags [.], cksum 0x9787 (correct), seq 2042582601, ack 1236197041, win 65535, length 0
18:47:12.184583 IP (tos 0x60, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 40)
    10.0.4.8.https > 203.205.159.40.42283: Flags [R], cksum 0x679c (correct), seq 1236197041, win 0, length 0
18:47:12.400485 IP (tos 0x0, ttl 64, id 37593, offset 0, flags [DF], proto TCP (6), length 108)
^C    10.0.4.8.ssh > 157.245.69.244.56074: Flags [P.], cksum 0xf24f (incorrect -> 0x79f5), seq 397565160:397565228, ack 201251358, win 84, length 68

21 packets captured
1061 packets received by filter
961 packets dropped by kernel
```

##### 用法来源：

>按照tcp中划分的字节位来划分

![](https://github.com/crab21/Images/tree/master/2022/clipboard_20220203_065122.png)

#### 导出wireshark包：

```shell
tcpdump -i eth0 -w test.cap/test.pcap
```

导出后可以直接用wireshark打开，查看具体情况：

![](https://github.com/crab21/Images/tree/master/2022/clipboard_20220203_065536.png)

### Reference

* [→ tcpdump official](https://www.tcpdump.org/index.html#documentation)
* [→ tcpdump learn](https://wizardzines.com/zines/tcpdump/)
* [→ tcpdump cheat sheet](https://blog.wains.be/2007/2007-10-01-tcpdump-advanced-filters/)
* [→ tcpdump advanced filters](https://blog.wains.be/2007/2007-10-01-tcpdump-advanced-filters/)



