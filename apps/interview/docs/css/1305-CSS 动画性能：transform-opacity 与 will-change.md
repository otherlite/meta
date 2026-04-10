# 题目名
CSS 动画性能：`transform/opacity` 与 `will-change`

## 题目描述
为什么动画推荐用 `transform` 和 `opacity`？`will-change` 有什么作用与风险？如何判断动画是否触发了合成层？

## 题目答案
推荐用 `transform/opacity` 的原因：
- 它们更可能只触发合成（composite），不触发布局（layout）与绘制（paint），主线程压力更小。

`will-change`：
- 告诉浏览器某属性即将变化，浏览器可提前做优化（如创建合成层）。
- 风险：
  - 滥用会创建过多层，导致内存占用上升、合成成本变高，反而变慢。
- 建议：只对短时间内确实需要的元素使用，动画结束后移除。

如何判断：
- DevTools Layers/Rendering 面板查看是否提升为合成层。
- Performance 录制观察是否有频繁的 Layout/Paint；理想情况主要是 Composite。

