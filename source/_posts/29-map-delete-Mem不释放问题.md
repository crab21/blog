---
title: 「29」map delete Mem不释放问题
date: '2021/1/6 12:00:17'
updated: '2021/1/6 12:00:17'
keywords: 'Go,Map,Hash,delete'
tags:
  - Day
  - Go
  - Map
  - Hash
abbrlink: 2de36dd7
---

### Go version:

```go
7384 ◯  go version
go version go1.14.9 darwin/amd64
```

###  最近有这么个坑:

>碰到内存泄露问题，大致是这样的：

* 1、定义一个全局map
* 2、给里面放值
* 3、用完之后删除Key/value

### 问题：map删除完key后，Mem有没有被释放？

<!--more-->


### 观察内存变化：

#### 情景1: 只删除Map的k/v
```go
var intMap map[int]int
var cnt = 8192

func main() {
	printMemStats()
	initMap()
	runtime.GC()
	printMemStats()
	log.Println(len(intMap))
	for i := 0; i < cnt; i++ {
		delete(intMap, i)
	}
	log.Println(len(intMap))
	runtime.GC()
	printMemStats()
	//intMap = nil
	runtime.GC()
	printMemStats()
}
func initMap() {
	intMap = make(map[int]int, cnt)
	for i := 0; i < cnt; i++ {
		intMap[i] = i
	}
}
func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Printf("Alloc = %v TotalAlloc = %v Sys = %v NumGC = %v\n", m.Alloc/1024, m.TotalAlloc/1024, m.Sys/1024, m.NumGC)
}

```

##### 输出：
```go
2021/01/06 16:12:26 Alloc = 162 TotalAlloc = 162 Sys = 69714 NumGC = 0
2021/01/06 16:12:26 Alloc = 471 TotalAlloc = 487 Sys = 70290 NumGC = 1
2021/01/06 16:12:26 8192
2021/01/06 16:12:26 0
2021/01/06 16:12:26 Alloc = 473 TotalAlloc = 490 Sys = 70610 NumGC = 2
2021/01/06 16:12:26 Alloc = 475 TotalAlloc = 494 Sys = 70610 NumGC = 3
```



#### 情景2: 删除map的k/v,并置map为nil

```go
var intMap map[int]int
var cnt = 8192

func main() {
	printMemStats()
	initMap()
	runtime.GC()
	printMemStats()
	log.Println(len(intMap))
	for i := 0; i < cnt; i++ {
		delete(intMap, i)
	}
	log.Println(len(intMap))
	runtime.GC()
	printMemStats()
	intMap = nil
	runtime.GC()
	printMemStats()
}
func initMap() {
	intMap = make(map[int]int, cnt)
	for i := 0; i < cnt; i++ {
		intMap[i] = i
	}
}
func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Printf("Alloc = %v TotalAlloc = %v Sys = %v NumGC = %v\n", m.Alloc/1024, m.TotalAlloc/1024, m.Sys/1024, m.NumGC)
}

```

##### 输出：
```go
2021/01/06 16:15:40 Alloc = 161 TotalAlloc = 161 Sys = 69714 NumGC = 0
2021/01/06 16:15:40 Alloc = 469 TotalAlloc = 484 Sys = 71696 NumGC = 1
2021/01/06 16:15:40 8192
2021/01/06 16:15:40 0
2021/01/06 16:15:40 Alloc = 471 TotalAlloc = 488 Sys = 71760 NumGC = 2
2021/01/06 16:15:40 Alloc = 160 TotalAlloc = 492 Sys = 71760 NumGC = 3
```


#### 情景3: map放在函数中，并删除map的k/v,不置nil

```go

var intMap map[int]int
var cnt = 8192

func main() {
	printMemStats()
	other()
	runtime.GC()
	printMemStats()
}

func other(){
	initMap()
	runtime.GC()
	printMemStats()
	log.Println(len(intMap))
	for i := 0; i < cnt; i++ {
		delete(intMap, i)
	}
	log.Println(len(intMap))
	runtime.GC()
	printMemStats()
	//intMap = nil
}
func initMap() {
	intMap = make(map[int]int, cnt)
	for i := 0; i < cnt; i++ {
		intMap[i] = i
	}
}
func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Printf("Alloc = %v TotalAlloc = %v Sys = %v NumGC = %v\n", m.Alloc/1024, m.TotalAlloc/1024, m.Sys/1024, m.NumGC)
}

```

##### 输出：

