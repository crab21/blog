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
abbrlink: aa75061e
---
<!-- toc -->

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
#### 内存占用分析

>改造下执行函数,加上打印内存情况:

```go

func main() {
	Mem(fmt.Sprintf("for start"))
	isp := make([]interface{}, 0, counter)

	for i := 0; i < counter; i++ {
		isp = append(isp, User{
			Name:  strconv.Itoa(i),
			Age:   i,
			Sage:  i,
			Count: rand.Intn(counter),
		})

	}

	fmt.Println(unsafe.Sizeof(isp))
	fmt.Println(unsafe.Sizeof([counter]interface{}{}))
	t := time.Now().Unix()
	Mem(fmt.Sprintf("for all slice"))
	_ = QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// return a.(User).Count >= b.(User).Count //按照count排序 从小到大
		return a.(User).Count <= b.(User).Count //按照count排序  从大到小
	})
	//fmt.Println(num)
	fmt.Println(time.Now().Unix() - t)
	Mem(fmt.Sprintf("for all end"))

	i := 0
	for {
		if i > 10 {
			break
		}
		
		runtime.GC()
		Mem(fmt.Sprintf("for gc end"))
		time.Sleep(1 * time.Second)
		i++
	}
}

func Mem(msg string) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	fmt.Println(msg, "系统内存", m.Sys, " 常驻内存：", m.HeapInuse, "堆上分配的，gc后会归还： ", m.HeapAlloc)
}

```

##### Outputs:

>不同的系统可能会有些许偏差,关键点不在于数值大小,
>关键点在于: 向系统申请的大内存,没有归还给系统,如果说要频繁的申请大内存等操作,
>最好还是搞一个pool池子,不然容易内存暴增暴跌.

* 此处 *counter=10000000*
```go
for start 系统内存： 71388176    常驻内存： 450560     堆上分配的，gc后会归还：  130808
isp占用的字节大小：「isp结构占用」 24
counter的切片占用的字节大小： 160000000
for all slice 系统内存： 784408744    常驻内存： 722001920     堆上分配的，gc后会归还：  719855360
耗时：  10  S
for all end 系统内存： 784408744    常驻内存： 722010112     堆上分配的，gc后会归还：  719855616
for gc end 系统内存： 785326248    常驻内存： 425984     堆上分配的，gc后会归还：  131608
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131416
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131656
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131672
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131456
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131792
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131680
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131696
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131472
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131696
for gc end 系统内存： 785326248    常驻内存： 417792     堆上分配的，gc后会归还：  131696
```

#### 后续优化点:

* 如果数量过大,可以搞个内存池
* 如果数量庞大,建议分治,多次排序「这个数据量一般在G/T级别」


##### 数量大的实验,函数内部复用:

