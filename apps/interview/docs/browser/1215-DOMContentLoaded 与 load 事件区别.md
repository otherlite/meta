# 题目名
`DOMContentLoaded` 与 `load` 事件区别

## 题目描述
两个事件分别在什么时机触发？它们与脚本加载（defer/async）有什么关系？

## 题目答案
- `DOMContentLoaded`：DOM 解析完成后触发（不等待图片等子资源），defer 脚本会在其前执行。
- `load`：页面所有资源（图片、样式、脚本等）加载完成后触发。
- async 脚本执行时机不确定，可能早于或晚于 DOMContentLoaded。

