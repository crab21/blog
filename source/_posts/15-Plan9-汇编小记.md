---
title: 「15」Plan9 汇编小记
date: '2020/10/09 13:47:39'
updated: '2022/02/03 00:07:39'
keywords: '汇编,Go,Plan9'
top: false
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

> plan9 指令格式:  指令 源操作数 目标操作数

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

##### 4个伪寄存器:

* FP: 指向栈底位置,一般用来引用函数的输入参数,用于函数参数的访问「frame pointer」
* PC: 程序计数器,用于分支与跳转.「program counter」
* SB: 函数声明和全局变量.「static base pointer」
* SP: 指向当前栈帧的局部变量的开始位置「栈顶位置」,用于局部变量的引用.


更新：

* SB Static base pointer: global symbols. 全局静态基指针，程序地址空间的开始地址。所有用户定义的符号都可以作为偏移量写入伪寄存器 FP（参数和局部变量）和 SB（全局变量）。SB 伪寄存器可以被认为是内存的起始位置 0x0，例如 runtime.newobject(SB) 就是函数 runtime.newobject 位于内存中的地址。
* SP Stack pointer: the highest address within the local stack frame. 栈顶，指向当前栈帧的开始位置。使用形如 symbol+offset(SP) 的方式，引用函数的局部变量，例如 a+8(SP) 指相对于 SP，offset 为 +8 的地址，假如 SP 指向 0x000f0, 那么 a+8(SP) 指向 0x000f8。a 是 symbol，变量名称，用于提升代码可读性。
* FP Frame pointer: arguments and locals. 类似 SP，实际使用非常少。
* PC Program counter: jumps and branches. 存放 CPU 下一个执行指令的位置地址，PC 是一个抽象的概念，在 x86 上，通过 CS 段寄存器和 IP 寄存器共同计算出指令的地址，也就是PC的值。具体使用示例JMP 2(PC) 以当前指令为基础，向后跳转 2 行
* TLS thread local storage 存放了当前正在执行的 g 的结构体。例如 0(TLS) 表示 g.stack.lo，8(TLS) 表示 g.stack.hi
##### MOV

>movb（8位）、movw（16位）、movl（32位）、movq（64位）

```go
MOVSS: 移动单精度浮点数
```


####  LEA和MOV
LEA：操作地址
MOV：操作数据


例子：
LEAQ 8(SP), SI // argv 把 8(SP)地址放入 SI 寄存器中
MOVQ 0(SP), DI // argc 把0(SP)内容放入 DI 寄存器中

#### Reference

* [☞ Plan 9汇编常见](https://blog.thinkhp.site/plan9/#%E6%9F%A5%E7%9C%8B%E6%B1%87%E7%BC%96%E4%BB%A3%E7%A0%81%E7%9A%84%E5%87%A0%E7%A7%8D%E6%96%B9%E6%B3%95)
* [☞ MOVSS](https://c9x.me/x86/html/file_module_x86_id_205.html)
* [☞ Intel汇编指令查询](https://www.felixcloutier.com/x86/index.html)
* [☞ Plan9查询](https://plan9.io/sources/contrib/ericvh/go-plan9/src/pkg/runtime/slice.c)
* [☞ 指令查询](http://68k.hax.com/)
* [☞ plan9 doc](https://9p.io/sys/doc/)

#### 持续更新....