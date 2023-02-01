---
title: 「93」ebpf之XDP
date: 2023/01/31 20:33:40
tags:
    - linux
    - 源码
    - ebpf
    - XDP
    - rust
---


一转眼就2023了,好多文章都在2022没有发出来,成为了Drafts...

最近在搞Linux(瞎搞)的iptables防火墙,有一次被tcp attack了,,当时想着iptables怎么都够了,结果没有想到的是:
CPU近乎满载(后模拟了下,是cpu软中断占用过高).

还有一次被dns udp投毒了恶心到了,,,,

开门见山吧,cpu 软中断问题,是这次致命的,用替代的方案ebpf可以比较好的解决(不能完全避免).

<!--more-->

## iptables分析

### 优势:

* 简洁
* 易用
* 规则可查
* 可随处google/baidu

### 短板

(如果你是iptables的raw/bpf级别的用户,就别往下看了,你已经巅峰[疯]了).

* 更新规则需要重新reload ALL,更新后加载成本太高过高(尤其是过w的规则).
* 匹配效率O(n),线性的.

## ebpf 替代 iptables

### 介绍(不翻译,自己食用--->[ebpf官网](https://ebpf.io/)):


>简单的说,code被JIT编译成字节码,通过挂载的方式,挂到内核指定区域.

