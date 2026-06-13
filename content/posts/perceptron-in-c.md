---
title: "用C语言手搓感知机:神经网络的第一块积木"
date: 2026-06-13T22:22:57+12:00
draft: false
tags: ["C语言","机器学习","神经网络"]
keywords: ["感知机","Perceptron","神经网络","C语言","机器学习入门"]
slug: "perceptron-in-c"
---

>  手搓了一个感知机(神经网络最基本的单元)

或许这就是硅基生物长出脑子的第一步？

代码仓库：[Github](https://github.com/yzhe819/Perceptron)

<!--more-->

## 这是什么?

感知机(Perceptron)是神经网络最基础的组成单元,由 Frank Rosenblatt 在1957年提出。
它模拟了生物神经元的工作方式:接收多个输入信号,根据各自的"权重"进行加权求和,再通过一个判断规则输出结果。

## 权重矩阵的演化

下图展示了权重矩阵在训练过程中的演化过程(每一帧对应一轮训练后的权重图):

<p align="center">
  <img src="/output.gif" alt="Training Evolution" width="400" height="400">
</p>

权重图使用紫色到黄色的渐变表示:

- **紫色**:权重值较低/为负 → 该位置的像素会**抑制**输出(让模型更倾向于判断为"矩形")
- **黄色**:权重值较高/为正 → 该位置的像素会**增强**输出(让模型更倾向于判断为"圆形")

## 结构示意图

```
输入层                                 权重               求和与判断       输出
                                          
[0.5][0.5][0.5][0.6][0.7][0.5]  ─── W1  ~ W6  ──┐
[0.5][0.6][0.7][0.8][0.7][0.5]  ─── W7  ~ W12 ──┤
[0.5][0.7][0.9][0.9][0.8][0.5]  ─── W13 ~ W18 ──┤
[0.5][0.8][0.9][0.9][0.9][0.6]  ─── W19 ~ W24 ──┼──────>  ( ? ) ──────> 圆？
[0.5][0.7][0.8][0.9][0.7][0.5]  ─── W25 ~ W30 ──┤
[0.5][0.6][0.7][0.7][0.6][0.5]  ─── W31 ~ W36 ──┤
[0.5][0.5][0.6][0.6][0.5][0.5]  ─── W37 ~ W42 ──┘
```

## 判断公式

$$
\text{output} = \sum_{i=1}^{n} x_i \cdot w_i
$$

$$
\text{output} > \text{bias} \implies \text{类别 A (圆形)}
$$

$$
\text{output} \leq \text{bias} \implies \text{类别 B (矩形)}
$$

每个输入 $x_i$ 都对应一个权重 $w_i$,这个权重决定了"这个输入对最终结果有多大影响力"。

## 训练原理

每一轮训练:

- 如果**矩形**被误判为"圆形" → 把这个矩形的像素值,从权重矩阵里**减掉**
- 如果**圆形**被误判为"矩形" → 把这个圆形的像素值,**加到**权重矩阵里

每次"加圆减矩形",权重矩阵会逐渐被圆形的像素模式叠加、被矩形的像素模式抵消。多轮训练后,权重矩阵会自然演化出一个"圆形敏感"的模式。

## 训练结果

```
[TRAIN - 0] Adjusted 192 times
...
[TRAIN - 44] Adjusted 21 times
[TRAIN - 45] Adjusted 30 times
[TRAIN - 46] Adjusted 22 times
[TRAIN - 47] Adjusted 8 times
[TRAIN - 48] Adjusted 0 times
[TRAIN - 49] Adjusted 0 times

The untrained model failed 200 times
The fail rate of untrained model is 0.500000
The trained model failed 175 times
The fail rate of trained model is 0.437500
Improvement after training: 12.50%
```

训练后失败率有所下降,说明权重矩阵确实学到了一些"圆形"的特征。
每一轮训练打印的 `Adjusted` 次数,会发现这个数字逐渐收敛。
不过提升幅度有限(仅12.5%),这是因为感知机只有**一层权重**,只能学习一种非常简单的线性判断规则。

## 一句话总结

> 感知机就是一堆带权重的开关,权重通过"试错-修正"不断调整,最终让整个系统学会对输入做出正确的判断。多个感知机叠加、连接,就构成了真正的神经网络。

## 致谢

本项目的代码结构与实现思路参考自 [tsoding/perceptron](https://github.com/tsoding/perceptron),感谢原作者的开源分享。
