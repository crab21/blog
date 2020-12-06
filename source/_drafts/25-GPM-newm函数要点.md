---
title: 「25」GPM newm函数要点
date: '2020/11/30 00:00:17'
updated: '2020/11/30 00:00:17'
keywords: 'GPM,Go,Go调度器,Go资源调度器'
tags:
  - Go
  - GPM
  - Go源码
---


之前大概学了GPM在main函数调度过程中关于newm的相关知识。

觉得还是了解甚少，，，，，

这次主要是想了解其中一些关键点的变换过程.

<!--more-->

```go
//go:nowritebarrierrec
func newm(fn func(), _p_ *p) {
	mp := allocm(_p_, fn)
	mp.nextp.set(_p_)
	mp.sigmask = initSigmask
	if gp := getg(); gp != nil && gp.m != nil && (gp.m.lockedExt != 0 || gp.m.incgo) && GOOS != "plan9" {
        ...
        ....
		mp.schedlink = newmHandoff.newm
		newmHandoff.newm.set(mp)
		if newmHandoff.waiting {
			newmHandoff.waiting = false
			notewakeup(&newmHandoff.wake)
		}
		unlock(&newmHandoff.lock)
		return
	}
	newm1(mp)
}
```