---
title: "MIT 6.S081 Lab 0 搭建环境"
date: 2022-06-07
draft: false
tags: ["中文","操作系统","6.S081"]
keywords: ["MIT 6.S081","操作系统","xv6","实验环境","WSL2","Ubuntu","RISC-V","QEMU"]
slug: "mit-6.S081-lab-0"
---

> 本篇文章主要记录MIT 6.S081实验环境的搭建和版本管理的配置。



官网链接：[Lab: Tools](https://pdos.csail.mit.edu/6.828/2020/tools.html)

本地环境为：Windows 10 + WSL2 (Ubuntu 20.04.4 LTS)

<!--more-->

## 环境搭建

### 官方搭建指导

[官方的搭建步骤](https://pdos.csail.mit.edu/6.828/2020/tools.html)

![官方的搭建步骤](/tools.png)



### 本地搭建记录

首先进入WSL2：

```bash
$ bash
```



然后检查 ubuntu 版本，确保 ubuntu 是在20或者以上。

```bash
$ lsb_release -a
```

**特别注意**：这里检查版本是因为只有 ubuntu 20.04 下面才有对应的某个package的镜像源，如果是版本18是无法查找到的。**如果有需要请自行更新WSL**



然后根据官方教程，把一系列依赖装上：

```bash
$ sudo apt-get install git build-essential gdb-multiarch qemu-system-misc gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu
```



接下来就是qemu-system-misc 修复，qemu-system-misc 包收到了一个更新，该更新破坏了它与内核的兼容性， 所以需要一个老版本。

先卸载新版本：

```bash
$ sudo apt-get remove qemu-system-misc
```

然后安装老的兼容版本：

```bash
$ sudo apt-get install qemu-system-misc=1:4.2-3ubuntu6
```

**特别注意**：这个**qemu-system-misc=1:4.2-3ubuntu6**就是前文提到 **ubuntu 18** 所找不到的包



这里需要补一个包，运行以下命令，会得到not found信息：

```bash
$ riscv64-unknown-elf-gcc --version
```

可以直接装。

```bash
$ sudo apt install gcc-riscv64-unknown-elf-gcc
```

再次测试，现在应该可以正确显示版本：

```bash
$ riscv64-unknown-elf-gcc --version
riscv64-unknown-elf-gcc (GCC) 10.1.0
```



检查环境是否搭建完成。

运行这两个版本检查，输出版本信息一样就完成了。

```
$ qemu-system-riscv64 --version
QEMU emulator version 5.1.0

$ riscv64-unknown-elf-gcc --version
riscv64-unknown-elf-gcc (GCC) 10.1.0
```



## 版本控制

我们需要将课程代码下载到本地以及使用github来进行开发管理:



首先在Github上新开一个空仓库。



然后将mit的实验代码克隆到本地：

```bash
$ git clone git://g.csail.mit.edu/xv6-labs-2020
```



进入对于文件夹以及切换分支：

```bash
$ cd xv6-labs-2020
$ git checkout util
```

**注**：MIT 6.S081 这门课程每个lab对应一个git分支，util分支是第一个lab的分支，这里用这个分支测试之前搭建



执行命令：

```bash
$ sudo make qemu
```

看到下列输出证明我们的配置生效了：

```
xv6 kernel is booting

hart 2 starting
hart 1 starting
init: starting sh
```

在这种情况下输入ls会得到以下输出：

```
$ ls
.              1 1 1024
..             1 1 1024
README         2 2 2104
xargstest.sh   2 3 99
cat            2 4 23864
echo           2 5 22688
forktest       2 6 13000
grep           2 7 27208
init           2 8 23776
kill           2 9 22664
ln             2 10 22608
ls             2 11 26104
mkdir          2 12 22760
rm             2 13 22744
sh             2 14 41736
stressfs       2 15 23760
usertests      2 16 147440
grind          2 17 37872
wc             2 18 24968
zombie         2 19 22136
console        3 20 0
```

**注**：偏题了，回归版本管理



添加git仓库的地址，这个仓库地址是第一步新建的仓库地址

~~就是平时使用git clone后的链接~~

```bash
$ git remote add github 你的仓库地址
```

**特别注意**：请勿随意修改.git目录和原origin指向的链接



接着我们可以把lab1的实验代码推送到github：

```bash
$ git push github util:util
```

**注**：命令中的github是远程主机名，表示会推到上一步推到的链接上

**注**：版本控制的部分[6.S081-All-In-One-Gitbook](http://xv6.dgs.zone/)提供了图文教程，可以进行参考



好了到这里，我们已经配置到基础的环境和做好了版本管理

接下来就能开始做lab实验了🎉

Happy coding 💖
