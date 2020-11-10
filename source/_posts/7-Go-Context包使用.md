---
title: 「7」Go Context包使用
date: 2020/09/07 22:21:52
updated: 2020/09/07 22:21:52
keywords: golang,go context包,golang context WithCancel,golang context WithDeadline,go WithTimeout.
tags:
    - Go
    - Go Package
---

### 版本
```
◯  go version
go version go1.14.9 darwin/amd64
```

### 用Go的都离不开Context，引用官网的一句话来描述Context包：

>Package context defines the Context type, which carries deadlines, cancellation signals, and other request-scoped values across API boundaries and between processes.

主要掌握四个方法的使用
```
WithCancel
WithDeadline
WithTimeout
WithValue
```
### 前期ready

要用下面的方法，先了解下部分结构和逻辑：

>既然context全部都是和取消相关的，最起码Go在设计时会有这么一个结构。
<!-- more -->

>具体的取消设计结构
```
type cancelCtx struct {
	Context

	mu       sync.Mutex            // protects following fields  加锁用
	done     chan struct{}         // created lazily, closed by first cancel call   控制channel
	children map[canceler]struct{} // set to nil by the first cancel call  cancel函数调用后，释放子类
	err      error                 // set to non-nil by the first cancel call
}
```

>timer控制死锁时间结构：
```
// A timerCtx carries a timer and a deadline. It embeds a cancelCtx to
// implement Done and Err. It implements cancel by stopping its timer then
// delegating to cancelCtx.cancel.

type timerCtx struct {
	cancelCtx  
	timer *time.Timer // Under cancelCtx.mu.

	deadline time.Time
}
```

### WithCancel

```
func WithCancel(parent Context) (ctx Context, cancel CancelFunc) {
    if parent == nil {  //日常判空
		panic("cannot create context from nil parent")
	}
	c := newCancelCtx(parent) //cancelCtx new
	propagateCancel(parent, &c)  //循环传播取消函数for ctx
	return &c, func() { c.cancel(true, Canceled) }
}
```
>看似很简单，四行解决，但是更重要的是学会看注释说明和相关的设计思路： 
TODO 

引用官方的语言：
```
// WithCancel returns a copy of parent with a new Done channel. The returned
// context's Done channel is closed when the returned cancel function is called
// or when the parent context's Done channel is closed, whichever happens first.
//
// Canceling this context releases resources associated with it, so code should
// call cancel as soon as the operations running in this Context complete.


Withcancel 返回的是一个parent的镜像/复制，伴随一个Done channel通道。
Done关闭状态取决于
1、返回的cancel函数。
2、parent的Done Channel关闭。
这两个哪个先符合条件了。
```

### WithDeadline/WithTimeout

自己梳理的逻辑执行顺序：

![](https://raw.githubusercontent.com/crab21/Images/master/blog/20200907-152032.png)

```
Deadline/WithTimeout区别：

* deadline:的入参是一个具体的截止时间：Time.time
* withTimeout:入参是一个多少时间后超时：Time.Duration
```

### WithValue

>Withvalue和value是成对出现的:

```
1、给ctx设置k,v：withvalue(ctx,k,v)
2、获取ctx中k的值value(ctx,k)
```
### TODO
#### timerCtx详细的设计思路和结构文档
#### 框架图整理


### END