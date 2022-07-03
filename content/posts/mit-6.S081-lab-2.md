---
title: "MIT 6.S081 Lab 2 系统调用"
date: 2022-06-14T22:19:02+12:00
draft: false
tags: ["中文","操作系统","6.S081"]
slug: "mit-6.S081-lab-2"
---

> 本篇文章是第二个lab的记录

完成了基础的实验室内容

挑战练习有时间会再看看

官网链接：[Lab: system calls](https://pdos.csail.mit.edu/6.828/2020/labs/syscall.html)

代码仓库：[Github](https://github.com/yzhe819/MIT-6.S081/tree/syscall)

<!--more-->
## 系统调用追踪（moderate）
在本作业中，您将添加一个系统调用跟踪功能，该功能可能会在以后调试实验时对您有所帮助。您将创建一个新的`trace`系统调用来控制跟踪。它应该有一个参数，这个参数是一个整数“掩码”（mask），它的比特位指定要跟踪的系统调用。例如，要跟踪`fork`系统调用，程序调用`trace(1 << SYS_fork)`，其中`SYS_fork`是**kernel/syscall.h**中的系统调用编号。如果在掩码中设置了系统调用的编号，则必须修改xv6内核，以便在每个系统调用即将返回时打印出一行。该行应该包含进程id、系统调用的名称和返回值；您不需要打印系统调用参数。`trace`系统调用应启用对调用它的进程及其随后派生的任何子进程的跟踪，但不应影响其他进程。

我们提供了一个用户级程序版本的`trace`，它运行另一个启用了跟踪的程序（参见**user/trace.c**）。完成后，您应该看到如下输出：

```bash
$ trace 32 grep hello README
3: syscall read -> 1023
3: syscall read -> 966
3: syscall read -> 70
3: syscall read -> 0
$
$ trace 2147483647 grep hello README
4: syscall trace -> 0
4: syscall exec -> 3
4: syscall open -> 3
4: syscall read -> 1023
4: syscall read -> 966
4: syscall read -> 70
4: syscall read -> 0
4: syscall close -> 0
$
$ grep hello README
$
$ trace 2 usertests forkforkfork
usertests starting
test forkforkfork: 407: syscall fork -> 408
408: syscall fork -> 409
409: syscall fork -> 410
410: syscall fork -> 411
409: syscall fork -> 412
410: syscall fork -> 413
409: syscall fork -> 414
411: syscall fork -> 415
...
$
```

在上面的第一个例子中，`trace`调用`grep`，仅跟踪了`read`系统调用。`32`是`1<<SYS_read`。在第二个示例中，`trace`在运行`grep`时跟踪所有系统调用；`2147483647`将所有31个低位置为1。在第三个示例中，程序没有被跟踪，因此没有打印跟踪输出。在第四个示例中，在`usertests`中测试的`forkforkfork`中所有子孙进程的`fork`系统调用都被追踪。如果程序的行为如上所示，则解决方案是正确的（尽管进程ID可能不同）

### 提示：

- 在**Makefile**的**UPROGS**中添加`$U/_trace`
- 运行`make qemu`，您将看到编译器无法编译**user/trace.c**，因为系统调用的用户空间存根还不存在：将系统调用的原型添加到**user/user.h**，存根添加到**user/usys.pl**，以及将系统调用编号添加到**kernel/syscall.h**，**Makefile**调用perl脚本**user/usys.pl**，它生成实际的系统调用存根**user/usys.S**，这个文件中的汇编代码使用RISC-V的`ecall`指令转换到内核。一旦修复了编译问题（*注：如果编译还未通过，尝试先`make clean`，再执行`make qemu`*），就运行`trace 32 grep hello README`；但由于您还没有在内核中实现系统调用，执行将失败。
- 在**kernel/sysproc.c**中添加一个`sys_trace()`函数，它通过将参数保存到`proc`结构体（请参见**kernel/proc.h**）里的一个新变量中来实现新的系统调用。从用户空间检索系统调用参数的函数在**kernel/syscall.c**中，您可以在**kernel/sysproc.c**中看到它们的使用示例。
- 修改`fork()`（请参阅**kernel/proc.c**）将跟踪掩码从父进程复制到子进程。
- 修改**kernel/syscall.c**中的`syscall()`函数以打印跟踪输出。您将需要添加一个系统调用名称数组以建立索引。

### 实现：

首先观察题目中提到的**user/trace.c**

```c
int
main(int argc, char *argv[])
{
  int i;
  char *nargv[MAXARG];

  if(argc < 3 || (argv[1][0] < '0' || argv[1][0] > '9')){
    fprintf(2, "Usage: %s mask command\n", argv[0]);
    exit(1);
  }

  if (trace(atoi(argv[1])) < 0) {
    fprintf(2, "%s: trace failed\n", argv[0]);
    exit(1);
  }
  
  for(i = 2; i < argc && i < MAXARG; i++){
    nargv[i-2] = argv[i];
  }
  exec(nargv[0], nargv);
  exit(0);
}
```

这是使用用例：

```bash
$ trace 32 grep hello README
```

根据代码可得，第一个判断是检查参数是否足够，以及第一个参数，整数“掩码”（mask），它是否有效。 然后就是将这个命令行参数（存成char array）转为整数。最后的for loop只是普通的将后续参数存一下（相当于去掉例子中开头的trace和32），然后接下来用exec调用。

了解完这个trace函数后，我们可以根据提示将需要的代码补上，首先在**Makefile**里面的**UPROGS**把**$U/_trace**加上。

```c
	$U/_wc\
	$U/_zombie\
	$U/_trace
```

然后去**user.h**里面加调用原型加上，因为题目上了只有一个整数参数，使用直接`trace(int)`

```c
int sleep(int);
int uptime(void);
int trace(int);
```

然后去到**user/usys.pl**把entry加上：

```plsql
entry("sleep");
entry("uptime");
entry("trace");
```

最后添加system call number到kernel/syscall里面，直接加到最后：

```c
#define SYS_mkdir  20
#define SYS_close  21
#define SYS_trace  22
```

到此配置就完成了，可以真正的实现功能了！

首先要修改kernel/proc.h中的proc结构，这是用来存储进程状态的数据结构，给他加一个mask用于追踪:

```c
// Per-process state
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
  struct trapframe *trapframe; // data page for trampoline.S
  struct context context;      // swtch() here to run process
  struct file *ofile[NOFILE];  // Open files
  struct inode *cwd;           // Current directory
  char name[16];               // Process name (debugging)

  int mask; // Process mask (for tracing)
};
```

然后转移到kernel/sysproc.c里面添加sys_trace()：

```c
uint64
sys_trace(void)
{
  argint(0, &(myproc()->mask));
  return 0;
}
```

这里的函数是获取args[1]的值，然后将它存到我们新添加的mask里面。更加完整的版本应该是还需要添加获取判断，看看有没有成功获取参数。

```c
uint64
sys_trace(void)
{
  int n;
  if (argint(0, &n) < 0) // 判断参数是否获取成功
    return -1;
  myproc()->mask = n;    // 将argv[1]保存到当前进程的mask中
  return 0;
}
```

因为题目提到`trace`系统调用应启用对调用它的进程及其随后派生的任何子进程的跟踪，所以我们需要在fork的时候将mask值也保存到子进程里面。fork是在kernel/proc.c里面的，这里直接将原函数附上。

```c
int
fork(void)
{
  int i, pid;
  struct proc *np;
  struct proc *p = myproc();

  // Allocate process.
  if((np = allocproc()) == 0){
    return -1;
  }

  // Copy user memory from parent to child.
  if(uvmcopy(p->pagetable, np->pagetable, p->sz) < 0){
    freeproc(np);
    release(&np->lock);
    return -1;
  }
  np->sz = p->sz;

  np->parent = p;

  // copy saved user registers.
  *(np->trapframe) = *(p->trapframe);

  // Cause fork to return 0 in the child.
  np->trapframe->a0 = 0;

  // increment reference counts on open file descriptors.
  for(i = 0; i < NOFILE; i++)
    if(p->ofile[i])
      np->ofile[i] = filedup(p->ofile[i]);
  np->cwd = idup(p->cwd);

  safestrcpy(np->name, p->name, sizeof(p->name));

  np->mask = p->mask; // copy the process's signal mask

  pid = np->pid;

  np->state = RUNNABLE;

  release(&np->lock);

  return pid;
}
```

最后修改一下**kernel/syscall.c**中的`syscall()`函数以打印跟踪输出。这部分需要在(*syscalls[])(void)里面加一下。还有手动给他建个字符串数组给他存一下调用的方法名，方便使用。以及加一下函数声明在顶上：

```c
extern uint64 sys_write(void);
extern uint64 sys_uptime(void);
extern uint64 sys_trace(void);

// ...

static uint64 (*syscalls[])(void) = {
// ...
[SYS_trace]   sys_trace,
}

// translate from the above system call function names
static char *syscalls_name[] = {
[SYS_fork]    "fork",
[SYS_exit]    "exit",
[SYS_wait]    "wait",
[SYS_pipe]    "pipe",
[SYS_read]    "read",
[SYS_kill]    "kill",
[SYS_exec]    "exec",
[SYS_fstat]   "fstat",
[SYS_chdir]   "chdir",
[SYS_dup]     "dup",
[SYS_getpid]  "getpid",
[SYS_sbrk]    "sbrk",
[SYS_sleep]   "sleep",
[SYS_uptime]  "uptime",
[SYS_open]    "open",
[SYS_write]   "write",
[SYS_mknod]   "mknod",
[SYS_unlink]  "unlink",
[SYS_link]    "link",
[SYS_mkdir]   "mkdir",
[SYS_close]   "close",
[SYS_trace]   "trace",
};

void
syscall(void)
{
  int num;
  struct proc *p = myproc();

  num = p->trapframe->a7;
  if(num > 0 && num < NELEM(syscalls) && syscalls[num]) {
    p->trapframe->a0 = syscalls[num]();

    // check whether the system call match the tracing mask
    if ((1 << num) & p->mask){
      printf("%d: syscall %s -> %d\n", p->pid, syscalls_name[num], p->trapframe->a0);
    }
  } else {
    printf("%d %s: unknown sys call %d\n",
            p->pid, p->name, num);
    p->trapframe->a0 = -1;
  }
}
```



# 系统信息（moderate）    

在这个作业中，您将添加一个系统调用`sysinfo`，它收集有关正在运行的系统的信息。系统调用采用一个参数：一个指向`struct sysinfo`的指针（参见**kernel/sysinfo.h**）。内核应该填写这个结构的字段：`freemem`字段应该设置为空闲内存的字节数，`nproc`字段应该设置为`state`字段不为`UNUSED`的进程数。我们提供了一个测试程序`sysinfotest`；如果输出“**sysinfotest: OK**”则通过。

### 提示：

- 在**Makefile**的**UPROGS**中添加`$U/_sysinfotest`
- 当运行`make qemu`时，**user/sysinfotest.c**将会编译失败，遵循和上一个作业一样的步骤添加`sysinfo`系统调用。要在**user/user.h**中声明`sysinfo()`的原型，需要预先声明`struct sysinfo`的存在：

```c
struct sysinfo;
int sysinfo(struct sysinfo *);
```

一旦修复了编译问题，就运行`sysinfotest`；但由于您还没有在内核中实现系统调用，执行将失败。

- `sysinfo`需要将一个`struct sysinfo`复制回用户空间；请参阅`sys_fstat()`(**kernel/sysfile.c**)和`filestat()`(**kernel/file.c**)以获取如何使用`copyout()`执行此操作的示例。
- 要获取空闲内存量，请在**kernel/kalloc.c**中添加一个函数
- 要获取可用进程数，请在**kernel/proc.c**中添加一个函数

### 实现：

重复一下之前trace里面的配置：

添加$U/_sysinfotest，添加函数声明到user.h （记得根据提示声明struct sysinfo），添加entry到usys.pl，添加syscall number到syscall.h，然后加入到syscall函数数组中。这是我的提交：[sysinfo config](https://github.com/yzhe819/MIT-6.S081/commit/33d3d512d66a9292b9566fe024bdb6df72f1dbc2)

然后根据提示在**kernel/kalloc.c**中添加一个函数，用于获取空闲内存量。

直接历遍链表计数，最后乘一下内存页的大小就好，可以加个锁避免冲突。

```c
uint64
freemem(){
  struct run *r = kmem.freelist;
  uint64 num = 0;
  acquire(&kmem.lock);
  while(r){
    num++;
    r = r->next;
  }
  release(&kmem.lock);
  return num * PGSIZE;
}
```

然后在**kernel/proc.c**中添加一个函数，用于获取可用进程数。把所有状态是UNUSED的记一下就可以。

```c
uint64
nproc(void){
  uint64 n = 0;
  for(int i = 0; i < NPROC; i++){
    if(proc[i].state != UNUSED){
      n++;
    }
  }
  return n;
}
```

最后在**kernel/sysproc.c**里面调用：

```c
uint64
sys_sysinfo(void)
{
  struct sysinfo info;
  info.freemem = freemem();
  info.nproc = nproc();

  // get the virtual address
  uint64 addr;
  if(argaddr(0, &addr) < 0)
    return -1;

  if(copyout(myproc()->pagetable, addr, (char *)&info, sizeof info) < 0)
      return -1;

  return 0;
}
```

重点是前三行代码，直接调用我们的代码就好。后面的那部分是用于将一个`struct sysinfo`复制回用户空间，就是提示里面说到的copyout用法。

到此我们的lab 2已经结束了。

## 测试与修复：

在提交前我们跑一下测试吧，推迟qemu，然后运行：

```bash
$ ./grade-lab-syscall
/usr/bin/env: ‘python\r’: No such file or directory
```

好吧，我再修复一下，然后再次运行：

```bash
$ dos2unix ./grade-lab-syscall
$ ./grade-lab-syscall
```

结果依然报错：
![报错提示](/lab2_fail.png)

报错提示程序没有打印`3: syscall read -> 966`而是打印了`3: syscall read -> 986`

想了想后，恍然大悟，需要给readme也调整一下格式：

```bash
$ dos2unix ./readme
```

再次运行，终于全部通过了：
![通过](/lab2_pass.png)
