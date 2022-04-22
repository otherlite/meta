- 用 NX 新建工程对比，吸取精华

关键优化点

- 从 lerna 转到 pnpm，代码照常拆包，import 使用
- 每个包支持 MF 化，约定 expose 文件下的导出一个 remoteEntry，自身也导出一个 entry，发布到 cdn
- 保证以上的基础，才能够支持 typescript 类型的获取
- 编译前收集依赖，并且转换成 remote cdn 加载（包括 workspace 依赖、第三方依赖），达到仅编译自身业务（比如 react => react_18/remoteEntry => https://unpkg.com/react/18/index.js）
  - 需要建立一个公共的 registry
  - registry 上的每个包都克隆一个 remoteEntry，对自身做一个 mf remote 导出（此处看是否可能加载的时候直接包一层 remote 处理，https://webpack.docschina.org/concepts/module-federation/#promisebaseddynamicremotes）
  - expose 文件夹约定仅针对本地业务模块
- 本地调试两种方式
  - 本地分别启动 server 和模块，手动切换 server 模块 remote 指向，从 cdn 到 local，访问 localhost 域名开发
  - 本地启动模块，使用 whistle 代理，访问线上域名开发
- 分支工作流采用主干开发+功能开关

以上有没有可能做一个 MF 的 webpack 插件，替代 external、dll 的使用

下午对 bignumber.js 做个支持

- pom 模块能够加载 bignumber 远程 cdn，对比性能有没有提高
- 以上成功后，对 pmc 也做支持，发布后测试加载有没有冲突，是否为同一份

所有 dependency 都采用 workspace 协议？
多版本怎么办？

- 业务模块采用功能开关向前兼容，业务侧不用任何修改
- 第三方库新加一个包区分，逐步切换，也可以和上面一样，通过开关控制，视具体业务场景（如果版本升级后类型没法向前兼容，就必须新加一个包了）

mf 化

- ast 分析用到哪些依赖（还可以分析未被使用的文件，提示删除）
- 判断是 workspace 协议的，读取 mf 配置（或者按照包名约定），判断是 npm 协议的，读取统一的第三方包 MF 配置（需要将第三方包统一在一个 mf 应用中）

remoteEntry 也可以通过 html 插入版本号变量发布的方式，每次都加载不同的版本（或者两者兼顾，优先全局，降级 remote url）

mf 对 tree-shaking 有没有影响？

https://learngitbranching.js.org/?locale=zh_CN

- 所有人在 master 主干开发
- 每周做次版本升级，基于 master 创建发布分支，比如上周是 1.0.0，这周就是 1.1.0
- 周一至周五，如果有 bug 或紧急需求，开发依旧合入 master，通过开关方式来体验 or 测试，发布时 cherry-pick 到发布分支上，并且升级补丁版本号(1.1.1)

- todomvc 测试 mf，拷贝 todomvc-vue-webpack、todomvc-react-webpack、todomvc-angular-webpack 等等，并创建第三方依赖的 federation 集合，以及 workspace federation 集合
