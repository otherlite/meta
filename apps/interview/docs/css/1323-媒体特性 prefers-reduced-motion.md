# 题目名
媒体特性 `prefers-reduced-motion`

## 题目描述
如何尊重用户的“减少动态效果”偏好？在动效设计上如何做降级？

## 题目答案
- 使用 `@media (prefers-reduced-motion: reduce)` 降低或关闭动画。
- 用更短、更少的过渡替代复杂动画。
- 对可访问性敏感用户，这是重要的体验与合规点。

