---
title: Go reflect ~ DeepEqual
date: 2020/09/18 12:35:03
updated: 2020/09/18 12:35:52
tags:
    - Go
    - Go reflect
    - Go Package
    - Day
---

今天无意中看到Go101发了一个推特:
``` go
package main

import (
  "fmt"
  "reflect"
)

func p(a, b interface{}) {
  fmt.Print(":", reflect.DeepEqual(a, b))
}

func main() {
  a := [1]func(){func(){}}
  p(a, a)
  p(a[:], a[:])
  b := a
  p(a[:], b[:])
}
```

>输出结果？？ :true:true:false

<!-- more -->

>正确答案 :false:true:false

### 错误来源

```
第一个为啥想着为true,第一眼看过去，比较两个a的函数，那两个函数肯定是相等的，这是第一直觉(狗屁直觉).
第二个两个都为nil了，这个是没有什么问题，两个nil肯定是deep相等的。
第三个虽然是重新初始化了，所以两个肯定不是deep相等的。
```

### 思路比对（错在哪里）

查阅文档之后，发现理解错了：

![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200918-124746.png)



### DeepEqual正确理解
TODO
### END