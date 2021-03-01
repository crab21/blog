---
title: 「40」Quick Sort Plus之通用模版
date: '2021/03/01 21:10:17'
updated: '2021/03/01 21:10:17'
keywords: 'Go,sort,quick sort'
tags:
  - Go
  - Sort
  - Day
mathjax: true:
---

### 前序:
[「37」Quick Sort快速排序](https://blog.imrcrab.com/archives/aa75061e.html)分析过快速排序,之前有个问题一直是个痛点:
自定义结构体排序过程中,还是要写不少逻辑判断代码,可以再抽象点么?
用最少的代码,完全实现结构体按照不通的字段进行排序.

<!--more-->

[「37节」自定义排序做法:](https://blog.imrcrab.com/archives/aa75061e.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8E%92%E5%BA%8F%E8%A7%84%E5%88%99%E5%81%9A%E6%B3%95%EF%BC%9A)


### 方案设想:

* 1、利用reflect反射,传入多个字段的名称,
* 2、每个字段指定升序或者降序.
* 3、提供升序或者降序.

#### coding:

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

const counter = 10

// 自定义的部分
const (
	flagResult = false
	SortLow    = - 1
	SortEquals = 0
	SortHigh   = 1
)

// 自定义排序规则,来源可以自定义
// K: 排序字段 "Count"  v: true--> 小-->大    false--> 大-->小
// 支持多个key，当key对应的值相等时候，则排序取决于第二个key自定义的排序规则。
// eg: 按照Name升序
var SortingRules = map[string]bool{"Name": true}

// eg: 按照Name升序,name相同时候,按照age降序.
// var SortingRules = map[string]bool{"Name": true,"Age" : false}


func main() {

	isp := make([]interface{}, 0, counter)

	for i := 0; i < counter; i++ {
		isp = append(isp, User{
			Name:  strconv.Itoa(rand.Intn(counter)),
			Age:   i,
			Count: rand.Intn(counter),
		})
		//isp = append(isp, strconv.Itoa(rand.Intn(counter))+"===")

	}
	fmt.Println(isp)
	t := time.Now().Unix()
	// 主要的排序过程
	num := QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// 类型不匹配则返回true，无法保证顺序
		if reflect.ValueOf(a).Kind() != reflect.ValueOf(b).Kind() {
			return !flagResult
		}
		return sortByRules(a, b, SortingRules)

	})
	fmt.Println(num)
	fmt.Println("耗时：",time.Now().Unix() - t)
}

// sortByRules 自定义排序规则
func sortByRules(a, b interface{}, sortingRules map[string]bool) bool {
	ofType := reflect.ValueOf(a).Kind()
	va := reflect.ValueOf(a)
	vb := reflect.ValueOf(b)

	for v, k := range sortingRules {

		if ofType != reflect.Struct {
			//非结构体，常用的类型
			result := typeChooseOfReflect(va, vb, k)
			if result == SortEquals {
				continue
			} else if result < SortEquals {
				return flagResult
			} else {
				return !flagResult
			}
		} else if ofType == reflect.Struct {
			// 结构体比较
			of := va.FieldByName(v)
			ofb := vb.FieldByName(v)

			if !of.IsValid() || !ofb.IsValid() {
				return flagResult
			}

			result := typeChooseOfReflect(of, ofb, k)
			if result == SortEquals {
				continue
			} else if result < SortEquals {
				return flagResult
			} else {
				return !flagResult
			}
		}
	}
	return !flagResult
}

// typeChooseOfReflect 类型选择映射
func typeChooseOfReflect(valueOfA, valueOfB reflect.Value, flag bool) int8 {
	if flag {
		valueOfA, valueOfB = valueOfB, valueOfA
	}
	kind := valueOfA.Type().Kind()
	switch kind {
	case reflect.Bool:
		return SortHigh

	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if valueOfA.Int() < valueOfB.Int() {
			return SortHigh
		}
		if valueOfA.Int() == valueOfB.Int() {
			return SortEquals
		}

	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if valueOfA.Uint() < valueOfB.Uint() {
			return SortHigh
		}
		if valueOfA.Uint() == valueOfB.Uint() {
			return SortEquals
		}

	case reflect.Float32, reflect.Float64:
		if valueOfA.Float() < valueOfB.Float() {
			return SortHigh
		}
		if valueOfA.Float() == valueOfB.Float() {
			return SortEquals
		}

	case reflect.String:
		return -int8(strings.Compare(valueOfA.String(), valueOfB.String()))
	}
	return SortLow
}

```


##### outputs:

```go
[{1 0 7} {7 1 9} {1 2 8} {5 3 0} {6 4 0} {4 5 1} {2 6 9} {8 7 4} {1 8 5} {7 9 6}]
[{1 0 7} {1 8 5} {1 2 8} {2 6 9} {4 5 1} {5 3 0} {6 4 0} {7 1 9} {7 9 6} {8 7 4}]
耗时： 0

```
#### 修改自定义规则:

##### 多个规则排序
```go
// eg: 按照Name升序,name相同时候,按照age降序.
// var SortingRules = map[string]bool{"Name": true,"Age" : false}

```

##### outputs:

```go
[{1 0 7} {7 1 9} {1 2 8} {5 3 0} {6 4 0} {4 5 1} {2 6 9} {8 7 4} {1 8 5} {7 9 6}]
[{1 8 5} {1 2 8} {1 0 7} {2 6 9} {4 5 1} {5 3 0} {6 4 0} {7 9 6} {7 1 9} {8 7 4}]
耗时： 0
```
##### 常见类型排序:
修改重要部分:
```go
// K: 排序字段 "Count"  v: true--> 小-->大    false--> 大-->小
// 支持多个key，当key对应的值相等时候，则排序取决于第二个key自定义的排序规则.(多个kv以第一个为准「仅在基本类型下有效」)
// eg: string类型排序,则key值为任意,value值决定排序规则,
var SortingRules = map[string]bool{"": true}

func main() {

	isp := make([]interface{}, 0, counter)

	for i := 0; i < counter; i++ {
		/*isp = append(isp, User{
			Name:  strconv.Itoa(rand.Intn(counter)),
			Age:   i,
			Count: rand.Intn(counter),
		})*/
        //***** string类型排序 *****
		isp = append(isp, strconv.Itoa(rand.Intn(counter))+"===")
        //***** int类型排序 *****
		// isp = append(isp, rand.Intn(counter))

	}
	fmt.Println(isp)
	t := time.Now().Unix()
	// 主要的排序过程
	num := QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// 类型不匹配则返回true，无法保证顺序
		if reflect.ValueOf(a).Kind() != reflect.ValueOf(b).Kind() {
			return !flagResult
		}
		return sortByRules(a, b, SortingRules)

	})
	fmt.Println(num)
	fmt.Println("耗时：",time.Now().Unix() - t)
}
```

##### outputs:

* string类型:

```go
[1=== 7=== 7=== 9=== 1=== 8=== 5=== 0=== 6=== 0===]
[0=== 0=== 1=== 1=== 5=== 6=== 7=== 7=== 8=== 9===]
耗时： 0
```

* int类型

```go
[1 7 7 9 1 8 5 0 6 0]
[0 0 1 1 5 6 7 7 8 9]
耗时： 0
```

### 总结:

到这里也就差不多该结束了,基本和常用的就这么多了,其它需要扩充的后续再补充.
* 优化点:
    * 字段名称不区分大小写

### End