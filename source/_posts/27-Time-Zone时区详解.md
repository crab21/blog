---
title: 「27」Time Zone时区详解
date: '2020/12/28 09:00:17'
updated: '2020/12/28 09:00:17'
keywords: 'time,zone,Go'
tags:
  - Go
  - time
  - Day
abbrlink: 513dbeba
---


时区，无关语言，在任何一个系统中都会用到：
* time「时间」
* timeID「时间作为唯一标识」
* time to unix
* unix to time string
* .....

>很多场景都会看到这个时间的重要性，这次看到16的特性中有一个修改项，觉得自己对time和zone了解的太少了，以此记录，以便积累。

<!--more-->
### Go version:

```go
7384 ◯  go version
go version go1.14.9 darwin/amd64
```

### 时区 UTC\GMT\MDT\CST

>说到时间，肯定得想到时区问题，咱们国家还好，只有一个Beijing时区，美国本土。。。。四个时区「晕了」

Ps: [点击查看四个时区](https://zh.wikipedia.org/wiki/%E7%BE%8E%E5%9C%8B%E6%99%82%E5%8D%80)




```markdown
GMT (Greenwich Mean Time)的缩写，指的是皇家格林威治天文台的标准时间，称作格林威治时间，因为本初子午线通过此地区，因此也称为世界标准时间。然而地球的自转不是完全规律的，而且正逐渐减慢，因此自1924年开始，格林威治时间(GMT)已经不再被视为标准时间，取而代之的是"世界协调时间" (UTC: Coordinated Universal Time)

UTC 协调世界时（Coordinated Universal Time）是最主要的世界时间标准，其以原子时秒长为基础，在时刻上尽量接近于格林尼治标准时间。UTC 是一个标准，而不是一个时区

CST
 北京时间，China Standard Time，中国标准时间，是中国的标准时间。在时区划分上，属东八区，比协调世界时早8小时，记为UTC+8
```


### Go中的时区问题

有一个函数可以说明这个时区问题：

* time.LoadLocation

>如果你查查源码，就会发现这个函数上面写着时区的问题，也跟不用百度时区，有的自然支持，没有的写了就是乱写了。

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20201228_112003.png)

```go
查询的时区一直就在你goroot路径下的一个压缩文件中。
```

具体的有兴趣可以去看看所有的时区，后续也就有一个全面的了解了：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20201228_112408.png)



### Go 中对于时间的使用

>待更新....