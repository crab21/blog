---
title: 「10」go mutex解读
date: '2020/09/21 23:06:32'
updated: '2020/09/22 13:20:32'
keywords: 'golang,go 源码,go 锁, mutex 解读'
tags:
  - Go
  - Go源码
  - Go Package
  - 锁
abbrlink: ff0d6c2b
---

上次说到rwmutex读写锁，其实就是加强了锁的粒度，区分读和写时不同的情况，核心思想：写优先于读。
这次来看看mutex，go中的锁是如何实现的，用一张图来概括整个流程：
<!-- more -->
![](https://raw.githubusercontent.com/crab21/Images/master/mutex.png)

>核心思想：饥饿和队列，正常流程都是加入到队列尾部，如果超过一定的时间限制则加入到队列头部。

### 前序
>开始看代码或者分析之前，先看下文档说明及其相关的资料。

```
◯  go version
go version go1.14.9 darwin/amd64
```

### src/sync/mutex.go
```go
const (
	mutexLocked = 1 << iota // mutex is locked      state & mutexLocked 1==加锁  0==未加锁

	

	mutexWoken                                      //state & mutexWoken 1==唤醒  0==未唤醒
	mutexStarving                                   // state & mutexStarving 1==饥饿状态   0==正常状态
	mutexWaiterShift = iota                         // state >> mutexWaiterShift得到当前的goroutine数量

	// Mutex fairness.
	// 两种模式：正常或饥饿
    // Mutex can be in 2 modes of operations: normal and starvation.
    //  正常模式就是FIFO队列。
	// In normal mode waiters are queued in FIFO order, but a woken up waiter
	// does not own the mutex and competes with new arriving goroutines over
	// the ownership. New arriving goroutines have an advantage -- they are
	// already running on CPU and there can be lots of them, so a woken up
	// waiter has good chances of losing. In such case it is queued at front
	// of the wait queue. If a waiter fails to acquire the mutex for more than 1ms,  //获取锁的时间超过1ms，切换到饥饿模式
	// it switches mutex to the starvation mode.
	//
	// In starvation mode ownership of the mutex is directly handed off from        //饥饿模式下锁的所有权直接从解锁goroutine的waiter手中移交到队列的前面。
	// the unlocking goroutine to the waiter at the front of the queue.
	// New arriving goroutines don't try to acquire the mutex even if it appears
	// to be unlocked, and don't try to spin. Instead they queue themselves at
	// the tail of the wait queue.
	//
	// If a waiter receives ownership of the mutex and sees that either         //如果一个锁的所有权的等待者是以下两种情况之一的：1、处于队列的最后一个2、等待时间少于1ms，则切换到正常模式
	// (1) it is the last waiter in the queue, or (2) it waited for less than 1 ms,
	// it switches mutex back to normal operation mode.
	//
	// Normal mode has considerably better performance as a goroutine can acquire
	// a mutex several times in a row even if there are blocked waiters.
	// Starvation mode is important to prevent pathological cases of tail latency.
	starvationThresholdNs = 1e6
)
```
### 加锁流程
>加锁过程图如上图提到的流程。

>加锁代码具体流程：

```go
func (m *Mutex) Lock() {
	// Fast path: grab unlocked mutex.
	if atomic.CompareAndSwapInt32(&m.state, 0, mutexLocked) {
		if race.Enabled {
			race.Acquire(unsafe.Pointer(m))
		}
		return
	}
	// Slow path (outlined so that the fast path can be inlined)
	m.lockSlow()
}

func (m *Mutex) lockSlow() {
	var waitStartTime int64 //等待时间
	starving := false       //是否处于饥饿状态
	awoke := false          //唤醒状态
	iter := 0               //自旋次数
	old := m.state          //当前状态copy
	for {
		// Don't spin in starvation mode, ownership is handed off to waiters
        // so we won't be able to acquire the mutex anyway.
        //加锁且能够自旋
		if old&(mutexLocked|mutexStarving) == mutexLocked && runtime_canSpin(iter) {
			// Active spinning makes sense.
			// Try to set mutexWoken flag to inform Unlock
            // to not wake other blocked goroutines.
            //自旋过程发现没有被置woken标识，设置标识，将自己置为唤醒
			if !awoke && old&mutexWoken == 0 && old>>mutexWaiterShift != 0 &&
				atomic.CompareAndSwapInt32(&m.state, old, old|mutexWoken) {
				awoke = true
			}
			runtime_doSpin()    //自旋
			iter++              
			old = m.state       //状态重置
			continue
        }
        //更新状态
		new := old
        // Don't try to acquire starving mutex, new arriving goroutines must queue.
        //非饥饿模式，则置锁
		if old&mutexStarving == 0 {
			new |= mutexLocked
        }
        // 处于饥饿模式下，新来的goroutine进入队列中
		if old&(mutexLocked|mutexStarving) != 0 {
			new += 1 << mutexWaiterShift
		}
		// The current goroutine switches mutex to starvation mode.
		// But if the mutex is currently unlocked, don't do the switch.
		// Unlock expects that starving mutex has waiters, which will not
        // be true in this case.
        //切换到饥饿模式下
		if starving && old&mutexLocked != 0 {
			new |= mutexStarving
        }
        //当前处于唤醒状态，则重置清除唤醒状态。
		if awoke {
			// The goroutine has been woken from sleep,
			// so we need to reset the flag in either case.
			if new&mutexWoken == 0 {
				throw("sync: inconsistent mutex state")
			}
			new &^= mutexWoken
        }
        //CAS更新状态。
		if atomic.CompareAndSwapInt32(&m.state, old, new) {
            //获取到锁
			if old&(mutexLocked|mutexStarving) == 0 {
				break // locked the mutex with CAS
			}
            // If we were already waiting before, queue at the front of the queue.
            //等待队列的时间
			queueLifo := waitStartTime != 0
			if waitStartTime == 0 {
				waitStartTime = runtime_nanotime()
            }
            //acquire阻塞队列....
            // 新来的 goroutine, queueLifo=false, 加入到等待队列的尾部，耐心等待
            // 唤醒的 goroutine, queueLifo=true, 加入到等待队列的头部
			runtime_SemacquireMutex(&m.sema, queueLifo, 1)
			starving = starving || runtime_nanotime()-waitStartTime > starvationThresholdNs
            old = m.state
            //处于饥饿模式
			if old&mutexStarving != 0 {
				// If this goroutine was woken and mutex is in starvation mode,
				// ownership was handed off to us but mutex is in somewhat
				// inconsistent state: mutexLocked is not set and we are still
				// accounted as waiter. Fix that.
				if old&(mutexLocked|mutexWoken) != 0 || old>>mutexWaiterShift == 0 {
					throw("sync: inconsistent mutex state")
                }
                //等待的goroutine-1
                delta := int32(mutexLocked - 1<<mutexWaiterShift)
                // 处于队列中最后一个或者请求锁的时间未超过starvationThresholdNs，则回退到正常模式。
				if !starving || old>>mutexWaiterShift == 1 {
					// Exit starvation mode.
					// Critical to do it here and consider wait time.
					// Starvation mode is so inefficient, that two goroutines
					// can go lock-step infinitely once they switch mutex
					// to starvation mode.
					delta -= mutexStarving
                }
                //更新状态
				atomic.AddInt32(&m.state, delta)
				break
            }
            //重置迭代器和唤醒表示，继续获取锁
			awoke = true
			iter = 0
		} else {
            //CAS失败，则更新状态，继续获取。
			old = m.state
		}
	}

	if race.Enabled {
		race.Acquire(unsafe.Pointer(m))
	}
}

```
### 解锁过程

用一个流程图来表示解锁过程：

![](https://raw.githubusercontent.com/crab21/Images/master/mutex-unlock.png)

```go
func (m *Mutex) Unlock() {
    //state 不是处于锁的状态, 那么就是 Unlock 根本没有加锁的 mutex, panic
    new := atomic.AddInt32(&m.state, -mutexLocked)
    if (new+mutexLocked)&mutexLocked == 0 {
        throw("sync: unlock of unlocked mutex")
    }

    // 释放锁，并通知其它等待者
    // 锁如果处于饥饿状态，直接交给等待队列的第一个, 唤醒它，让它去获取锁
    // mutex 正常模式
    if new&mutexStarving == 0 {
        old := new
        for {
            // 如果没有等待者，或者已经存在一个 goroutine 被唤醒或得到锁、或处于饥饿模式
            // 直接返回.
            if old>>mutexWaiterShift == 0 || old&(mutexLocked|mutexWoken|mutexStarving) != 0 {
                return
            }
            // 将等待的 goroutine-1，并设置 woken 标识
            new = (old - 1<<mutexWaiterShift) | mutexWoken
            // 设置新的 state, 这里通过信号量会唤醒一个阻塞的 goroutine 去获取锁.
            if atomic.CompareAndSwapInt32(&m.state, old, new) {
                runtime_Semrelease(&m.sema, false)
                return
            }
            old = m.state
        }
    } else {
        // mutex 饥饿模式，直接将 mutex 拥有权移交给等待队列最前端的 goroutine
        // 注意此时 state 的 mutex 还没有加锁，唤醒的 goroutine 会设置它。
        // 在此期间，如果有新的 goroutine 来请求锁， 因为 mutex 处于饥饿状态， mutex 还是被认为处于锁状态，
        // 新来的 goroutine 不会把锁抢过去.
        runtime_Semrelease(&m.sema, true)
    }
}

```

### 关键点

* 不要重复锁定互斥锁
* 不要忘记解锁互斥锁
* 不要在多个函数之间直接传递互斥锁

### END