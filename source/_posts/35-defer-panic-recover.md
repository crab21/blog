---
title: 「35」runtime:recover not correctly recover from panic
date: '2021/2/17 22:10:17'
updated: '2021/2/17 22:10:17'
keywords: 'Go,Runtime'
tags:
  - Go
  - Runtime
  - Day
  - v1.16
mathjax: true
---


接着上面的继续看看v1.16更新,runtime包改动的:

[runtime: recover does not correctly recover from panic](https://github.com/golang/go/issues/43921)

简单的说原因,你认为下面程序的输出结果为what?
<!--more-->

### eg

```go

func main() {
	defer func() {
		expect(1, recover())
	}()
	func() {
		defer func() {
			defer func() {
				expect(4, recover())
			}()
			panic(4)
		}()
		panic(1)

		// Prevent open-coded defers; not executed.
		for {
			defer panic(-1)
			break
		}
	}()
}

func expect(n int, err interface{}) {
	println("expect", n)
	if n != err {
		log.Fatalf("have %v, want %v", err, n)
	}
}
```

#### 理想型:

```
expect 4
expect 1
```
#### 现实:「base v1.14.15」

```go
./prog.go:19:3: unreachable code
Go vet exited.

expect 4
panic: 1

goroutine 1 [running]:
main.main.func2()
	/tmp/sandbox701237149/prog.go:16 +0x65
main.main()
	/tmp/sandbox701237149/prog.go:23 +0x45
```

### why?发生了what?



![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210217_110058.png)

>从上面的修改可以看出,是没有遍历现有的整个defer链表结构导致的.


### defer、panic、recover是如何的结构连接在一起的呢?

[Next-->](https://blog.imrcrab.com/archives/b630d910.html#more)