---
group:
  title: 浏览器
  order: 6
---

# 浏览器

## 描述下 EventLoop？以及如下的打印结果？

https://segmentfault.com/a/1190000039819691

```js
setTimeout(function () {
  console.log('setTimeout1') //8
  new Promise(function (resolve) {
    console.log('promise0') //9
    resolve()
  }).then(function () {
    console.log('settimeout promise resolveed') //10
  })
})
setTimeout(function () {
  console.log('setTimeout2') //11
})
const P = new Promise(function (resolve) {
  console.log('promise') //1
  for (var i = 0; i < 10000; i++) {
    if (i === 10) {
      console.log('for') //2
    }
    if (i === 9999) {
      resolve('resolve')
    }
  }
})
  .then(function (val) {
    console.log('resolve1') //5
  })
  .then(function (val) {
    console.log('resolve2') //7
  })
new Promise(function (resolve) {
  console.log('promise2') //3
  resolve('resolve')
}).then(function (val) {
  console.log('resolve3') //6
})
console.log('console') //4
```

## cookie 有哪些属性？

https://juejin.cn/post/6934176892895363085

## cookie、session、localStorage、sessionStorage 有什么区别？

https://juejin.cn/post/6844903587764502536

## 实现一个函数，监听浏览器所有的事件（不可枚举）并上报该事件名称?

```js
// 遍历所有on开头事件
for(i in document){
    if(i.substring(0,2)=='on'){
        // 绑定事件，上报事件名称
    }
)
```

## 前端路由的实现？

https://juejin.cn/post/6844903589123457031

## requestAnimationFrame 的作用，并实现获取每秒的帧数？

https://blog.csdn.net/HuoYiHengYuan/article/details/108810343

## 跨页面通讯有哪些方式？

https://juejin.cn/post/6844903811232825357

## 如何防范 iframe 被钓鱼网站嵌套导致的安全问题？iframe 如何判断是否被嵌套？

https://www.cnblogs.com/-qing-/p/10871983.html

## 用户输入 url 到页面展示经历了哪些步骤？

https://zhuanlan.zhihu.com/p/32687584

- 网络阶段：构建请求行、查询强缓存、DNS 解析、建立 TCP 连接、发送 HTTP 请求、响应请求
- 解析阶段：解析 html、构建 dom 树、计算样式、生成布局树
- 渲染阶段：生成图层树、生成绘制列表、生成图块、优先选择视口附近的图块生成位图数据、展示内容

## 浏览器解析渲染过程

https://zhuanlan.zhihu.com/p/25876048

## 页面生命周期

https://zh.javascript.info/onload-ondomcontentloaded

## CSS 到底会不会阻塞页面渲染？

https://zhuanlan.zhihu.com/p/396491153

## 浏览器事件流机制？

https://juejin.cn/post/6844904097053687816

## async、defer 区别

https://segmentfault.com/q/1010000000640869

## serviceWorker 的使用原理是啥？

https://xie.infoq.cn/article/d6db2099c0064563a403c51ec

## Mutation Observer、Intersection Observer 使用场景？

https://juejin.cn/post/6999950594207121444

## 怎么获取粘贴事件？怎么判断是粘贴了图片？

https://www.zhangxinxu.com/wordpress/2018/09/ajax-upload-image-from-clipboard/

## 图片压缩？

https://segmentfault.com/a/1190000023486410

## DNS 预解析？

https://cloud.tencent.com/developer/article/1174791

## 一个盒子从中间开始，碰到最左边的边界往右移动，碰到最右边的边界往左移动，如此循环，问怎么做？

https://blog.csdn.net/GISShiXiSheng/article/details/43700031

## 事件代理是什么？写一个事件代理函数，需要判断 child 是 parent 的子节点？

https://segmentfault.com/a/1190000023563411

## 浏览器知识查缺补漏

https://juejin.cn/post/6854573215830933512

## Canvas 与 SVG 区别

https://juejin.cn/post/6995830761232269319
