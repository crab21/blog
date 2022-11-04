---
title: 「50」Map GC问题
date: '2021/05/12 22:24:19'
updated: '2021/05/12 22:56:17'
keywords: 'Go,Map'
top: false
tags:
  - Runtime
  - Day
  - Go
  - Go源码
mathjax: true
abbrlink: af25fb6c
---

问题的起因:[「29」map delete Mem不释放问题](https://blog.imrcrab.com/archives/2de36dd7.html)

那么问题来:
* map内存释放的时机呢？
* 释放如果map过大，释放内存过程中会不会有GC StopWorld问题?

<!--more-->

### 代码部分：

#### map的value不包含pointer：
```go
package main

import (
	"fmt"
	"os"
	"runtime/trace"
	"strconv"
	"time"
)

func AddMap() {
	now:=time.Now().Unix()
	fmt.Println(now)
	for i := 0; i < 10000; i++ {
		mmp := make(map[string]int)
		for ia := 0; ia < 100000; ia++ {
			v := ia
			mmp[strconv.Itoa(ia)] = v
		}
	}
	fmt.Println(time.Now().Unix()-now)
}


func main() {
	trace.Start(os.Stderr)
	defer trace.Stop()
	AddMap()
}
```

#### map的value包含pointer：

```go
package main

import (
	"fmt"
	"os"
	"runtime/trace"
	"strconv"
	"time"
)

func AddMap() {
	now:=time.Now().Unix()
	fmt.Println(now)
	for i := 0; i < 10000; i++ {
		mmp := make(map[string]*int)
		for ia := 0; ia < 100000; ia++ {
			v := ia
			mmp[strconv.Itoa(ia)] = &v
		}
	}
	fmt.Println(time.Now().Unix()-now)
}


func main() {
	trace.Start(os.Stderr)
	defer trace.Stop()
	AddMap()
}
```

### trace结果：

![](https://github.com/crab21/Images/tree/master/clipboard_20210512_113756.png)

### 初步方案：


### Slice替代Map方案：


### Test

### benchmark

### 待更新

