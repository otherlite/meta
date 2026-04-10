# 题目名
`position: sticky` 的原理与踩坑

## 题目描述
`position: sticky` 是如何工作的？它和 `fixed` 有什么区别？为什么有时 sticky 不生效？

## 题目答案
原理：
- sticky 结合了相对定位与固定定位：在未到阈值前表现为 relative，滚动到阈值后在其滚动容器内“吸顶/吸附”。

与 fixed 区别：
- fixed 相对视口固定；sticky 相对最近的可滚动祖先容器生效，且受容器边界限制。

不生效常见原因：
- 未设置阈值属性（如 `top`）。
- 祖先元素有 `overflow: hidden/auto/scroll` 导致滚动容器变化或裁剪。
- 父容器高度不足，无法产生 sticky 区间。
- 某些布局/transform 场景下浏览器实现有差异。

