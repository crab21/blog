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

## Scenes

### 抓取GET/POST请求

```
Get:
tcpdump -s 0 -A -vv 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420'

Post:
tcpdump -s 0 -A -vv 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x504f5354'

```

### HTTP请求提取

```
1、Host/Get/Post提取：
tcpdump -s 0 -v -n -l | grep -E "POST /|GET /|Host:"

2、Cookie提取
tcpdump -nn -A -s0 -l | grep -E 'Set-Cookie|Host:|Cookie:'

3、User-Agent提取
tcpdump -nn -A -s1500 -l | grep "User-Agent:"
```

### pcap文件分割

```
tcpdump  -w /tmp/capture-%H.pcap -G 3600 -C 100
```


## 抓取k8s/kubernetes pod 数据包

> ./sniff ns-xxx pod-name-xxxxxxxxxxxx -n -s0 

```shell
#!/usr/bin/env bash

set -euxo pipefail

NAMESPACE=${1}; shift
POD=${1}; shift

eval "$(kubectl get pod \
    --namespace "${NAMESPACE}" \
    "${POD}" \
    --output=jsonpath="{.status.containerStatuses[0].containerID}{\"\\000\"}{.status.hostIP}" \
    | xargs -0 bash -c 'printf "${@}"' -- 'CONTAINER_ID=%q\nHOST_IP=%q')"


if [[ ${CONTAINER_ID} == 'docker://'* ]]; then
    CONTAINER_ENGINE=docker
    CONTAINER_ID=${CONTAINER_ID#'docker://'}
elif [[ ${CONTAINER_ID} == 'containerd://'* ]]; then
    CONTAINER_ENGINE=containerd
    CONTAINER_ID=${CONTAINER_ID#'containerd://'}
fi

if [[ -z $(ip address | sed -n "s/inet ${HOST_IP}\//found/p") ]]; then
    SHELL_COMMAND='eval ssh "${HOST_IP}" bash -euxo pipefail -'
else
    SHELL_COMMAND='source /dev/stdin'
fi

${SHELL_COMMAND} <<EOF
PATH=\${PATH}:/usr/local/bin

if [[ ${CONTAINER_ENGINE@Q} == docker ]]; then
    PID=\$(docker inspect --format '{{.State.Pid}}' ${CONTAINER_ID@Q})
elif [[ ${CONTAINER_ENGINE@Q} == containerd ]]; then
    PID=\$(crictl inspect --output go-template --template '{{.info.pid}}' ${CONTAINER_ID@Q})
fi
IF_NO=\$(<"/proc/\${PID}/root/sys/class/net/eth0/iflink")
IF=\$(ip link | sed -n "s/^\${IF_NO}: \([^@]\+\).*$/\1/p")

tcpdump -i "\${IF}" ${@@Q}
EOF
```

```
>>>>>>>>>>>>>>

设置 Bash 的一些选项，包括 -e（如果命令返回非零状态，则立即退出）、-u（如果尝试使用未定义的变量，则退出）、-x（在执行命令之前打印每个命令）和 -o pipefail（如果管道中的任何命令失败，则退出）。

从脚本的第一个参数中获取 Kubernetes 命名空间，并从第二个参数中获取 Pod 的名称。

使用 kubectl 命令获取 Pod 的容器 ID 和主机 IP 地址，并将它们存储在变量 CONTAINER_ID 和 HOST_IP 中。

根据容器 ID 的前缀确定容器运行时（Docker 还是 containerd）。

检查主机 IP 地址是否在当前主机上，并设置一个 SHELL_COMMAND 变量，该变量包含一个 ssh 命令，该命令将连接到主机 IP 地址并在远程主机上运行 Bash shell。

在 HEREDOC 中运行 Bash 命令，该命令使用 tcpdump 命令捕获网络流量。该命令首先获取容器的 PID，然后使用该 PID 获取容器的网络接口名称。最后，它使用 tcpdump 命令捕获指定接口的网络流量。

>>>>>>>>>>>>>>>>
bash -euxo pipefail - 是一个命令，它启动一个新的 Bash shell 并设置一些选项。具体来说，它设置了以下选项：

-e：如果任何命令返回非零状态，则立即退出 shell。
-u：如果尝试使用未定义的变量，则退出 shell。
-x：在执行命令之前打印每个命令。
-o pipefail：如果管道中的任何命令失败，则退出 shell。
这些选项可以帮助在脚本中捕获错误并提高调试能力。- 表示从标准输入读取命令，这意味着在这个例子中，${SHELL_COMMAND} 变量中的命令将作为标准输入传递给新的 Bash shell。

>>>>>>>>>>>>>>>>>
${CONTAINER_ID@Q} 是 Bash shell 中的一种参数扩展语法，用于将变量 CONTAINER_ID 的值转义为适合在双引号中使用的格式。在这种情况下，@Q 表示将变量值转义为单引号括起来的字符串，这样可以确保变量值中的任何特殊字符都不会被解释为 shell 元字符。例如，如果 CONTAINER_ID 的值为 docker://my-container，${CONTAINER_ID@Q} 将返回 'docker://my-container'。这样可以确保在使用变量值时不会出现意外的行为。

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


