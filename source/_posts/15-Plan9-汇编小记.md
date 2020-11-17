---
title: 「15」Plan9 汇编小记
date: '2020/10/09 13:47:39'
updated: '2020/10/09 13:47:39'
keywords: '汇编,Go,Plan9'
top: true
sticky: 3
tags:
  - Plan9
  - Go
  - Day
abbrlink: 2ce846ed
---
#### 前序
>平常coding时，偶尔会查看计算机的具体执行过程，那最基本的就是汇编了，了解汇编是调试过程中必不可少的，尤其是一些细节的处理方面.Go的汇编是Plan 9(贝尔实验室的产物)，和汇编很类似。
#### 如何得到汇编结果？

* 官网文档
* Google

##### 3种方式：
>第一种
<!-- more -->
```go
go tool compile -N -l -S ***.go
```
>第二种

```go
1、先编译：
    go tool compile -N -l ***.go
2、再反编译：
    go tool objdump ***.o
```

>第三种

```go
go build -gcflags -S ***.go
```


#### 常用寄存器
##### AX BX CX DX BP SI SP IP

|寄存器|16位|32位|64位|
|:----|:----|:----|:----|
|累加寄存器|AX|EAX|RAX|
|基址寄存器|BX|EBX|RBX|
|计数寄存器|CX|ECX|RCX|
|数据寄存器|DX|EDX|RDX|
|堆栈基指针|BP|EBP|RBP|
|变址寄存器|SI|ESI|RSI|
|堆栈顶指针|SP|ESP|RSP|
|指令寄存器|IP|EIP|RIP|

##### MOV

>movb（8位）、movw（16位）、movl（32位）、movq（64位）

```go
MOVSS: 移动单精度浮点数
```

#### 查询地址

[MOVSS](https://c9x.me/x86/html/file_module_x86_id_205.html)
[Intel汇编指令查询](https://www.felixcloutier.com/x86/index.html)
[Plan9查询](https://plan9.io/sources/contrib/ericvh/go-plan9/src/pkg/runtime/slice.c)

#### 持续更新....