```go

func main() {
	Mem(fmt.Sprintf("for start"))
	isp := make([]interface{}, 0, counter)
	for i := 0; i < counter; i++ {
		ssUser := User{
			Name:  strconv.Itoa(i),
			Age:   i,
			Sage:  i,
			Count: rand.Intn(counter),
		}
		isp = append(isp,ssUser)
	}

	fmt.Println("isp占用的字节大小：「isp结构占用」", unsafe.Sizeof(isp))
	fmt.Println("counter的切片占用的字节大小：", unsafe.Sizeof([counter]interface{}{}))
	t := time.Now().Unix()
	Mem(fmt.Sprintf("for all slice"))
	_ = QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// return a.(User).Count >= b.(User).Count //按照count排序 从小到大
		return a.(User).Count <= b.(User).Count //按照count排序  从大到小
	})
	//fmt.Println(num)
	fmt.Println("耗时： ", time.Now().Unix()-t, " S")
	Mem(fmt.Sprintf("for all end"))

	i := 0
	for {
		if i > 3 {
			break
		}

		runtime.GC()
		Mem(fmt.Sprintf("for gc end"))
		time.Sleep(1 * time.Second)
		i++
	}

	//释放内存,断开引用
	for i := range isp {
		isp[i] = nil
	}
	isp = isp[:0]

	runtime.GC()
	Mem(fmt.Sprintf("gc before new start %d", i))
	for i := 0; i < counter; i++ {
		stmp := User{}
		stmp.Name = strconv.Itoa(i)
		stmp.Age = i
		stmp.Sage = i
		stmp.Count = rand.Intn(counter)
		isp = append(isp, stmp)

		if i%1000000 == 0 {
			Mem(fmt.Sprintf("slice %d", i))
		}
	}
	//fmt.Println(isp)
	// ******关键点在于这个地方的内存会不会是前面同样打印处的倍数???
	fmt.Println("isp占用的字节大小：「isp结构占用」", unsafe.Sizeof(isp))
	//fmt.Println("counter的切片占用的字节大小：", unsafe.Sizeof([counter]interface{}{}))
	ts := time.Now().Unix()
	Mem(fmt.Sprintf("for all slice"))
	_ = QuickSortAll(isp, 0, len(isp)-1, func(a, b interface{}) bool {
		// return a.(User).Count >= b.(User).Count //按照count排序 从小到大
		return a.(User).Count <= b.(User).Count //按照count排序  从大到小
	})
	//fmt.Println(num)
	fmt.Println("耗时： ", time.Now().Unix()-ts, " S")
	Mem(fmt.Sprintf("for all end"))

	ia := 0
	for {
		if ia > 10 {
			break
		}

		runtime.GC()
		Mem(fmt.Sprintf("for gc end"))
		time.Sleep(1 * time.Second)
		ia++
	}
}

func Mem(msg string) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	fmt.Println(msg, "系统内存：", m.Sys, "   常驻内存：", m.HeapInuse, "    堆上分配的，gc后会归还： ", m.HeapAlloc)
}

```

###### Outputs:

>还是同样的,内存的大小不重要,重要的是看分布:

