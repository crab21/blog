---
title: 「31」Float类型易踩的坑
date: '2021/02/04 12:00:17'
updated: '2021/02/04 12:57:28'
keywords: 'Go,Float'
tags:
  - Day
  - Go
  - Golang
  - Float
  - IEEE
abbrlink: cb90ed2a
---

### 前序
最近快过年了吧，但是有很多需求要搞，，，，

突然来了个锅，被人投诉说数据统计的有问题，打开电脑一看，float类型的统计，「我慌了，float在统计中一直都很头疼。」

### 触发点

#### 先来看问题吧「写了个例子」：

>下面的结果，a应该是什么值？why？

<!--more-->

>go version go1.14.14 darwin/amd64

```go
func main() {
	var floatNumber float64 = 0

	a := floatNumber / 0
	fmt.Println(a)
}
```

##### 输出结果：

NAN

##### why?「究其根源」

[官方解释](https://golang.google.cn/ref/spec#Representability)

![](https://github.com/crab21/Images/tree/master/clipboard_20210204_030335.png)


>简单的说就是 0/0 为负无穷大，所以为 NAN.

### 如何规避？

* 提前判断分母，为0，不计算「根源解决」
* 利用math.IsNaN(xxx)，选择性跳过。 「治标」

### 拓展：

#### 下面这个输出什么？


```go
func main() {
	var number int
	fmt.Println(number / 0)
}
```

##### 输出结果：

> division by zero

##### why?

* 除数不能为0.

#### 关于float类型

```html
这么简单，估计会被说很菜，，，，

关于float类型的使用和注意事项「和语言无关」，一直都很零散，下来整理下，系统性的学习学习。
```

### END

快过年了，提前预祝大家新年快乐。。。。

🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨🧨