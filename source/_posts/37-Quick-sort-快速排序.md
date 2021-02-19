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
for start 系统内存： 71126032    常驻内存： 417792     堆上分配的，gc后会归还：  131224
isp占用的字节大小：「isp结构占用」 24
counter的切片占用的字节大小： 1600000000
for all slice 系统内存： 7651720728    常驻内存： 7218978816     堆上分配的，gc后会归还：  7199851712
耗时：  179  S
for all end 系统内存： 7664696856    常驻内存： 7218987008     堆上分配的，gc后会归还：  7199852808
for gc end 系统内存： 7665745432    常驻内存： 7218987008     堆上分配的，gc后会归还：  7199853032
for gc end 系统内存： 7665745432    常驻内存： 7218987008     堆上分配的，gc后会归还：  7199853056
for gc end 系统内存： 7665745432    常驻内存： 7218987008     堆上分配的，gc后会归还：  7199852936
for gc end 系统内存： 7665745432    常驻内存： 7218987008     堆上分配的，gc后会归还：  7199853160
// 关键点,可以看到内存并没有倍增,说明内存方面得到了重用
gc before new start 4 系统内存： 7665745432    常驻内存： 1600446464     堆上分配的，gc后会归还：  1600134240
slice 0 系统内存： 7665745432    常驻内存： 1600454656     堆上分配的，gc后会归还：  1600134672
slice 1000000 系统内存： 7665745432    常驻内存： 1656348672     堆上分配的，gc后会归还：  1655853648
slice 2000000 系统内存： 7665745432    常驻内存： 1712529408     堆上分配的，gc后会归还：  1711853712
slice 3000000 系统内存： 7665745432    常驻内存： 1768726528     堆上分配的，gc后会归还：  1767853776
slice 4000000 系统内存： 7665745432    常驻内存： 1824915456     堆上分配的，gc后会归还：  1823854080
slice 5000000 系统内存： 7665745432    常驻内存： 1881096192     堆上分配的，gc后会归还：  1879854368
slice 6000000 系统内存： 7665745432    常驻内存： 1937293312     堆上分配的，gc后会归还：  1935854432
slice 7000000 系统内存： 7665745432    常驻内存： 1993474048     堆上分配的，gc后会归还：  1991854496
slice 8000000 系统内存： 7665745432    常驻内存： 2049662976     堆上分配的，gc后会归还：  2047854560
slice 9000000 系统内存： 7665745432    常驻内存： 2105851904     堆上分配的，gc后会归还：  2103854624
slice 10000000 系统内存： 7665745432    常驻内存： 2162049024     堆上分配的，gc后会归还：  2159854928
slice 11000000 系统内存： 7665745432    常驻内存： 2218221568     堆上分配的，gc后会归还：  2215855216
slice 12000000 系统内存： 7665745432    常驻内存： 2274435072     堆上分配的，gc后会归还：  2271855280
slice 13000000 系统内存： 7665745432    常驻内存： 2330607616     堆上分配的，gc后会归还：  2327855344
slice 14000000 系统内存： 7665745432    常驻内存： 2386788352     堆上分配的，gc后会归还：  2383855408
slice 15000000 系统内存： 7665745432    常驻内存： 2442985472     堆上分配的，gc后会归还：  2439855472
slice 16000000 系统内存： 7665745432    常驻内存： 2499166208     堆上分配的，gc后会归还：  2495855536
slice 17000000 系统内存： 7665745432    常驻内存： 2555363328     堆上分配的，gc后会归还：  2551855600
slice 18000000 系统内存： 7665745432    常驻内存： 2611544064     堆上分配的，gc后会归还：  2607855664
slice 19000000 系统内存： 7665745432    常驻内存： 2667732992     堆上分配的，gc后会归还：  2663855728
slice 20000000 系统内存： 7665745432    常驻内存： 2723930112     堆上分配的，gc后会归还：  2719855792
slice 21000000 系统内存： 7665745432    常驻内存： 2780110848     堆上分配的，gc后会归还：  2775855856
slice 22000000 系统内存： 7665745432    常驻内存： 2836299776     堆上分配的，gc后会归还：  2831855920
slice 23000000 系统内存： 7665745432    常驻内存： 2892496896     堆上分配的，gc后会归还：  2887856224
slice 24000000 系统内存： 7665745432    常驻内存： 2948694016     堆上分配的，gc后会归还：  2943856512
slice 25000000 系统内存： 7665942040    常驻内存： 3004858368     堆上分配的，gc后会归还：  2999856576
slice 26000000 系统内存： 7666335256    常驻内存： 3061063680     堆上分配的，gc后会归还：  3055856656
slice 27000000 系统内存： 7666728472    常驻内存： 3117252608     堆上分配的，gc后会归还：  3111856736
slice 28000000 系统内存： 7666794008    常驻内存： 3173466112     堆上分配的，gc后会归还：  3167859792
slice 29000000 系统内存： 7666794008    常驻内存： 3229638656     堆上分配的，gc后会归还：  3223856752
slice 30000000 系统内存： 7666794008    常驻内存： 3285819392     堆上分配的，gc后会归还：  3279857040
slice 31000000 系统内存： 7666794008    常驻内存： 3342016512     堆上分配的，gc后会归还：  3335857120
slice 32000000 系统内存： 7666794008    常驻内存： 3398197248     堆上分配的，gc后会归还：  3391857184
slice 33000000 系统内存： 7666794008    常驻内存： 3454386176     堆上分配的，gc后会归还：  3447857248
slice 34000000 系统内存： 7666794008    常驻内存： 3510583296     堆上分配的，gc后会归还：  3503857552
slice 35000000 系统内存： 7666794008    常驻内存： 3566764032     堆上分配的，gc后会归还：  3559857840
slice 36000000 系统内存： 7666794008    常驻内存： 3622952960     堆上分配的，gc后会归还：  3615857904
slice 37000000 系统内存： 7666794008    常驻内存： 3679141888     堆上分配的，gc后会归还：  3671857968
slice 38000000 系统内存： 7666794008    常驻内存： 3735330816     堆上分配的，gc后会归还：  3727858032
slice 39000000 系统内存： 7666794008    常驻内存： 3791511552     堆上分配的，gc后会归还：  3783858096
slice 40000000 系统内存： 7666794008    常驻内存： 3847708672     堆上分配的，gc后会归还：  3839858160
slice 41000000 系统内存： 7666794008    常驻内存： 3903897600     堆上分配的，gc后会归还：  3895858464
slice 42000000 系统内存： 7666794008    常驻内存： 3960078336     堆上分配的，gc后会归还：  3951858752
slice 43000000 系统内存： 7666794008    常驻内存： 4016275456     堆上分配的，gc后会归还：  4007858832
slice 44000000 系统内存： 7666794008    常驻内存： 4072456192     堆上分配的，gc后会归还：  4063858896
slice 45000000 系统内存： 7666794008    常驻内存： 4128645120     堆上分配的，gc后会归还：  4119858960
slice 46000000 系统内存： 7666794008    常驻内存： 4184834048     堆上分配的，gc后会归还：  4175859024
slice 47000000 系统内存： 7666794008    常驻内存： 4241022976     堆上分配的，gc后会归还：  4231859088
slice 48000000 系统内存： 7666794008    常驻内存： 4297203712     堆上分配的，gc后会归还：  4287859152
slice 49000000 系统内存： 7666794008    常驻内存： 4353400832     堆上分配的，gc后会归还：  4343859216
slice 50000000 系统内存： 7666794008    常驻内存： 4409589760     堆上分配的，gc后会归还：  4399859280
slice 51000000 系统内存： 7666794008    常驻内存： 4465778688     堆上分配的，gc后会归还：  4455859344
slice 52000000 系统内存： 7666794008    常驻内存： 4521967616     堆上分配的，gc后会归还：  4511859408
slice 53000000 系统内存： 7666794008    常驻内存： 4578148352     堆上分配的，gc后会归还：  4567859472
slice 54000000 系统内存： 7666794008    常驻内存： 4634345472     堆上分配的，gc后会归还：  4623859536
slice 55000000 系统内存： 7666794008    常驻内存： 4690526208     堆上分配的，gc后会归还：  4679859600
slice 56000000 系统内存： 7666794008    常驻内存： 4746715136     堆上分配的，gc后会归还：  4735859664
slice 57000000 系统内存： 7666794008    常驻内存： 4802912256     堆上分配的，gc后会归还：  4791859728
slice 58000000 系统内存： 7666794008    常驻内存： 4859092992     堆上分配的，gc后会归还：  4847859792
slice 59000000 系统内存： 7666794008    常驻内存： 4915281920     堆上分配的，gc后会归还：  4903859856
slice 60000000 系统内存： 7666794008    常驻内存： 4971470848     堆上分配的，gc后会归还：  4959859920
slice 61000000 系统内存： 7666794008    常驻内存： 5027659776     堆上分配的，gc后会归还：  5015859984
slice 62000000 系统内存： 7666794008    常驻内存： 5083840512     堆上分配的，gc后会归还：  5071860048
slice 63000000 系统内存： 7666859544    常驻内存： 5140037632     堆上分配的，gc后会归还：  5127860112
slice 64000000 系统内存： 7667252760    常驻内存： 5196234752     堆上分配的，gc后会归还：  5183860176
slice 65000000 系统内存： 7667645976    常驻内存： 5252407296     堆上分配的，gc后会归还：  5239860240
slice 66000000 系统内存： 7668039192    常驻内存： 5308604416     堆上分配的，gc后会归还：  5295860304
slice 67000000 系统内存： 7668497944    常驻内存： 5364785152     堆上分配的，gc后会归还：  5351860368
slice 68000000 系统内存： 7668891160    常驻内存： 5420982272     堆上分配的，gc后会归还：  5407860432
slice 69000000 系统内存： 7669284376    常驻内存： 5477163008     堆上分配的，gc后会归还：  5463860496
slice 70000000 系统内存： 7669677592    常驻内存： 5533351936     堆上分配的，gc后会归还：  5519860560
slice 71000000 系统内存： 7670136344    常驻内存： 5589540864     堆上分配的，gc后会归还：  5575860624
slice 72000000 系统内存： 7670529560    常驻内存： 5645737984     堆上分配的，gc后会归还：  5631860688
slice 73000000 系统内存： 7670922776    常驻内存： 5701918720     堆上分配的，gc后会归还：  5687860752
slice 74000000 系统内存： 7671315992    常驻内存： 5758107648     堆上分配的，gc后会归还：  5743860816
slice 75000000 系统内存： 7671709208    常驻内存： 5814304768     堆上分配的，gc后会归还：  5799860896
slice 76000000 系统内存： 7672167960    常驻内存： 5870493696     堆上分配的，gc后会归还：  5855860960
slice 77000000 系统内存： 7672561176    常驻内存： 5926682624     堆上分配的，gc后会归还：  5911861024
slice 78000000 系统内存： 7672954392    常驻内存： 5982855168     堆上分配的，gc后会归还：  5967861088
slice 79000000 系统内存： 7673347608    常驻内存： 6039060480     堆上分配的，gc后会归还：  6023861168
slice 80000000 系统内存： 7673806360    常驻内存： 6095241216     堆上分配的，gc后会归还：  6079861232
slice 81000000 系统内存： 7674199576    常驻内存： 6151421952     堆上分配的，gc后会归还：  6135861296
slice 82000000 系统内存： 7674592792    常驻内存： 6207610880     堆上分配的，gc后会归还：  6191861360
slice 83000000 系统内存： 7674592792    常驻内存： 6263816192     堆上分配的，gc后会归还：  6247862712
slice 84000000 系统内存： 7674592792    常驻内存： 6319996928     堆上分配的，gc后会归还：  6303863240
slice 85000000 系统内存： 7674592792    常驻内存： 6376210432     堆上分配的，gc后会归还：  6359863768
slice 86000000 系统内存： 7674592792    常驻内存： 6432366592     堆上分配的，gc后会归还：  6415859640
slice 87000000 系统内存： 7674592792    常驻内存： 6488539136     堆上分配的，gc后会归还：  6471859928
slice 88000000 系统内存： 7674592792    常驻内存： 6544736256     堆上分配的，gc后会归还：  6527859992
slice 89000000 系统内存： 7674592792    常驻内存： 6600916992     堆上分配的，gc后会归还：  6583860056
slice 90000000 系统内存： 7674854936    常驻内存： 6657105920     堆上分配的，gc后会归还：  6639860120
slice 91000000 系统内存： 7675248152    常驻内存： 6713303040     堆上分配的，gc后会归还：  6695860184
slice 92000000 系统内存： 7675641368    常驻内存： 6769483776     堆上分配的，gc后会归还：  6751860248
slice 93000000 系统内存： 7676034584    常驻内存： 6825672704     堆上分配的，gc后会归还：  6807860312
slice 94000000 系统内存： 7676493336    常驻内存： 6881861632     堆上分配的，gc后会归还：  6863860376
slice 95000000 系统内存： 7676886552    常驻内存： 6938050560     堆上分配的，gc后会归还：  6919860440
slice 96000000 系统内存： 7677279768    常驻内存： 6994231296     堆上分配的，gc后会归还：  6975860504
slice 97000000 系统内存： 7677672984    常驻内存： 7050428416     堆上分配的，gc后会归还：  7031860568
slice 98000000 系统内存： 7678131736    常驻内存： 7106617344     堆上分配的，gc后会归还：  7087860632
slice 99000000 系统内存： 7678524952    常驻内存： 7162798080     堆上分配的，gc后会归还：  7143860696
isp占用的字节大小：「isp结构占用」 24
for all slice 系统内存： 7678918168    常驻内存： 7218995200     堆上分配的，gc后会归还：  7199860696
```

### End