```go
GOROOT=/usr/local/go #gosetup
GOPATH=/Users/k/go #gosetup
/usr/local/go/bin/go build -o /private/var/folders/b0/hs49sy5x5qs1sw7cjxfm8gkm0000gn/T/___go_build_quicksort_go /Users/k/learn/go-memory/src/main/quicksort.go #gosetup
/private/var/folders/b0/hs49sy5x5qs1sw7cjxfm8gkm0000gn/T/___go_build_quicksort_go
for start 系统内存： 71388176    常驻内存： 344064     堆上分配的，gc后会归还：  130600
isp占用的字节大小：「isp结构占用」 24
counter的切片占用的字节大小： 1600000000
for all slice 系统内存： 7651851800    常驻内存： 7218954240     堆上分配的，gc后会归还：  7199851600
耗时：  168  S
for all end 系统内存： 7664827928    常驻内存： 7218962432     堆上分配的，gc后会归还：  7199852696
for gc end 系统内存： 7665745432    常驻内存： 7218962432     堆上分配的，gc后会归还：  7199853016
for gc end 系统内存： 7665745432    常驻内存： 7218962432     堆上分配的，gc后会归还：  7199853040
for gc end 系统内存： 7665745432    常驻内存： 7218962432     堆上分配的，gc后会归还：  7199853048
for gc end 系统内存： 7665745432    常驻内存： 7218962432     堆上分配的，gc后会归还：  7199853048
gc before new start 4 系统内存： 7665745432    常驻内存： 1600421888     堆上分配的，gc后会归还：  1600134128
slice 0 系统内存： 7665745432    常驻内存： 1600430080     堆上分配的，gc后会归还：  1600134560
slice 1000000 系统内存： 7665745432    常驻内存： 1656332288     堆上分配的，gc后会归还：  1655853536
slice 2000000 系统内存： 7665745432    常驻内存： 1712513024     堆上分配的，gc后会归还：  1711853840
slice 3000000 系统内存： 7665745432    常驻内存： 1768710144     堆上分配的，gc后会归还：  1767854128
slice 4000000 系统内存： 7665745432    常驻内存： 1824890880     堆上分配的，gc后会归还：  1823854192
slice 5000000 系统内存： 7665745432    常驻内存： 1881079808     堆上分配的，gc后会归还：  1879854256
slice 6000000 系统内存： 7665745432    常驻内存： 1937276928     堆上分配的，gc后会归还：  1935854336
slice 7000000 系统内存： 7665745432    常驻内存： 1993457664     堆上分配的，gc后会归还：  1991854400
slice 8000000 系统内存： 7665745432    常驻内存： 2049662976     堆上分配的，gc后会归还：  2047854704
slice 9000000 系统内存： 7665745432    常驻内存： 2105835520     堆上分配的，gc后会归还：  2103854992
slice 10000000 系统内存： 7665745432    常驻内存： 2162024448     堆上分配的，gc后会归还：  2159855056
slice 11000000 系统内存： 7665745432    常驻内存： 2218205184     堆上分配的，gc后会归还：  2215855120
slice 12000000 系统内存： 7665745432    常驻内存： 2274410496     堆上分配的，gc后会归还：  2271855200
slice 13000000 系统内存： 7665745432    常驻内存： 2330591232     堆上分配的，gc后会归还：  2327855264
slice 14000000 系统内存： 7665745432    常驻内存： 2386771968     堆上分配的，gc后会归还：  2383855328
slice 15000000 系统内存： 7665745432    常驻内存： 2442969088     堆上分配的，gc后会归还：  2439855392
slice 16000000 系统内存： 7665745432    常驻内存： 2499149824     堆上分配的，gc后会归还：  2495855456
slice 17000000 系统内存： 7665745432    常驻内存： 2555346944     堆上分配的，gc后会归还：  2551855520
slice 18000000 系统内存： 7665745432    常驻内存： 2611544064     堆上分配的，gc后会归还：  2607855824
slice 19000000 系统内存： 7665745432    常驻内存： 2667716608     堆上分配的，gc后会归还：  2663856112
slice 20000000 系统内存： 7665745432    常驻内存： 2723921920     堆上分配的，gc后会归还：  2719856192
slice 21000000 系统内存： 7665745432    常驻内存： 2780102656     堆上分配的，gc后会归还：  2775856256
slice 22000000 系统内存： 7665745432    常驻内存： 2836283392     堆上分配的，gc后会归还：  2831856320
slice 23000000 系统内存： 7665745432    常驻内存： 2892472320     堆上分配的，gc后会归还：  2887856384
slice 24000000 系统内存： 7666073112    常驻内存： 2948661248     堆上分配的，gc后会归还：  2943856448
slice 25000000 系统内存： 7666466328    常驻内存： 3004841984     堆上分配的，gc后会归还：  2999856512
slice 26000000 系统内存： 7666859544    常驻内存： 3061039104     堆上分配的，gc后会归还：  3055856576
slice 27000000 系统内存： 7667252760    常驻内存： 3117228032     堆上分配的，gc后会归还：  3111856640
slice 28000000 系统内存： 7667318296    常驻内存： 3173433344     堆上分配的，gc后会归还：  3167859936
slice 29000000 系统内存： 7667318296    常驻内存： 3229614080     堆上分配的，gc后会归还：  3223857088
slice 30000000 系统内存： 7667318296    常驻内存： 3285794816     堆上分配的，gc后会归还：  3279857376
slice 31000000 系统内存： 7667318296    常驻内存： 3341983744     堆上分配的，gc后会归还：  3335857440
slice 32000000 系统内存： 7667318296    常驻内存： 3398172672     堆上分配的，gc后会归还：  3391857504
slice 33000000 系统内存： 7667318296    常驻内存： 3454361600     堆上分配的，gc后会归还：  3447857568
slice 34000000 系统内存： 7667318296    常驻内存： 3510550528     堆上分配的，gc后会归还：  3503857632
slice 35000000 系统内存： 7667318296    常驻内存： 3566739456     堆上分配的，gc后会归还：  3559857696
slice 36000000 系统内存： 7667318296    常驻内存： 3622936576     堆上分配的，gc后会归还：  3615858000
slice 37000000 系统内存： 7667318296    常驻内存： 3679117312     堆上分配的，gc后会归还：  3671858288
slice 38000000 系统内存： 7667318296    常驻内存： 3735306240     堆上分配的，gc后会归还：  3727858352
slice 39000000 系统内存： 7667318296    常驻内存： 3791495168     堆上分配的，gc后会归还：  3783858656
slice 40000000 系统内存： 7667318296    常驻内存： 3847684096     堆上分配的，gc后会归还：  3839858960
slice 41000000 系统内存： 7667318296    常驻内存： 3903864832     堆上分配的，gc后会归还：  3895859024
slice 42000000 系统内存： 7667318296    常驻内存： 3960061952     堆上分配的，gc后会归还：  3951859328
slice 43000000 系统内存： 7667318296    常驻内存： 4016250880     堆上分配的，gc后会归还：  4007859616
slice 44000000 系统内存： 7667318296    常驻内存： 4072431616     堆上分配的，gc后会归还：  4063859680
slice 45000000 系统内存： 7667318296    常驻内存： 4128620544     堆上分配的，gc后会归还：  4119859744
slice 46000000 系统内存： 7667318296    常驻内存： 4184809472     堆上分配的，gc后会归还：  4175859808
slice 47000000 系统内存： 7667318296    常驻内存： 4240998400     堆上分配的，gc后会归还：  4231859872
slice 48000000 系统内存： 7667318296    常驻内存： 4297179136     堆上分配的，gc后会归还：  4287859936
slice 49000000 系统内存： 7667318296    常驻内存： 4353376256     堆上分配的，gc后会归还：  4343860000
slice 50000000 系统内存： 7667318296    常驻内存： 4409565184     堆上分配的，gc后会归还：  4399860064
slice 51000000 系统内存： 7667318296    常驻内存： 4465770496     堆上分配的，gc后会归还：  4455860368
slice 52000000 系统内存： 7667318296    常驻内存： 4521943040     堆上分配的，gc后会归还：  4511860656
slice 53000000 系统内存： 7667318296    常驻内存： 4578140160     堆上分配的，gc后会归还：  4567860720
slice 54000000 系统内存： 7667318296    常驻内存： 4634320896     堆上分配的，gc后会归还：  4623860784
slice 55000000 系统内存： 7667318296    常驻内存： 4690509824     堆上分配的，gc后会归还：  4679860848
slice 56000000 系统内存： 7667318296    常驻内存： 4746690560     堆上分配的，gc后会归还：  4735860912
slice 57000000 系统内存： 7667318296    常驻内存： 4802887680     堆上分配的，gc后会归还：  4791860976
slice 58000000 系统内存： 7667318296    常驻内存： 4859068416     堆上分配的，gc后会归还：  4847861040
slice 59000000 系统内存： 7667318296    常驻内存： 4915257344     堆上分配的，gc后会归还：  4903861104
slice 60000000 系统内存： 7667318296    常驻内存： 4971446272     堆上分配的，gc后会归还：  4959861168
slice 61000000 系统内存： 7667318296    常驻内存： 5027635200     堆上分配的，gc后会归还：  5015861232
slice 62000000 系统内存： 7667318296    常驻内存： 5083815936     堆上分配的，gc后会归还：  5071861296
slice 63000000 系统内存： 7667449368    常驻内存： 5140013056     堆上分配的，gc后会归还：  5127861360
slice 64000000 系统内存： 7667842584    常驻内存： 5196201984     堆上分配的，gc后会归还：  5183861424
slice 65000000 系统内存： 7668235800    常驻内存： 5252382720     堆上分配的，gc后会归还：  5239861488
slice 66000000 系统内存： 7668629016    常驻内存： 5308579840     堆上分配的，gc后会归还：  5295861552
slice 67000000 系统内存： 7669087768    常驻内存： 5364760576     堆上分配的，gc后会归还：  5351861616
slice 68000000 系统内存： 7669480984    常驻内存： 5420957696     堆上分配的，gc后会归还：  5407861680
slice 69000000 系统内存： 7669874200    常驻内存： 5477138432     堆上分配的，gc后会归还：  5463861744
slice 70000000 系统内存： 7670267416    常驻内存： 5533327360     堆上分配的，gc后会归还：  5519861808
slice 71000000 系统内存： 7670660632    常驻内存： 5589516288     堆上分配的，gc后会归还：  5575861872
slice 72000000 系统内存： 7671119384    常驻内存： 5645705216     堆上分配的，gc后会归还：  5631861936
slice 73000000 系统内存： 7671512600    常驻内存： 5701894144     堆上分配的，gc后会归还：  5687862000
slice 74000000 系统内存： 7671905816    常驻内存： 5758083072     堆上分配的，gc后会归还：  5743862064
slice 75000000 系统内存： 7672299032    常驻内存： 5814280192     堆上分配的，gc后会归还：  5799862144
slice 76000000 系统内存： 7672692248    常驻内存： 5870460928     堆上分配的，gc后会归还：  5855862224
slice 77000000 系统内存： 7673151000    常驻内存： 5926649856     堆上分配的，gc后会归还：  5911862288
slice 78000000 系统内存： 7673544216    常驻内存： 5982846976     堆上分配的，gc后会归还：  5967862352
slice 79000000 系统内存： 7673937432    常驻内存： 6039019520     堆上分配的，gc后会归还：  6023862416
slice 80000000 系统内存： 7674330648    常驻内存： 6095216640     堆上分配的，gc后会归还：  6079862480
slice 81000000 系统内存： 7674789400    常驻内存： 6151397376     堆上分配的，gc后会归还：  6135862544
slice 82000000 系统内存： 7675182616    常驻内存： 6207594496     堆上分配的，gc后会归还：  6191862624
slice 83000000 系统内存： 7675379224    常驻内存： 6263808000     堆上分配的，gc后会归还：  6247863760
slice 84000000 系统内存： 7675379224    常驻内存： 6319964160     堆上分配的，gc后会归还：  6303863824
slice 85000000 系统内存： 7675379224    常驻内存： 6376177664     堆上分配的，gc后会归还：  6359864144
slice 86000000 系统内存： 7675379224    常驻内存： 6432358400     堆上分配的，gc后会归还：  6415864432
slice 87000000 系统内存： 7675379224    常驻内存： 6488530944     堆上分配的，gc后会归还：  6471858816
slice 88000000 系统内存： 7675379224    常驻内存： 6544711680     堆上分配的，gc后会归还：  6527859104
slice 89000000 系统内存： 7675379224    常驻内存： 6600892416     堆上分配的，gc后会归还：  6583859168
slice 90000000 系统内存： 7675575832    常驻内存： 6657081344     堆上分配的，gc后会归还：  6639859232
slice 91000000 系统内存： 7676034584    常驻内存： 6713278464     堆上分配的，gc后会归还：  6695859296
slice 92000000 系统内存： 7676427800    常驻内存： 6769459200     堆上分配的，gc后会归还：  6751859360
slice 93000000 系统内存： 7676821016    常驻内存： 6825648128     堆上分配的，gc后会归还：  6807859424
slice 94000000 系统内存： 7677214232    常驻内存： 6881837056     堆上分配的，gc后会归还：  6863859488
slice 95000000 系统内存： 7677672984    常驻内存： 6938025984     堆上分配的，gc后会归还：  6919859552
slice 96000000 系统内存： 7678066200    常驻内存： 6994206720     堆上分配的，gc后会归还：  6975859616
slice 97000000 系统内存： 7678459416    常驻内存： 7050403840     堆上分配的，gc后会归还：  7031859680
slice 98000000 系统内存： 7678852632    常驻内存： 7106592768     堆上分配的，gc后会归还：  7087859744
slice 99000000 系统内存： 7679245848    常驻内存： 7162773504     堆上分配的，gc后会归还：  7143859808
isp占用的字节大小：「isp结构占用」 24
for all slice 系统内存： 7679704600    常驻内存： 7218970624     堆上分配的，gc后会归还：  7199859808
耗时：  187  S
for all end 系统内存： 7679704600    常驻内存： 7218970624     堆上分配的，gc后会归还：  7199857304
for gc end 系统内存： 7679704600    常驻内存： 434176     堆上分配的，gc后会归还：  131752
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131752
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131984
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131768
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131768
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
for gc end 系统内存： 7679704600    常驻内存： 425984     堆上分配的，gc后会归还：  131992
```

### End