>结构图:
![](https://raw.githubusercontent.com/crab21/Images/master/2022/2023-01-31-23-16-16-0e8276bf40a642b19e21f118389b0e3d-202301312316500-6bd787.png)

### 优势:

* 性能好
* 安全+方便
* 可编程/定制化
* 可追踪能力(probe).

### 前期卡点:

* 需要开发者有一定的编程能力
* 对内核需要一定了解(推荐两个著作)
    * [深入理解LINUX内核(第三版)](https://book.douban.com/subject/2287506/)
    * [深入Linux内核架构](https://book.douban.com/subject/4843567/)

## 开发流程

### 开发语言:

>支持ebpf的即可[rust/go/c/c++等], 这里用的是rust实现.

### 推荐库

>随便哪一个皆可.

* [aya](https://github.com/aya-rs/aya)
* [readbpf](https://github.com/foniod/redbpf)


### 开发模版:

按教程版来,一个简单的bpf程序没什么问题,开发过程就不讲了,完全看理解了(网络模型/linux内核/IO模型/三态).

> https://aya-rs.dev/book/

## 性能对比(终态)

这次实现功能比较多:

* 防ddos
* 防syn flood
* 禁用icmp
* white ip
* disable udp/tcp/arp等
* 开放指定端口
* dns防投毒
* mac地址可校验
* 指纹学习匹配,防sliding window attack(需要跑一段时间学习指纹)
* 等等(还在继续添加中)

>这里通过: 1、开启iptables 2、开启ebpf 3、关闭所有防护(没意义,裸奔挨打的状态)
>主要比较前两种.

### 测试方法

* 开启iptables,关闭ebpf,两个服务器(A、B)对C服务器进行hping3模拟.
* 关闭iptables,开启ebpf,两个服务器(A、B)对C服务器进行hping3模拟.

>主要观察cpu各个状态.

### 开启iptables,关闭ebpf

>左上用mpstat显示的cpu和IO等信息.
>右上是iptables仅开放2022(ssh端口),其余所有都drop掉.
>右中是nload显示的实时带宽信息.

* 单个tcp模拟攻击:
![](https://raw.githubusercontent.com/crab21/Images/master/2022/2023-02-01-00-37-16-23f522ecaf76a70ceeba2c81accd0b42-1-1-4f84e3.png)

* 两个tcp模拟攻击
![](https://raw.githubusercontent.com/crab21/Images/master/2022/2023-02-01-00-38-09-98a9cabf5c0b54f9f1a307ffcf96a5cf-1-2-bff12b.png)

>重要的两个信息:

|  attack/percent   |  cpu 软中断  |  idle(闲置)  |  cpu占用 |
|  ----         | ----              |  ----  | ----  |   
| 单个           | 5.9%              |  78% |  19% |
| 两个           | 14%               |  68% |  32% |

### 关闭iptables,开启ebpf


* 单个tcp模拟攻击:
![](https://raw.githubusercontent.com/crab21/Images/master/2022/2023-02-01-00-38-44-bbd5d271793613f99a812c98fe0c4a4f-2-1-e1561d.png)

* 两个tcp模拟攻击
![](https://raw.githubusercontent.com/crab21/Images/master/2022/2023-02-01-00-38-49-9a2d13c91dc81f6d9ef3779c33f76811-2-2-b37c75.png)

|  模拟攻击个数/百分比   |  cpu 软中断  |  idle(闲置)  | cpu占用|
|  ----         | ----               |  ----  | ----  |
| 单个           | 1.08%             |  87% | 15% | 
| 两个           | 1.16%             |  88% | 17%|

### 结论

可以看到随着模拟攻击server越来越多,被攻击的服务器cpu占用越来越高,中断占用也越来越高,,,

最后肯定会崩了.

当然ebpf还有很多用处,可以参考学习[bpf进阶笔记](https://arthurchiao.art/blog/bpf-advanced-notes-2-zh/#2-bpf_map_type_percpu_array)和[ebpf官网例子](https://ebpf.io/applications).


路漫漫其修远兮,,,,,,


## Reference
* [soft interrupt](https://www.kernel.org/doc/htmldocs/kernel-hacking/basics-softirqs.html)
* [ebpf官方](https://ebpf.io/)
* [aya-rust](https://aya-rs.dev/book/aya/aya-tool/#portability-and-different-kernel-versions)
* [HTTP SERVER天梯排行榜](https://www.techempower.com/benchmarks/#section=data-r21)
* [mpstat使用](https://wsgzao.github.io/post/mpstat/)
* [bcc手册](https://github.com/iovisor/bcc/blob/master/docs/reference_guide.md)
* [hping3](https://juejin.cn/post/6993853593476399140)
* [DDos 攻击](https://www.litreily.top/2018/02/22/ddos-attack/)
* [iovisor: XDP](https://www.iovisor.org/technology/xdp)
* [cpu软中断](https://www.cnblogs.com/poloyy/p/13435519.html)
* [RFC: timestamps](https://www.rfc-editor.org/rfc/rfc1323)
* [RFC: time_wait](https://www.rfc-editor.org/rfc/rfc1337.html)
* [tcp/udp攻防](https://cshihong.github.io/2019/05/14/%E7%BD%91%E7%BB%9C%E5%B1%82-TCP-UDP-%E6%94%BB%E5%87%BB%E4%B8%8E%E9%98%B2%E5%BE%A1%E5%8E%9F%E7%90%86/)
* [Cloudflare每秒丢1000w个包](https://blog.cloudflare.com/zh-cn/how-to-drop-10-million-packets-zh-cn/)
* [博客: AF_XDP](https://rexrock.github.io/post/af_xdp1/)
* [博客: BPF进阶笔记](https://arthurchiao.art/blog/bpf-advanced-notes-2-zh/#2-bpf_map_type_percpu_array)
* [Github: bpf学习](https://github.com/DavadDi/bpf_study)
* [Github: lb-demo](https://github.com/shaneutt/ebpf-rust-udp-loadbalancer-demo)
* [Linux源码: bpf](https://github.com/torvalds/linux/blob/master/include/uapi/linux/bpf.h?spm=a2c6h.12873639.article-detail.9.6f07275atwbfFQ&file=bpf.h)
* [Linux源码: xdp_sample](https://github.com/torvalds/linux/blob/22b8077d0fcec86c6ed0e0fce9f7e7e5a4c2d56a/samples/bpf/xdp_sample.bpf.h#L19)
* [Linux源码: uapi/linux/in.h](https://github.com/torvalds/linux/blob/22b8077d0fcec86c6ed0e0fce9f7e7e5a4c2d56a/include/uapi/linux/in.h#L37)