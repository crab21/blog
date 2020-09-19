---
title: Go reflect ~ DeepEqual
date: 2020/09/18 12:35:03
updated: 2020/09/19 20:35:52
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
>源码也很简洁：

```go
func DeepEqual(x, y interface{}) bool {
	if x == nil || y == nil {
		return x == y
	}
	v1 := ValueOf(x)
	v2 := ValueOf(y)
	if v1.Type() != v2.Type() {
		return false
	}
	return deepValueEqual(v1, v2, make(map[visit]bool), 0)
}
```

除了上面看源码，主要还是要看官方的文档和说明性的，这个算是理解源码的前提把：

```go
// DeepEqual reports whether x and y are ``deeply equal,'' defined as follows.
// Two values of identical type are deeply equal if one of the following cases applies.
// Values of distinct types are never deeply equal.
//  条件：数组深度相等，相应的元素都是相等的。
// Array values are deeply equal when their corresponding elements are deeply equal.
//  条件：结构体相对应的字段都是相等的。
// Struct values are deeply equal if their corresponding fields,
// both exported and unexported, are deeply equal.
// 条件：函数都是nil，则为深度相等，其它情况下都是不相等的。
// Func values are deeply equal if both are nil; otherwise they are not deeply equal.
// 
// 条件：两个interface持有深度相同的值。
// Interface values are deeply equal if they hold deeply equal concrete values.
//
    条件：下面条件为true，则深度相等：
    两个全是nil，或者全non-nil，有相同的长度并且有相同的对象/key对应的值是相等的。
// Map values are deeply equal when all of the following are true:
// they are both nil or both non-nil, they have the same length,
// and either they are the same map object or their corresponding keys
// (matched using Go equality) map to deeply equal values.
    条件：用 == 比较或者 point的
// Pointer values are deeply equal if they are equal using Go's == operator
// or if they point to deeply equal values.
    条件：下面条件为true，则深度相等：
    两个全是nil，或者全non-nil，有相同的长度，指向相同的初始化节点（即：相同的数组）或相同的元素深度相等。
    注意：empty和nil slice不是深度相等的。
// Slice values are deeply equal when all of the following are true:
// they are both nil or both non-nil, they have the same length,
// and either they point to the same initial entry of the same underlying array
// (that is, &x[0] == &y[0]) or their corresponding elements (up to length) are deeply equal.
// Note that a non-nil empty slice and a nil slice (for example, []byte{} and []byte(nil))
// are not deeply equal.
//
// Other values - numbers, bools, strings, and channels - are deeply equal
// if they are equal using Go's == operator.
//
// In general DeepEqual is a recursive relaxation of Go's == operator.
// However, this idea is impossible to implement without some inconsistency.
// Specifically, it is possible for a value to be unequal to itself,
// either because it is of func type (uncomparable in general)
// or because it is a floating-point NaN value (not equal to itself in floating-point comparison),
// or because it is an array, struct, or interface containing
// such a value.
// On the other hand, pointer values are always equal to themselves,
// even if they point at or contain such problematic values,
// because they compare equal using Go's == operator, and that
// is a sufficient condition to be deeply equal, regardless of content.
// DeepEqual has been defined so that the same short-cut applies
// to slices and maps: if x and y are the same slice or the same map,
// they are deeply equal regardless of content.
//
// As DeepEqual traverses the data values it may find a cycle. The
// second and subsequent times that DeepEqual compares two pointer
// values that have been compared before, it treats the values as
// equal rather than examining the values to which they point.
// This ensures that DeepEqual terminates.
```

再看看详细的deepValueEqual,大致的过程：

### END