---
title: Go reflect ~ DeepEqual
date: 2020/09/18 12:35:03
updated: 2020/09/20 16:16:52
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
  //同nil
	if x == nil || y == nil {
		return x == y
	}
	v1 := ValueOf(x)
  v2 := ValueOf(y)
  //属于同一类型
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
![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200920-103516@2x.png)


>大致分为三个过程：
```
1、判断类型和值
2、hard回调
3、按照kind分类处理
```

#### 数组：
比较每一个元素
```go
    for i := 0; i < v1.Len(); i++ {
			if !deepValueEqual(v1.Index(i), v2.Index(i), visited, depth+1) {
				return false
			}
		}
		return true
```
#### Slice
* 比较为nil
* 比较长度
* 比较地址
* 比较每一个元素
```go
    if v1.IsNil() != v2.IsNil() {
			return false
		}
		if v1.Len() != v2.Len() {
			return false
		}
		if v1.Pointer() == v2.Pointer() {
			return true
		}
		for i := 0; i < v1.Len(); i++ {
			if !deepValueEqual(v1.Index(i), v2.Index(i), visited, depth+1) {
				return false
			}
		}
		return true
```

#### Interface
* 比较nil
* 递归比较
```go
    if v1.IsNil() || v2.IsNil() {
			return v1.IsNil() == v2.IsNil()
		}
		return deepValueEqual(v1.Elem(), v2.Elem(), visited, depth+1)
```
#### Ptr
* 地址
* 递归比较
```go
    if v1.Pointer() == v2.Pointer() {
			return true
		}
		return deepValueEqual(v1.Elem(), v2.Elem(), visited, depth+1)
```

#### struct
* 比较每一个元素
```go
    for i, n := 0, v1.NumField(); i < n; i++ {
			if !deepValueEqual(v1.Field(i), v2.Field(i), visited, depth+1) {
				return false
			}
		}
		return true
```

#### Map
* 比较Nil
* 比较长度
* 地址比较
* 每一个key对应的value

```go
    if v1.IsNil() != v2.IsNil() {
			return false
		}
		if v1.Len() != v2.Len() {
			return false
		}
		if v1.Pointer() == v2.Pointer() {
			return true
		}
		for _, k := range v1.MapKeys() {
			val1 := v1.MapIndex(k)
			val2 := v2.MapIndex(k)
			if !val1.IsValid() || !val2.IsValid() || !deepValueEqual(val1, val2, visited, depth+1) {
				return false
			}
		}
		return true
```

#### Func
* 非nil，为不等。
```go
    if v1.IsNil() && v2.IsNil() {
			return true
		}
		// Can't do better than this:
		return false
```

### painc注意点：
 deepValueEqual函数：
```go
  .....
  ....
  ...
  ..
  .
  递归次数超过10次则会painc....
  // if depth > 10 { panic("deepValueEqual") }	// for debugging

	// We want to avoid putting more in the visited map than we need to.
	// For any possible reference cycle that might be encountered,
	// hard(v1, v2) needs to return true for at least one of the types in the cycle,
	// and it's safe and valid to get Value's internal pointer.
	hard := func(v1, v2 Value) bool {
		switch v1.Kind() {
		case Map, Slice, Ptr, Interface:
			// Nil pointers cannot be cyclic. Avoid putting them in the visited map.
			return !v1.IsNil() && !v2.IsNil()
		}
		return false
  }
  .
  ..
  ...
  ....
  .....
  ......
```
### END