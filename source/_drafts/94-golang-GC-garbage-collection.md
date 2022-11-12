---
title: 「94」golang GC (garbage collection)
date: 2022-11-09 09:27:03
tags:
---
## [Garbage Collection](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science))

>关于gc不多说了,有兴趣自己google.

## Why GC?

>要么自己管理内存(采用allocate+free,如c/c++等),要么托管(jvm/gogc等).


```
in most cases, a Go developer need not care about where these values are stored, or why, if at all. In practice, however, these values often need to be stored in computer physical memory and physical memory is a finite resource. Because it is finite, memory must be managed carefully and recycled in order to avoid running out of it while executing a Go program. It's the job of a Go implementation to allocate and recycle memory as needed.


TS: go开发者不需要关心值的存储等问题. 然而这些值都在物理内存中,物理内存资源有限. 因为有限,当go程序执行时候,内存必须小心管理,回收使用. 对于GO来说分配和回收内存很有必要.
```
## Development

* The GC Handbook—An excellent general resource and reference on garbage collector design.
* TCMalloc—Design document for the C/C++ memory allocator TCMalloc, which the Go memory allocator is based on.
* Go 1.5 GC announcement—The blog post announcing the Go 1.5 concurrent GC, which describes the algorithm in more detail.
* Getting to Go—An in-depth presentation about the evolution of Go's GC design up to 2018.
* [Go 1.5 concurrent GC pacing](https://docs.google.com/document/d/1wmjrocXIWTr1JxU-3EQBI6BK6KgtiFArkG47XK73xIQ/edit)—Design document for determining when to start a concurrent mark phase.
* Smarter scavenging—Design document for revising the way the Go runtime returns memory to the operating system.
* [Scalable page allocator](https://github.com/golang/go/issues/35112)—Design document for revising the way the Go runtime manages memory it gets from the operating system.
* [GC pacer redesign (Go 1.18)](https://github.com/golang/go/issues/44167)—Design document for revising the algorithm to determine when to start a concurrent mark phase.
* Soft memory limit (Go 1.19)—Design document for the soft memory limit.

## gc algorithm

* tracing garbage collection
  * Reference counting
  * Tracing garbage
* [Tri-color marking](https://medium.com/a-journey-with-go/go-how-does-the-garbage-collector-mark-the-memory-72cfc12c6976)

<!--more-->
## Notice

### escape传递性

>引用官方描述:

```
Note that escaping to the heap must also be transitive: if a reference to a Go value is written into another Go value that has already been determined to escape, that value must also escape.

TS: 如果一个go值的引用写入到另一个要逃逸的go值,则该值也会escape.
```
### GC Algorithm Phases


## Reference

* ☞ https://tip.golang.org/doc/gc-guide
* ☞ https://go.dev/talks/2015/go-gc.pdf
* ☞ https://go.dev/blog/ismmkeynote
* ☞ https://docs.google.com/document/d/1wmjrocXIWTr1JxU-3EQBI6BK6KgtiFArkG47XK73xIQ
* ☞ https://www.developer.com/languages/tricolor-algorithm-golang/
* ☞ https://medium.com/a-journey-with-go/go-how-does-the-garbage-collector-mark-the-memory-72cfc12c6976
