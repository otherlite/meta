# 题目名
字体加载与 FOIT/FOUT

## 题目描述
字体加载为什么会影响首屏与 CLS？FOIT/FOUT 是什么？如何通过 `font-display` 优化体验？

## 题目答案
- FOIT：字体未就绪时文本不可见；FOUT：先用后备字体渲染再替换。
- `font-display: swap` 常用来避免长时间不可见。
- 关键字体可 `preload`，并选择合适的后备字体降低跳动。

