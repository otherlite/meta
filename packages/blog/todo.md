
MF化
- 多应用demo测试：新建项目todomvc-vue-webpack、todomvc-react-webpack、todomvc-angular-webpack 等等，并创建第三方依赖的 federation 集合、 workspace federation 集合，以及脚手架lite
- 多版本问题：第三方库版本升级，同时存在多个版本怎么办（可以配合功能开关实现）
- 嵌套问题：一个MF库加载另一个MF库，是否会有异步的chunk问题？
- ts类型问题：如何保证引入的workspace包类型正确？对编译和类型检查是否影响？
- 脚手架问题：如何统一快速的搭建MF应用？如何快速引入MF应用？需要哪些约束？是否需要配置文件来约束？
- 部署问题：remoteEntry如何保证正确更新（可以通过 html 插入版本号变量发布的方式，每次都加载不同的版本，或者两者兼顾，优先全局，降级 remote url）
- 构建速度：是否提升构建速度？
- 对SSR是否有影响？

待解决
- eslint 和 typescript 结合：没有读取 tsconfig 配置？子目录怎么办？编译呢？类型检查呢？jest-parser？babel?
- monorepo hardLink 下如何打包 docker？
- umi如何实现解析umirc.ts文件?
- react状态管理有哪些方案
    - recoil状态管理设计一个页面？
    - https://github.com/pmndrs/zustand
- react每次state变化是触发整个tree render，还是当前组件render，如何实现的？
- react如何实现concurrent任务切片（https://segmentfault.com/a/1190000022606323）
- react源码解析（https://xiaochen1024.com/courseware/60b1b2f6cf10a4003b634718/60b1b311cf10a4003b634719）
- react keepAlive该如何实现
- singleApp源码、qiankun源码、microApp源码、webComponent、shadowDom
- 每月OKR（比如手写一个简版的Vue、输出至少一篇分享）？
- nx、nextjs使用？
- touzhi？