# 题目名
Vue `keep-alive` 的缓存机制

## 题目描述
`keep-alive` 解决什么问题？它如何缓存组件实例？`include/exclude/max` 各自的作用是什么？缓存组件的生命周期钩子有哪些变化？

## 题目答案
`keep-alive` 用于缓存动态组件/路由组件的实例，避免频繁销毁重建，从而保留组件状态并提升切换性能。

缓存机制（概念）：
- 首次渲染创建组件实例并缓存。
- 再次命中时复用缓存的实例，而不是重新创建。

参数：
- `include`：仅缓存匹配名称的组件。
- `exclude`：排除匹配名称的组件。
- `max`：最大缓存实例数，超出时按策略淘汰（常见是 LRU 思路）。

生命周期变化：
- 被缓存的组件不会触发 `beforeUnmount/unmounted`（Vue3）或 `beforeDestroy/destroyed`（Vue2）。
- 切换时会触发 `activated/deactivated`，用于处理订阅/定时器等资源管理。

