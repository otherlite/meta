# 题目名
`Content-Type` 与表单提交类型

## 题目描述
`application/json`、`application/x-www-form-urlencoded`、`multipart/form-data` 有什么区别？什么时候用哪个？

## 题目答案
- JSON：接口请求常用，结构清晰。
- urlencoded：传统表单与简单键值。
- multipart：文件上传与混合字段。
- 注意：multipart 需要边界（boundary），浏览器会自动生成。