```go
2021/01/06 16:18:35 Alloc = 161 TotalAlloc = 161 Sys = 69458 NumGC = 0
2021/01/06 16:18:35 Alloc = 469 TotalAlloc = 484 Sys = 71440 NumGC = 1
2021/01/06 16:18:35 8192
2021/01/06 16:18:35 0
2021/01/06 16:18:35 Alloc = 471 TotalAlloc = 488 Sys = 71504 NumGC = 2
2021/01/06 16:18:35 Alloc = 473 TotalAlloc = 492 Sys = 71504 NumGC = 3
```

#### 情景4: map放在函数中，并删除map的k/v,map置为nil

```go

var intMap map[int]int
var cnt = 8192

func main() {
	printMemStats()
	other()
	runtime.GC()
	printMemStats()
}

func other(){
	initMap()
	runtime.GC()
	printMemStats()
	log.Println(len(intMap))
	for i := 0; i < cnt; i++ {
		delete(intMap, i)
	}
	log.Println(len(intMap))
	runtime.GC()
	printMemStats()
	intMap = nil
}
func initMap() {
	intMap = make(map[int]int, cnt)
	for i := 0; i < cnt; i++ {
		intMap[i] = i
	}
}
func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Printf("Alloc = %v TotalAlloc = %v Sys = %v NumGC = %v\n", m.Alloc/1024, m.TotalAlloc/1024, m.Sys/1024, m.NumGC)
}
```

##### 输出：
```go
2021/01/06 16:20:02 Alloc = 161 TotalAlloc = 161 Sys = 69714 NumGC = 0
2021/01/06 16:20:02 Alloc = 469 TotalAlloc = 484 Sys = 70034 NumGC = 1
2021/01/06 16:20:02 8192
2021/01/06 16:20:02 0
2021/01/06 16:20:02 Alloc = 471 TotalAlloc = 488 Sys = 70098 NumGC = 2
2021/01/06 16:20:02 Alloc = 160 TotalAlloc = 492 Sys = 70098 NumGC = 3
```

#### 情景5: map定义放在局部变量中：

```go
var cnt = 8192

func main() {
	printMemStats()
	other()
	runtime.GC()
	printMemStats()
}

func other() {
	var intMap map[int]int
	intMap = initMap(intMap)
	runtime.GC()
	printMemStats()
	log.Println(len(intMap))
	for i := 0; i < cnt; i++ {
		delete(intMap, i)
	}
	log.Println(len(intMap))
	runtime.GC()
	printMemStats()
	//intMap = nil
}
func initMap(intMap map[int]int) map[int]int {
	intMap = make(map[int]int, cnt)
	for i := 0; i < cnt; i++ {
		intMap[i] = i
	}
	return intMap
}
func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Printf("Alloc = %v TotalAlloc = %v Sys = %v NumGC = %v\n", m.Alloc/1024, m.TotalAlloc/1024, m.Sys/1024, m.NumGC)
}
```

##### 输出：

```go
2021/01/06 16:29:54 Alloc = 161 TotalAlloc = 161 Sys = 69458 NumGC = 0
2021/01/06 16:29:54 Alloc = 469 TotalAlloc = 484 Sys = 71440 NumGC = 1
2021/01/06 16:29:54 8192
2021/01/06 16:29:54 0
2021/01/06 16:29:54 Alloc = 158 TotalAlloc = 488 Sys = 71504 NumGC = 2
2021/01/06 16:29:54 Alloc = 160 TotalAlloc = 491 Sys = 71504 NumGC = 3
```

##### 汇编输出：

比较有意思的一行：

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210106_051000.png)

```
XORL 异或运算符 

XORL AX,AX --->将AX置0值
```


#### delete函数：

```go
0x0125 00293 (../1126/main.go:26)	CALL	runtime.mapdelete_fast64(SB)
```

##### mapdelete_fast64函数作用：


[点击Github查看](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/map_fast64.go#L272)

![](https://raw.githubusercontent.com/crab21/Images/master/clipboard_20210106_052140.png)


>有意思的是：map的设计就是这样，删除key，只是把这个槽位置empty，并没有释放内存.

### Others:

#### 其它场景：

>场景有很多，这里只是逻列最简单的，至于用指针之类的，有兴趣了再研究研究，方法都是一样的。

#### 汇编代码生成
* 详细见此文：[「15」Plan9 汇编小记](https://blog.imrcrab.com/archives/2ce846ed.html)