---
title: 「37」Quick Sort快速排序
date: '2021/2/19 12:10:17'
updated: '2021/2/19 12:10:17'
keywords: 'Go,Quick Sort,Sort'
tags:
  - Go
  - Sort
  - Day
mathjax: true
---


### 前序
最近在想一个问题：Go里面的sort包到底是怎么实现的，，，，
想着想着就想到了快速排序，就试着手撕了一个，

有个关键问题，所有的都是针对int或者其它特定的类型，

*那如何让排序算法通用性呢，*

<!--more-->

### 快速排序

不废话，先搞一个排序的代码来，再分析「遵循先用后分析的原则」

>默认从大-->小，注释的那行放开就是 从小-->大

```go
func QuickSort(a []int, left, right int) []int {
	if left < right {
		mid := partition(a, left, right)
		QuickSort(a, left, mid-1)
		QuickSort(a, mid+1, right)
	}
	return a

}

func partition(a []int, left int, right int) int {
	pivot := a[left] //基点
	for ; left < right; {
		//for ; left < right && a[right] >= pivot; { 
		for ; left < right && a[right] <= pivot; {
			right--
		}
		a[left] = a[right]
		//for ; left < right && a[left] <= pivot; {
		for ; left < right && a[left] >= pivot; {
			left++
		}
		a[right] = a[left]
	}
	a[left] = pivot
	return left
}

```

#### 调用分析

```go
func main() {
	s := []int{1, 2, 3, 4, 5, 6, 7}
	num :=QuickSort(s, 0, len(s)-1)
	fmt.Println(num)
}
```

##### Outputs:

>[7 6 5 4 3 2 1]

#### 不足点：

* 只能用在int型或者指定的类型，「不爽😕」
* 基点在最左边「后面分析为何不好」

##### 改进点：

>既然是需要改进，那就朝着上面的不足点来搞。
* 通用类型的设计，「用go的断言：interface来做」
* 基点的选取尽量均衡「可选项」

#### Just do it


##### 自定义排序规则做法：

```go

func QuickSortAll(a []interface{}, left, right int, By func(a, b interface{}) bool) []interface{} {
	if left < right {
		mid := partitionAll(a, left, right, By)
		QuickSortAll(a, left, mid-1, By)
		QuickSortAll(a, mid+1, right, By)
	}
	return a

}

func partitionAll(a []interface{}, left int, right int, By func(a, b interface{}) bool) int {
	pivot := a[left]
	for ; left < right; {
		//for ; left < right && a[right] >= pivot; {
		for ; left < right && By(a[right], pivot); {
			right--
		}
		a[left] = a[right]
		//for ; left < right && a[left] <= pivot; {
		for ; left < right && By(pivot, a[left]); {
			left++

		}
		a[right] = a[left]
	}
	a[left] = pivot
	return left
}

type User struct {
	Name  string
	Age   int
	Count int
}

const counter = 100000000

func main() {

	isp := make([]interface{}, 0, counter)

	for i := 0; i < counter; i++ {
		isp = append(isp, User{
			Name:  strconv.Itoa(i),
			Age:   i,
			Count: rand.Intn(counter),
		})

	}
	t := time.Now().Unix()

	_ = QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// return a.(User).Count >= b.(User).Count //按照count排序 从小到大
        return a.(User).Count <= b.(User).Count //按照count排序  从大到小
	})
	//fmt.Println(num)
	fmt.Println(time.Now().Unix() - t)
}
```

###### Outputs：

>91

##### 跑个benchmark看看

> 上面的变量counter=10000000
```go
goos: darwin
goarch: amd64
cpu: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
BenchmarkQuickSortAll
BenchmarkQuickSortAll-12    	       1	6287198265 ns/op
PASS
```

### 待更...