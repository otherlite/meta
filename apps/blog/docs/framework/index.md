---
group:
  title: 框架
  order: 5
---

# 框架

## react 和 vue 的区别？

https://zhuanlan.zhihu.com/p/100228073

https://jishuin.proginn.com/p/763bfbd54ab9

## react 和 vue 的 diff 算法区别

https://juejin.cn/post/6878892606307172365

https://www.jianshu.com/p/398e63dc1969

## 为什么不要用 index 作为 key

https://juejin.cn/post/6844904113587634184

## vue

### vue3 和 vue2 的区别？

https://www.jianshu.com/p/ad38a1f27d0f

- 性能更好
- composition api
- proxy 替代 defineProperty

### vue 双向绑定原理？为什么数组不能直接更改下标更新？

https://juejin.cn/post/6844903702881386504

### 当数据发生变化时，vue 是怎么更新节点的

https://juejin.cn/post/6844903607913938951（virtualDom同层节点比较，同一层vnode采用头尾双指针两两比较）

### defineProperty 有什么缺点？vue3 为什么用 Proxy?

https://juejin.cn/post/6844903920775462926

### nextTick 实现原理

https://segmentfault.com/a/1190000011072805

### vue.mixin 缺点？

https://juejin.cn/post/6844903486283317256

### vue 中 this.$set 这个函数做了什么事？

https://juejin.cn/post/6844903901175496711

### Vue.use 这个函数在源码里面做了哪些事情，主要用来干嘛的

https://cloud.tencent.com/developer/article/1907714

### vue-router 实现原理？

https://cloud.tencent.com/developer/article/1854413

### vuex 原理？

https://juejin.cn/post/6844903949938475022

Vuex 的双向绑定通过调用 new Vue 实现，然后通过 Vue.mixin 注入到 Vue 组件的生命周期中，在所有组件的 beforeCreate 生命周期注入了设置 this.$store 这样一个对象，再通过劫持 state.get 将数据放入组件中

## react

### react 生命周期

https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/

### react 虚拟 Dom 的 diff 原理？

https://juejin.cn/post/6844904165026562056

https://www.zhihu.com/question/66851503/answer/246766239

### 简述 react fiber 的作用，以及实现原理？

https://juejin.cn/post/6844904202267787277

React Fiber 把更新过程碎片化，每执行完一段更新过程，就把控制权交还给 React 负责任务协调的模块，看看有没有其他紧急任务要做，如果没有就继续去更新，如果有紧急任务，那就去做紧急任务。

### 简述下 react 受控和非受控组件？

https://juejin.cn/post/6885572825072173070

### react 不可变值？

https://juejin.cn/post/6949184783473704974

### react 合成事件？事件冒泡和事件捕获的区别、react 中的冒泡和捕获呢

[探索 React 合成事件](https://segmentfault.com/a/1190000038251163)（react 中都是合成事件，无论冒泡和捕获，对应于原生事件都是冒泡）

### pureComponent 和 Component 的区别？

https://juejin.cn/post/6844904094021206024

### react 高阶组件的几种实现方式？

https://juejin.cn/post/6940422320427106335

### react hoc 搭配 hooks？

https://stackoverflow.com/questions/56288448/warning-when-using-react-hooks-in-hoc

### react class 和 hook 的区别，hook 存在的意义是什么？

https://juejin.cn/post/6844904179136200712

### react 调用 setState 之后发生了什么？setState 同步还是异步？setState 传递对象和函数有什么区别？如何选择？

https://juejin.cn/post/6959885030063603743

### react hooks 有哪些限制，为什么？实现原理？

https://juejin.cn/post/6891577820821061646

### react 怎么优化？

https://juejin.cn/post/6935584878071119885
https://juejin.cn/post/6869340244954513421
https://github.com/shaozj/blog/issues/36

避免 render 的两个很有趣的点

- 某个 useCallback A 依赖 value B，如果 B 变化，正常情况下依赖此 A 的组件会 render 两次（初始一次，变化一次），可以用 ref 对 A 做 AOP 处理，裹一层并且 apply 绑定 this，在执行时保证获取到最新的 value，也能避免 render 两次
- hooks 按需更新，同样 ref 保存 state，使用 state 时通过 defineProperties，get 时打个标记，触发 setState 时，如果没有更新打过标记的依赖，则不 forceUpdate

### react useLayoutEffect 和 useEffect 具体执行时机？

https://zhuanlan.zhihu.com/p/348701319

### react hook 实现用户鉴权？

https://15tar.com/%E6%8A%80%E6%9C%AF/2019/12/15/react-native-use-auth.html

### redux、mobx、recoil 区别？

在实现原理上，三者都比较巧妙，但又各种有不同。

在 Redux 中，实现了一个发布订阅，组件去监听 store 变化，一旦 store 变化，就会通知组件重新渲染。但是 Redux 不会根据组件使用的状态来定向通知，它会粗暴地通知所有 connect 过的组件。如果在不做浅比较的情况下，整体性能损耗严重。

在 Mobx 中，将状态变成可观察数据，通过数据劫持，拦截其 get 来做依赖收集，知道每个组件依赖哪个状态。在状态的 set 阶段，通知依赖的每个组件重新渲染，做到了精准更新。

在 Recoil 中，通过 useRecoilValue/useRecoilState 两个 Hook API，在组件第一次执行的时候，构建 Atom 和组件的依赖图，将组件 setState 存入到 Atom 的监听队列里面。一旦 Atom 更新，就从监听队列里面取出来执行，这样每个组件的 setState 就会触发组件的更新，同样做到了精准更新。
