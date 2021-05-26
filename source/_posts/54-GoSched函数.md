---
title: 「54」GoSched函数
date: 2021/05/26 07:00:26
keywords: 'Go,Golang,GoSched'
tags:
  - Go
  - Day
  - Go源码
mathjax: true
---


GoSched 干嘛的？ 看看官方说明：


![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210526_051405.png)

>两点：
* 让出processor
* 可以自动恢复g，执行中的任务

<!--more-->

### [👉🏻 goschedImpl](https://github.com/golang/go/blob/release-branch.go1.14/src/runtime/proc.go#L2746)

```go
func goschedImpl(gp *g) {
    // 获取g状态
	status := readgstatus(gp)
	if status&^_Gscan != _Grunning {
        // 非运行中就throw
		dumpgstatus(gp)
		throw("bad g status")
	}
    //改变G状态
	casgstatus(gp, _Grunning, _Grunnable)
    //重置M和G的状态
	dropg()
	lock(&sched.lock)
    // 将G重新放回队列中
	globrunqput(gp)
	unlock(&sched.lock)

    // 正常调度
	schedule()
}
```

>一个个看看，GMP到底如果配合调度的?

#### readgstatus

```go

// All reads and writes of g's status go through readgstatus, casgstatus
// castogscanstatus, casfrom_Gscanstatus.
//go:nosplit
func readgstatus(gp *g) uint32 {
	return atomic.Load(&gp.atomicstatus)
}
```

>atomicstatus变量的作用：

![](https://crab-1251738482.cos.ap-guangzhou.myqcloud.com/clipboard_20210526_052742.png)

#### casgstatus

#### dropg

#### globrunqput

#### schedule
