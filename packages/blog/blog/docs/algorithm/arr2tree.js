// 例如将 input 转成output的形式
var arr = [
  {
    id: 1,
    val: '学校',
    parentId: null,
  },
  {
    id: 2,
    val: '班级1',
    parentId: 1,
  },
  {
    id: 3,
    val: '班级2',
    parentId: 1,
  },
  {
    id: 4,
    val: '学生1',
    parentId: 2,
  },
  {
    id: 5,
    val: '学生2',
    parentId: 2,
  },
  {
    id: 6,
    val: '学生3',
    parentId: 3,
  },
]

var tree = {
  id: 1,
  val: '学校',
  children: [
    {
      id: 2,
      val: '班级1',
      children: [
        {
          id: 4,
          val: '学生1',
          children: [],
        },
        {
          id: 5,
          val: '学生2',
          children: [],
        },
      ],
    },
    {
      id: 3,
      val: '班级2',
      children: [
        {
          id: 6,
          val: '学生3',
          children: [],
        },
      ],
    },
  ],
}

// 实现数组转树
var arrToTree = function (arr) {
  const map = new Map()

  arr.forEach((item) => {
    let node = map.get(item.id)
    let parentNode = map.get(item.parentId)

    if (!node) {
      node = {
        id: item.id,
        val: item.val,
        children: [],
      }
      map.set(item.id, node)
    } else {
      node.title = item.title
      node.id = item.id
    }

    if (!parentNode) {
      parentNode = {
        children: [node],
      }
      map.set(item.parentId, parentNode)
    } else {
      parentNode.children.push(node)
    }
  })

  return map.get(null).children
}

// 实现树转数组
var treeToArr = function (tree) {
  if (!tree) return 'tree不能为空'
  let stack = [tree]
  const result = []
  while (stack.length > 0) {
    const node = stack.shift()
    if (node.children && node.children.length > 0)
      stack = stack.concat(node.children)
    result.push({
      id: node.id,
      val: node.val,
    })
  }
  return result
}

console.log(treeToArr(tree))
console.log(arrToTree(arr))
