// 如何去除数字、英文等等
'123456awd我也a啊我打完的wd1231awdawd123'.replace(/[\d|a-zA=Z]/g, '')

// 给一个字符串，筛选出所有的数字
'123456awd我也a啊我打完的wd1231awdawd123'.match(/\d+/g)

// 实现类似模版字符串的解析
function render(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, group) => context[group])
}
const template = '{{name}}很厉name害，才{{age}}岁'
const context = { name: 'jawil', age: '15' }
console.log(render(template, context))

// 下划线转驼峰
'ab_c_def'.replace(/_(\w)/g, (match, group) => group.toLocaleUpperCase())

// 排序
//blog.csdn.net/quhongqiang/article/details/80253238

// 前中后序遍历DFS
https: 用递归

// 广度遍历BFS
用队列

// 动态规划
