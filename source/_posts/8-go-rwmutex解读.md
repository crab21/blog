---
title: 「8」go rwmutex解读
date: '2020/09/17 01:24:32'
updated: '2020/09/21 21:24:32'
keywords: 'golang,go 源码,go 读写锁, rwmutex 解读'
tags:
  - Go
  - Go源码
  - Go Package
  - 锁
abbrlink: 3038b6c3
---

    好久没有更新文章了，表达能力生疏了许多😄....
    今天扯扯:rwmutex 被称为读写锁。一说到【锁】最直接的联想可能就是lock()、Rlock()、unlock()、Runlock()之类的，但是作为程序猿，还是要了解下底层的设计和相关的逻辑实现，以便于把这种锁的设计思想应用到其它场景中，好了，不废话了，开题吧。
    从锁的结构设计-->加锁的过程--->加锁的粒度---->解锁释放，整个生命周期来看rwmutex的具体实现。
<!-- more -->
### 版本
```
◯  go version
go version go1.14.9 darwin/amd64
```

### 同向对比rwmutex锁的设计
    java实现：AQS(AbstractQueuedSynchronizer)

### 结构设计
>原则：读写互斥，优先写。

```go
type RWMutex struct {
	w           Mutex  // held if there are pending writers
	writerSem   uint32 // semaphore for writers to wait for completing readers  写信号量
	readerSem   uint32 // semaphore for readers to wait for completing writers  读信号量
	readerCount int32  // number of pending readers 读计数
	readerWait  int32  // number of departing readers   读等待（write进行）
}

const rwmutexMaxReaders = 1 << 30   //最大读锁的个数
```

其它再分类就是四个主要的函数：

```
RLock
RUnLock
Lock
UnLock
```
### 加锁过程

#### RLock过程

```go
func (rw *RWMutex) RLock() {
	if race.Enabled {
		_ = rw.w.state
		race.Disable()
    }
    //如果写锁被获取的，则readerCount<0的，阻塞状态
    //如果写锁没有被获取，则readerCount >0的，获取读锁，不阻塞
	if atomic.AddInt32(&rw.readerCount, 1) < 0 {
        // A writer is pending, wait for it. 
        //写锁被获取了，加到G队列后面，挂起。
		runtime_SemacquireMutex(&rw.readerSem, false, 0)
	}
	if race.Enabled {
		race.Enable()
		race.Acquire(unsafe.Pointer(&rw.readerSem))
	}
}
```

#### Lock过程

```go
// Lock locks rw for writing.
// If the lock is already locked for reading or writing,
// Lock blocks until the lock is available.
func (rw *RWMutex) Lock() {
	if race.Enabled {
		_ = rw.w.state
		race.Disable()
	}
    // First, resolve competition with other writers.
    //使用mutex锁
	rw.w.Lock()
	// Announce to readers there is a pending writer.
	r := atomic.AddInt32(&rw.readerCount, -rwmutexMaxReaders) + rwmutexMaxReaders
	// Wait for active readers.
	if r != 0 && atomic.AddInt32(&rw.readerWait, r) != 0 {
        //等待活跃的reader结束后，再给一个写的信号量，保证此刻之后的reader挂起。
		runtime_SemacquireMutex(&rw.writerSem, false, 0)
	}
	if race.Enabled {
		race.Enable()
		race.Acquire(unsafe.Pointer(&rw.readerSem))
		race.Acquire(unsafe.Pointer(&rw.writerSem))
	}
}
```

### 加锁的粒度
> 读 & 写 互不干扰.

### 解锁释放

#### RUnLock

```go
func (rw *RWMutex) RUnlock() {
	if race.Enabled {
		_ = rw.w.state
		race.ReleaseMerge(unsafe.Pointer(&rw.writerSem))
		race.Disable()
    }
    // 写锁等待状态，检查当前是否可以进行获取
	if r := atomic.AddInt32(&rw.readerCount, -1); r < 0 {
		// Outlined slow-path to allow the fast-path to be inlined
		rw.rUnlockSlow(r)
	}
	if race.Enabled {
		race.Enable()
	}
}

func (rw *RWMutex) rUnlockSlow(r int32) {
    // r + 1 == 0表示直接执行RUnlock()
	// r + 1 == -rwmutexMaxReaders表示执行Lock()再执行RUnlock()
	if r+1 == 0 || r+1 == -rwmutexMaxReaders {
		race.Enable()
		throw("sync: RUnlock of unlocked RWMutex")
	}
    // A writer is pending.
    // 当读锁释放完毕后，通知写锁
	if atomic.AddInt32(&rw.readerWait, -1) == 0 {
		// The last reader unblocks the writer.
		runtime_Semrelease(&rw.writerSem, false, 1)
	}
}
```

#### UnLock

```go
func (rw *RWMutex) Unlock() {
	if race.Enabled {
		_ = rw.w.state
		race.Release(unsafe.Pointer(&rw.readerSem))
		race.Disable()
	}

	// Announce to readers there is no active writer.
    r := atomic.AddInt32(&rw.readerCount, rwmutexMaxReaders)
    //说明这个没有枷锁，没法再次释放
	if r >= rwmutexMaxReaders {
		race.Enable()
		throw("sync: Unlock of unlocked RWMutex")
	}
    // Unblock blocked readers, if any.
    //释放所有的锁。
	for i := 0; i < int(r); i++ {
		runtime_Semrelease(&rw.readerSem, false, 0)
	}
	// Allow other writers to proceed.
	rw.w.Unlock()
	if race.Enabled {
		race.Enable()
	}
}
```
### 总结

>读&写，互不干扰。

* 读锁不能阻塞读锁，引入readerCount.

* 读锁需要阻塞写锁，直到所以读锁都释放，引入readerSem.

* 写锁需要阻塞读锁，直到所以写锁都释放，引入wirterSem.

* 写锁需要阻塞写锁，引入Metux.

### END