---
title: "Mit 6.S081 Lab 3 页表"
date: 2022-06-19T01:55:24+12:00
draft: false
tags: ["中文","操作系统","6.S081"]
slug: "mit-6.S081.lab-3"
---

> 本篇文章是第三个lab的记录

官网链接：[Lab: Page tables](https://pdos.csail.mit.edu/6.828/2020/labs/pgtbl.html)

代码仓库：[Github](https://github.com/yzhe819/MIT-6.S081/tree/pgtbl)

<!--more-->
## 打印页表（easy）
为了帮助您了解RISC-V页表，也许为了帮助将来的调试，您的第一个任务是编写一个打印页表内容的函数。

定义一个名为`vmprint()`的函数。它应当接收一个`pagetable_t`作为参数，并以下面描述的格式打印该页表。在`exec.c`中的`return argc`之前插入`if(p->pid==1) vmprint(p->pagetable)`，以打印第一个进程的页表。如果你通过了`pte printout`测试的`make grade`，你将获得此作业的满分。

现在，当您启动xv6时，它应该像这样打印输出来描述第一个进程刚刚完成`exec()`ing`init`时的页表：

```
page table 0x0000000087f6e000
..0: pte 0x0000000021fda801 pa 0x0000000087f6a000
.. ..0: pte 0x0000000021fda401 pa 0x0000000087f69000
.. .. ..0: pte 0x0000000021fdac1f pa 0x0000000087f6b000
.. .. ..1: pte 0x0000000021fda00f pa 0x0000000087f68000
.. .. ..2: pte 0x0000000021fd9c1f pa 0x0000000087f67000
..255: pte 0x0000000021fdb401 pa 0x0000000087f6d000
.. ..511: pte 0x0000000021fdb001 pa 0x0000000087f6c000
.. .. ..510: pte 0x0000000021fdd807 pa 0x0000000087f76000
.. .. ..511: pte 0x0000000020001c0b pa 0x0000000080007000
```

第一行显示`vmprint`的参数。之后的每行对应一个PTE，包含树中指向页表页的PTE。每个PTE行都有一些“`..`”的缩进表明它在树中的深度。每个PTE行显示其在页表页中的PTE索引、PTE比特位以及从PTE提取的物理地址。不要打印无效的PTE。在上面的示例中，顶级页表页具有条目0和255的映射。条目0的下一级只映射了索引0，该索引0的下一级映射了条目0、1和2。

您的代码可能会发出与上面显示的不同的物理地址。条目数和虚拟地址应相同。

### 提示：

- 你可以将`vmprint()`放在**kernel/vm.c**中
- 使用定义在**kernel/riscv.h**末尾处的宏
- 函数`freewalk`可能会对你有所启发
- 将`vmprint`的原型定义在**kernel/defs.h**中，这样你就可以在`exec.c`中调用它了
- 在你的`printf`调用中使用`%p`来打印像上面示例中的完成的64比特的十六进制PTE和地址

### 实现：

观察一下函数`freewalk`，主要逻辑为历遍整页表（一共512项）然后通过`PTE_V`找出里面有效的页表项。 因为最后一层页表中页表项中W位，R位，X位起码有一位会被设置为1，所以`(pte & (PTE_R|PTE_W|PTE_X)) == 0`表示不是最后一层的页表。可以继续开始递归。因为所有的子页表已经被清空了，如果找到不符合这个条件的会报错`"freewalk: leaf"`。

```c
// Recursively free page-table pages.
// All leaf mappings must already have been removed.
void
freewalk(pagetable_t pagetable)
{
  // there are 2^9 = 512 PTEs in a page table.
  for(int i = 0; i < 512; i++){
    pte_t pte = pagetable[i];
    if((pte & PTE_V) && (pte & (PTE_R|PTE_W|PTE_X)) == 0){
      // this PTE points to a lower-level page table.
      uint64 child = PTE2PA(pte);
      freewalk((pagetable_t)child);
      pagetable[i] = 0;
    } else if(pte & PTE_V){
      panic("freewalk: leaf");
    }
  }
  kfree((void*)pagetable);
}
```

所以开始写一个简单的递归函数。对于每一个有效的页表项都打印其和其子项的内容。如果不是最后一层的页表就继续递归，以及打印层次加一。

```c
void
_vmprint(pagetable_t pagetable, int level){
  // there are 2^9 = 512 PTEs in a page table.
  for(int i = 0; i < 512; i++){
    pte_t pte = pagetable[i];
    // PTE_V is a flag for whether the page table is valid
    if(pte & PTE_V){
      for (int j = 0; j < level; j++){
        if (j) printf(" ");
        printf("..");
      }
      uint64 child = PTE2PA(pte);
      printf("%d: pte %p pa %p\n", i, pte, child);
      if((pte & (PTE_R|PTE_W|PTE_X)) == 0){
        // this PTE points to a lower-level page table.
        _vmprint((pagetable_t)child, level + 1);
      }
    }
  }
}

void
vmprint(pagetable_t pagetable){
  printf("page table %p\n", pagetable);
  _vmprint(pagetable, 1);
}
```





## 每个进程的内核页表（hard）

Xv6有一个单独的用于在内核中执行程序时的内核页表。内核页表直接映射（恒等映射）到物理地址，也就是说内核虚拟地址`x`映射到物理地址仍然是`x`。Xv6还为每个进程的用户地址空间提供了一个单独的页表，只包含该进程用户内存的映射，从虚拟地址0开始。因为内核页表不包含这些映射，所以用户地址在内核中无效。因此，当内核需要使用在系统调用中传递的用户指针（例如，传递给`write()`的缓冲区指针）时，内核必须首先将指针转换为物理地址。本节和下一节的目标是允许内核直接解引用用户指针。


你的第一项工作是修改内核来让每一个进程在内核中执行时使用它自己的内核页表的副本。修改`struct proc`来为每一个进程维护一个内核页表，修改调度程序使得切换进程时也切换内核页表。对于这个步骤，每个进程的内核页表都应当与现有的的全局内核页表完全一致。如果你的`usertests`程序正确运行了，那么你就通过了这个实验。

阅读本作业开头提到的章节和代码；了解虚拟内存代码的工作原理后，正确修改虚拟内存代码将更容易。页表设置中的错误可能会由于缺少映射而导致陷阱，可能会导致加载和存储影响到意料之外的物理页存页面，并且可能会导致执行来自错误内存页的指令。

### 提示：

- 在`struct proc`中为进程的内核页表增加一个字段
- 为一个新进程生成一个内核页表的合理方案是实现一个修改版的`kvminit`，这个版本中应当创造一个新的页表而不是修改`kernel_pagetable`。你将会考虑在`allocproc`中调用这个函数
- 确保每一个进程的内核页表都关于该进程的内核栈有一个映射。在未修改的XV6中，所有的内核栈都在`procinit`中设置。你将要把这个功能部分或全部的迁移到`allocproc`中
- 修改`scheduler()`来加载进程的内核页表到核心的`satp`寄存器(参阅`kvminithart`来获取启发)。不要忘记在调用完`w_satp()`后调用`sfence_vma()`
- 没有进程运行时`scheduler()`应当使用`kernel_pagetable`
- 在`freeproc`中释放一个进程的内核页表
- 你需要一种方法来释放页表，而不必释放叶子物理内存页面。
- 调式页表时，也许`vmprint`能派上用场
- 修改XV6本来的函数或新增函数都是允许的；你或许至少需要在**kernel/vm.c**和**kernel/proc.c**中这样做（但不要修改**kernel/vmcopyin.c**, **kernel/stats.c**, **user/usertests.c**, 和**user/stats.c**）
- 页表映射丢失很可能导致内核遭遇页面错误。这将导致打印一段包含`sepc=0x00000000XXXXXXXX`的错误提示。你可以在**kernel/kernel.asm**通过查询`XXXXXXXX`来定位错误。

### 实现：

第一步，首先给proc.h里面的`struct proc`加上内核页表的字段

```c
struct proc {
  struct spinlock lock;

  // p->lock must be held when using these:
  enum procstate state;        // Process state
  struct proc *parent;         // Parent process
  void *chan;                  // If non-zero, sleeping on chan
  int killed;                  // If non-zero, have been killed
  int xstate;                  // Exit status to be returned to parent's wait
  int pid;                     // Process ID

  // these are private to the process, so p->lock need not be held.
  uint64 kstack;               // Virtual address of kernel stack
  uint64 sz;                   // Size of process memory (bytes)
  pagetable_t pagetable;       // User page table
  pagetable_t kernelpt;        // Kernel page table
  struct trapframe *trapframe; // data page for trampoline.S
  struct context context;      // swtch() here to run process
  struct file *ofile[NOFILE];  // Open files
  struct inode *cwd;           // Current directory
  char name[16];               // Process name (debugging)
};
```



第二步，在`vm.c`中添加新的方法`proc_kpt_init`，该方法用于在`allocproc` 中初始化进程的内核页表。这个函数还需要一个辅助函数`uvmmap`，该函数和`kvmmap`方法几乎一致，不同的是`kvmmap`是对整体的内核页表进行映射，而`uvmmap`是对给定的内核页表进行映射。

```c
// Just follow the kvmmap on vm.c
void
uvmmap(pagetable_t pagetable, uint64 va, uint64 pa, uint64 sz, int perm)
{
  if(mappages(pagetable, va, sz, pa, perm) != 0)
    panic("uvmmap");
}

// Create a kernel page table for the process
pagetable_t
proc_kpt_init(){
  pagetable_t kernelpt = uvmcreate();
  if (kernelpt == 0) return 0;
  uvmmap(kernelpt, UART0, UART0, PGSIZE, PTE_R | PTE_W);
  uvmmap(kernelpt, VIRTIO0, VIRTIO0, PGSIZE, PTE_R | PTE_W);
  uvmmap(kernelpt, CLINT, CLINT, 0x10000, PTE_R | PTE_W);
  uvmmap(kernelpt, PLIC, PLIC, 0x400000, PTE_R | PTE_W);
  uvmmap(kernelpt, KERNBASE, KERNBASE, (uint64)etext-KERNBASE, PTE_R | PTE_X);
  uvmmap(kernelpt, (uint64)etext, (uint64)etext, PHYSTOP-(uint64)etext, PTE_R | PTE_W);
  uvmmap(kernelpt, TRAMPOLINE, (uint64)trampoline, PGSIZE, PTE_R | PTE_X);
  return kernelpt;
}
```

然后在allocproc里面调用

```c
...
// An empty user page table.
p->pagetable = proc_pagetable(p);
if(p->pagetable == 0){
  freeproc(p);
  release(&p->lock);
  return 0;
}

// Add the kernal page table
p->kernelpt = proc_kpt_init();
if(p->kernelpt == 0){
  freeproc(p);
  release(&p->lock);
  return 0;
}
...
```



第三步，根据提示，为了确保每一个进程的内核页表都关于该进程的内核栈有一个映射。我们需要将`procinit`方法中相关的代码迁移到`allocproc`方法中。很明显就是下面这段代码，将其剪切到上述内核页表初始化的代码后。

```c
// Allocate a page for the process's kernel stack.
// Map it high in memory, followed by an invalid
// guard page.
char *pa = kalloc();
if(pa == 0)
  panic("kalloc");
uint64 va = KSTACK((int) (p - proc));
uvmmap(p->kernelpt, va, (uint64)pa, PGSIZE, PTE_R | PTE_W);
p->kstack = va;
```



第四步，我们需要修改`scheduler()`来加载进程的内核页表到SATP寄存器。提示里面请求阅读kvminithart。

```c
// Switch h/w page table register to the kernel's page table,
// and enable paging.
void
kvminithart()
{
  w_satp(MAKE_SATP(kernel_pagetable));
  sfence_vma();
}
```

`kvminithart`是用于原先的内核页表，我们将进程的内核页表传进去就可以。在vm.c里面添加一个新方法`proc_inithart`。

```c
// Store kernel page table to SATP register
void
proc_inithart(pagetable_t kpt){
  w_satp(MAKE_SATP(kpt));
  sfence_vma();
}
```

然后在scheduler()内调用即可，但方法结束的时候，记得切换会一开始的kernel_pagetable。（调用上面的kvminithart就能做到

```c
...
p->state = RUNNING;
c->proc = p;

// Store the kernal page table into the SATP
proc_inithart(p->kernelpt);

swtch(&c->context, &p->context);

// Come back to the global kernel page table
kvminithart();
...
```



第五步，在`freeproc`中释放一个进程的内核页表。首先释放页表内的内核栈，调用uvmunmap可以解除映射，最后的一个参数（do_free）为一的时候，会释放实际内存。然后调用`proc.c`里面新加的`proc_freekernelpt`释放内核页表。

```c
// free the kernel stack in the RAM
uvmunmap(p->kernelpt, p->kstack, 1, 1);
p->kstack = 0;
// free the kernel page table of process
if(p->kernelpt)
  proc_freekernelpt(p->kernelpt);
```

调用的proc_freekernelpt方法如下，历遍整个内核页表，然后将所有有效的页表项清空为零。如果这个页表项不在最后一层的页表上，需要继续进行递归。

```c
void
proc_freekernelpt(pagetable_t kernelpt)
{
  // similar to the freewalk method
  // there are 2^9 = 512 PTEs in a page table.
  for(int i = 0; i < 512; i++){
    pte_t pte = kernelpt[i];
    if(pte & PTE_V){
      kernelpt[i] = 0;
      if ((pte & (PTE_R|PTE_W|PTE_X)) == 0){
        uint64 child = PTE2PA(pte);
        proc_freekernelpt((pagetable_t)child);
      }
    }
  }
  kfree((void*)kernelpt);
}
```



第六步，将需要的函数定义添加到 `kernel/defs.h` 中

```c
// vm.c
void            kvminit(void);
pagetable_t     proc_kpt_init(void); // 用于内核页表的初始化
void            kvminithart(void); 
void            proc_inithart(pagetable_t); // 将进程的内核页表保存到SATP寄存器
uint64          kvmpa(uint64);
void            kvmmap(uint64, uint64, uint64, int);
void            uvmmap(pagetable_t, uint64, uint64, uint64, int);
int             mappages(pagetable_t, uint64, uint64, uint64, int);
pagetable_t     uvmcreate(void);
void            uvminit(pagetable_t, uchar *, uint);
uint64          uvmalloc(pagetable_t, uint64, uint64);
uint64          uvmdealloc(pagetable_t, uint64, uint64);
#ifdef SOL_COW
#else
int             uvmcopy(pagetable_t, pagetable_t, uint64);
#endif
void            uvmfree(pagetable_t, uint64);
void            uvmunmap(pagetable_t, uint64, uint64, int);
void            uvmclear(pagetable_t, uint64);
uint64          walkaddr(pagetable_t, uint64);
int             copyout(pagetable_t, uint64, char *, uint64);
int             copyin(pagetable_t, char *, uint64, uint64);
int             copyinstr(pagetable_t, char *, uint64, uint64);
void            vmprint(pagetable_t); // 在问题一被使用
```



最后，修改`vm.c`中的`kvmpa`，将原先的`kernel_pagetable`改成`myproc()->kernelpt`。不要忘记引一下包。

```c
#include "spinlock.h" 
#include "proc.h"

uint64
kvmpa(uint64 va)
{
  uint64 off = va % PGSIZE;
  pte_t *pte;
  uint64 pa;
  
  pte = walk(myproc()->kernelpt, va, 0);
  if(pte == 0)
    panic("kvmpa");
  if((*pte & PTE_V) == 0)
    panic("kvmpa");
  pa = PTE2PA(*pte);
  return pa+off;
}
```

