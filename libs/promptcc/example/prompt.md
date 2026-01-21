@searchParams

- query（字符串，默认空字符串）
- category（字符串，默认全部）

@state

- input（字符串，默认空字符串）
- date（日期，默认当前日期）

@memo

- isSubmitAllowed（input 和 date 都不为空）

@callback

- onInputChange（输入变化）
- onSubmit（点击提交）

@effect

- fetchUserInfo（获取用户信息）

@ui

- textField:
  - 绑定 input
- datePicker:
  - 绑定 date
- button
  - 显示 "提交"
  - 禁用: 当 isSubmitAllowed 为 false
  - 点击: onSubmit

@ui2

- button:
  - 显示 "提交"
  - 禁用: 当 isSubmitAllowed 为 false
  - 点击: onSubmit
