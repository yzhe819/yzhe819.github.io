---
title: "Installing Go in WSL2"
date: 2022-06-17T14:49:41+12:00
hidden: false
tags: ["English","Go"]
keywords: ["Go"]
---

> Just a record of installing Go in WSL from the command line.

<!--more-->

### Configure WSL 2

Download and install a WSL distribution (for instance, Ubuntu) from [Microsoft Store](https://jb.gg/clion-wsl).

To work with WSL 2, your Windows version should be 10 build 18917 or later. Follow [these instructions](https://docs.microsoft.com/windows/wsl/wsl2-install#set-a-distro-to-be-backed-by-wsl-2-using-the-command-line) to switch the distributive.



### Run Ubuntu

Just enter the wsl from windows 10.

```bash
$ bash
```



### Download and Extract

Then download the tarball.

```bash
$ wget https://golang.org/dl/go1.17.1.linux-amd64.tar.gz
```

Extract the archive to **/usr/local**. 

```bash
$ sudo tar -C /usr/local -xzf go1.17.1.linux-amd64.tar.gz
```



### Config

Configure the path of go.

```bash
$ vim ~/.bashrc
```

Then, add the following to the end of **~/.bashrc** file to configure `GOPATH` and `GOROOT`.

```c
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

Here is my example:

![example](/go.png)



### Check

Restart the wsl, then use the following command line to check the version.

```bash
$ go -version
go version go1.17.1 linux/amd64
```



The installation is complete.



### Reference

Link: [How to use wsl development environment in product](https://www.jetbrains.com/help/go/how-to-use-wsl-development-environment-in-product.html)

Happy coding.
