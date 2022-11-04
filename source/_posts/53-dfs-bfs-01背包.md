---
title: 「53」dfs bfs 01背包
date: '2021/05/20 20:05:13'
updated: '2021/05/20 21:20:17'
keywords: 'BFS,DFS,01背包'
tags:
  - 算法
  - Day
mathjax: true
abbrlink: 517092f1
---

算法篇👉🏻[一]

<!--more-->

### DFS问题


#### 无重复数组总和问题[👉🏿#39](https://leetcode-cn.com/problems/combination-sum/)

##### [👉🏿问题描述：#39](https://leetcode-cn.com/problems/combination-sum/)

```go
给定一个无重复元素的数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的数字可以无限制重复被选取。

说明：

所有数字（包括 target）都是正整数。
解集不能包含重复的组合。 
示例 1：

输入：candidates = [2,3,6,7], target = 7,
所求解集为：
[
  [7],
  [2,2,3]
]
示例 2：

输入：candidates = [2,3,5], target = 8,
所求解集为：
[
  [2,2,2,2],
  [2,3,3],
  [3,5]
]
```


##### 解决思路


![](https://github.com/crab21/Images/tree/master/clipboard_20210520_113008.png)

![](https://github.com/crab21/Images/tree/master/clipboard_20210520_113224.png)

![](https://github.com/crab21/Images/tree/master/clipboard_20210520_113257.png)

![](https://github.com/crab21/Images/tree/master/clipboard_20210520_113320.png)

##### coding：

```go
package main

import "fmt"

func main() {
	n := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	combineDFS(n, 16)
}

var res [][]int = make([][]int, 0)

func combineDFS(num []int, target int) (result [][]int) {
	if len(num) == 0 {
		return
	}

	dfs(target, 0, []int{}, num)
	fmt.Println(res)
	return res
}

func dfs(target int, index int, pre []int, num []int) {
	if target == 0 {
		pp := make([]int, len(pre))
		copy(pp, pre)
		res = append(res, pp)
		return
	}

	for i := index; i < len(num); i++ {
		if num[i] > target {
			break
		}

		pre = append(pre, num[i])
    // i+1 则跳过重复的元素使用的情况
		//dfs(target-num[i], i+1, pre, num)
		dfs(target-num[i], i, pre, num)
		pre = pre[:len(pre)-1]
	}
}
```


### 待续....