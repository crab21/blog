---
title: 「21」-linux select源码-1
date: '2020/11/17 19:09:17'
updated: '2020/11/17 19:09:17'
keywords: 
tags:
  - Linux
  - Day
---


> select poll epoll三个老生长谈的问题.这次不是来讲区别的，后续会更新一篇关于三者区别的。

### 前序 
select属于linux系列的文件系统「fs」的范畴，每次的系统调用、打开软件、启动程序等等都会涉及到文件的读写，
这个是在所难免的。

那么I/O事件的基本思路：文件准备ok，开始读写，等函数返回，根据结果继续运行.

如果是自己实现，大体上无非以下思路：
<!--more-->

* 创建多个进程/线程来监听
* Non-blocking读写监听的轮询
* 异步I/O与Unix Signal事件机制

先来学习下linux源码是怎么处理select机制的：

### 概览图

梳理了下，大概整理成了流程图：

![](https://raw.githubusercontent.com/crab21/Images/master/blog/linux源码-select-1.png)


### select切入点

既然知道了select属于fs系列的，那就很容易找到:[fs/select.c]

查看select命令：
```shell
man 2 select
```

下面按照以下顺序来解读，一起学习：

* 入口 SYSCALL_DEFINE5
* 核心函数 do_select
* 设备驱动的操作函数 
* poll_wait与设备的等待队列
* fd数量限制「why」
* select与poll


### SYSCALL_DEFINE5


```c++
SYSCALL_DEFINE5(select, int, n, fd_set __user *, inp, fd_set __user *, outp,
		fd_set __user *, exp, struct __kernel_old_timeval __user *, tvp)
{
	return kern_select(n, inp, outp, exp, tvp);
}


```

函数：core_sys_select中主要的do_select处理其中的逻辑

### do_select

关键性的结构体
```c++
typedef struct {
	unsigned long *in, *out, *ex; //输出 、输入、异常
	unsigned long *res_in, *res_out, *res_ex;
} fd_set_bits;
```


```c++

static int do_select(int n, fd_set_bits *fds, struct timespec64 *end_time)
{
	ktime_t expire, *to = NULL;
	struct poll_wqueues table;
	poll_table *wait;
	int retval, i, timed_out = 0;
	u64 slack = 0;
	__poll_t busy_flag = net_busy_loop_on() ? POLL_BUSY_LOOP : 0;
	unsigned long busy_start = 0;

	rcu_read_lock();
    //找出文件的最大描述符
	retval = max_select_fd(n, fds);
	rcu_read_unlock();

	if (retval < 0)
		return retval;
	n = retval;

    //初始化
	poll_initwait(&table);
	wait = &table.pt;
	if (end_time && !end_time->tv_sec && !end_time->tv_nsec) {
		wait->_qproc = NULL;
		timed_out = 1;
	}

	if (end_time && !timed_out)
		slack = select_estimate_accuracy(end_time);

	retval = 0;
	for (;;) {
		unsigned long *rinp, *routp, *rexp, *inp, *outp, *exp;
		bool can_busy_loop = false;

		inp = fds->in; outp = fds->out; exp = fds->ex;
		rinp = fds->res_in; routp = fds->res_out; rexp = fds->res_ex;

        //遍历所有的fd.......同步等.....
		for (i = 0; i < n; ++rinp, ++routp, ++rexp) {
			unsigned long in, out, ex, all_bits, bit = 1, j;
			unsigned long res_in = 0, res_out = 0, res_ex = 0;
			__poll_t mask;

			in = *inp++; out = *outp++; ex = *exp++;
			all_bits = in | out | ex;
            //没有任何注册事件
			if (all_bits == 0) {
				i += BITS_PER_LONG;
				continue;
			}

			for (j = 0; j < BITS_PER_LONG; ++j, ++i, bit <<= 1) {
				struct fd f;
				if (i >= n)
					break;
                //跳过未注册的
				if (!(bit & all_bits))
					continue;
				f = fdget(i);
				if (f.file) {
					wait_key_set(wait, in, out, bit,
						     busy_flag);

                    //对每一个fd进行检测
					mask = vfs_poll(f.file, wait);

					fdput(f);
					if ((mask & POLLIN_SET) && (in & bit)) {
						res_in |= bit;
						retval++;
						wait->_qproc = NULL;
					}
					if ((mask & POLLOUT_SET) && (out & bit)) {
						res_out |= bit;
						retval++;
						wait->_qproc = NULL;
					}
					if ((mask & POLLEX_SET) && (ex & bit)) {
						res_ex |= bit;
						retval++;
						wait->_qproc = NULL;
					}
					/* got something, stop busy polling */
					if (retval) {
						can_busy_loop = false;
						busy_flag = 0;

					/*
					 * only remember a returned
					 * POLL_BUSY_LOOP if we asked for it
					 */
					} else if (busy_flag & mask)
						can_busy_loop = true;

				}
			}
			if (res_in)
				*rinp = res_in;
			if (res_out)
				*routp = res_out;
			if (res_ex)
				*rexp = res_ex;
			cond_resched();
		}
		wait->_qproc = NULL;

        //退出循环，条件： 事件就绪/超时/收到信号
		if (retval || timed_out || signal_pending(current))
			break;
		if (table.error) {
			retval = table.error;
			break;
		}

		/* only if found POLL_BUSY_LOOP sockets && not out of time */
		if (can_busy_loop && !need_resched()) {
			if (!busy_start) {
				busy_start = busy_loop_current_time();
				continue;
			}
			if (!busy_loop_timeout(busy_start))
				continue;
		}
		busy_flag = 0;

		/*
		 * If this is the first loop and we have a timeout
		 * given, then we convert to ktime_t and set the to
		 * pointer to the expiry value.
		 */
		if (end_time && !to) {
			expire = timespec64_to_ktime(*end_time);
			to = &expire;
		}

        //超时就休眠一会儿「中断会儿」
		if (!poll_schedule_timeout(&table, TASK_INTERRUPTIBLE,
					   to, slack))
			timed_out = 1;
	}

	poll_freewait(&table);

	return retval;
}
```



```c++
static int poll_schedule_timeout(struct poll_wqueues *pwq, int state,
			  ktime_t *expires, unsigned long slack)
{
	int rc = -EINTR;

	set_current_state(state);
	if (!pwq->triggered)
		rc = schedule_hrtimeout_range(expires, slack, HRTIMER_MODE_ABS);
	__set_current_state(TASK_RUNNING);

	/*
	 * Prepare for the next iteration.
	 *
	 * The following smp_store_mb() serves two purposes.  First, it's
	 * the counterpart rmb of the wmb in pollwake() such that data
	 * written before wake up is always visible after wake up.
	 * Second, the full barrier guarantees that triggered clearing
	 * doesn't pass event check of the next iteration.  Note that
	 * this problem doesn't exist for the first iteration as
	 * add_wait_queue() has full barrier semantics.
	 */
	smp_store_mb(pwq->triggered, 0);

	return rc;
}
```
#### 
### poll_wait

```c++


/* 
 * structures and helpers for f_op->poll implementations
 */
 //类似一个回调函数
typedef void (*poll_queue_proc)(struct file *, wait_queue_head_t *, struct poll_table_struct *);


typedef struct poll_table_struct {
	poll_queue_proc _qproc; //callback机制
	__poll_t _key;
} poll_table;


static inline void poll_wait(struct file * filp, wait_queue_head_t * wait_address, poll_table *p)
{
	if (p && p->_qproc && wait_address)
		p->_qproc(filp, wait_address, p);
}
```

### fd数量问题

>include/uapi/linux/posix_types.h

```c++
#define __FD_SETSIZE	1024

typedef struct {
  //__FD_SETSIZE当下标使？？？what！
	unsigned long fds_bits[__FD_SETSIZE / (8 * sizeof(long))];
} __kernel_fd_set;

struct fd {
	struct file *file;
	unsigned int flags;
};
```


>从上面看来文件描述符只是一个整数值，用来操作下标的，主要是每一个进程file数组的下标。理解do_select是核心。

### select 与poll

>poll取消了最大数量的限制,返回结果还是需要轮询来获取就绪的描述符。

```c++
struct pollfd {
	int fd;
	short events; //request
	short revents; // return
};
```

具体见后续更新「poll源码」

### 参考

[Linux Device Drivers, Third Edition](https://www.oreilly.com/openbook/linuxdrive3/book/)
[How do system calls like select() or poll() work under the hood?](https://stackoverflow.com/questions/11496059/how-do-system-calls-like-select-or-poll-work-under-the-hood)

