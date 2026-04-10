# 题目名
页面可见性（Page Visibility）的应用

## 题目描述
如何判断页面在前台/后台？为什么后台应降频或暂停某些任务？

## 题目答案
- 使用 `document.visibilityState` + `visibilitychange`。
- 后台页面可能被节流，定时器不准；应暂停动画、降频轮询、延后非关键上报。
- 对数据上报用 `pagehide`/`visibilitychange` 做收尾。

