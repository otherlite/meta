---
order: 4
group:
  title: ECMASCRIPT
  order: 2
---

# this 指向

## 为什么要有 this

JavaScript 允许在函数体内部，引用当前执行上下文的其他变量。

```js
function func() {
  console.log(a)
}
```

如上代码，函数 func 引用了当前执行上下文的变量 a，问题是这个函数 func 可以在任意其他执行上下文中被调用，因此这个 a 可能就指向不同了。正因为如此，JS 引擎需要有一个机制，可以依靠其

<Alert type="info">
    <strong>优雅地、准确地指向当前代码运行时所处的上下文环境</strong>（context）。
</Alert>

因此便催生了“this”。

### 何谓”优雅地“？

```js
//假设有个对象名字很长，而且有可能会改名
var iAmALongLongLongNameObject = {
  name: 'coffe',
  func1() {
    return iAmALongLongLongNameObject.name
  },
  func2() {
    return this.name
  },
}
```

`iAmALongLongLongNameObject`的方法`func2`使用了`this`关键字，是不是优雅多了？然后即使以后对象名字变化，`func2`内部的代码也不用改变。`func1`这种确实也可以实现与`func2`同样的功能，但是就显得丑陋、不灵活了。

### 何谓“准确地”？

`this`可以准确地指向（某个对象）而不会产生歧义。

```js
//全局变量
var iAmALongLongLongNameObject = {
  name: '1891',
}

;(function () {
  //局部变量
  var iAmALongLongLongNameObject = {
    name: 'coffe',
    func1() {
      //如果光看代码，是不是容易看成调用了全局变量的name？
      return iAmALongLongLongNameObject.name
    },
    func2() {
      //这里光看代码就很准确地知道是调用了局部变量的name！
      return this.name
    },
  }

  console.log(iAmALongLongLongNameObject.func1()) //>> coffe
})()
```

与“Java 等高级语言的`this`会指向对象的实例本身”不同，JavaScript 的`this`指向函数的**调用位置**的对象，**也即调用该函数的对象**。你需要知道，JavaScript 中所有的函数都有属性，就如对象有属性一样。函数执行阶段（也即执行上下文的执行阶段）会获取`this`属性的值，此时`this`就是一个变量，**储存着调用该函数的对象的值**。

```js
var a = 'coffe'
function func() {
  console.log(this.a)
}
func() //>> coffe
```

上面代码中，`func`的调用者未通过点操作符.指明，那它的调用者就是默认的全局对象`window`，`func`函数作为`window`的一个方法，其体内的`this.a`就是明确指代`window`中属性`a`，这种指向是准确而清晰的，不会有歧义。`this`的这种灵活性在设计 API 的时候，会变得很方便和容易被复用。

## 调用位置

调用位置就是函数在代码中被调用的位置，而不是声明的位置。研究调用位置，也即搞清“由谁在哪调用了这个函数”的问题。搞清楚了调用位置，才能准确地找到 this 的指向。

要找到调用位置，最重要的是要分析是**被谁、在哪**调用。

```js
var module = {
  x: '1891',
  getX: function () {
    return this.x
  },
}

console.log(module.getX()) //>> 1891
var getX = module.getX //注意：getX和module.getX都是指向内存中函数的地址而已，它们并没有被“()”以便执行
//这里实际上是【间接引用】的模式，见文尾【壹.2.3.6】解释
console.log(getX()) //>> undefined
```

如上代码，要找到函数`getX`的调用位置，需要先看哪儿调用了它，很明显，有函数有两处位置调用了函数`getX()`，接下来分析是谁调用了它

- 作为`module`对象的`getX`方法被调用。 这种情况被谁调用？很明显是被对象`module`调用，`this`是指向`module`。`module`对象里面有一个属性`x`，它的值是`1891`，因此`console.log(module.getX())`输出`1891`。

- 作为全局函数`getX`被调用。 这种情况是被谁调用？我们都知道全局函数可以看作为`window`对象的方法，那么，很明显现在`getX`是被当做全局对象`window`的一个方法被调用。

我们搞清楚了调用位置之后，接下来就会着手判断 this 的指向。

## 先看看很多人对 this 指向的一些误解

this 既不指向函数自身也不指向函数的作用域，这之前是很多前端工程师容易误解的地方，现在澄清一下。

1. `this`的指向，**是在函数被调用的时候确定的**，也就是执行上下文被创建时确定的；
2. `this` 的指向和函数声明的位置没有任何关系，只取决于函数的调用位置（也即由谁、在什么地方调用这个函数）；
3. 正因为在执行上下文的创建阶段`this`的指向就已经被确定了，在执行阶段 this 指向不可再被更改。

```js
var obj = {
    a: "1891"
}

function func() {
    this = obj; //报错，因为在执行阶段试图修改this的指向
    console.log(this.a);
}

func();
```

## this 的指向规则

### 1. 默认指向

独立函数调用（无法应用后面其他指向规则时），`this`指向全局对象`window`。

```js
function func() {
  console.log(this.a) // this指向全局对象
}
var a = 2
func() //>> 2
```

对于**默认指向**来说，决定`this`指向对象的并不是**调用位置**是否处于严格模式，而是函数体是否处于严格模式。如果函数体处于严格模式，`this`会指向`undefined`，否则`this`会指向全局对象。

```js
function func() {
  'use strict' //函数体处于严格模式下，this指向undefined
  console.log(this.a)
}

var a = '1891'
;(function () {
  func() //>> 报错
})()
```

```js
function func() {
  console.log(this.a)
}

var a = '1891'
;(function () {
  'use strict'
  func() //>> 1891
  //这里输出 1891 而不是报错，是因为严格模式下，this的指向与func的调用位置无关
})()
```

还有一种默认指向，就是在`setTimeout`或`setInterval`结合使用时。代码示例如下。

```js
var num = 0
class Obj {
  constructor(num) {
    this.num = num
  }
  func() {
    console.log(this.num)
  }
  func1() {
    setTimeout(function () {
      console.log('setTimeout:' + this.num)
    }, 1000)
  }
  func2() {
    setInterval(function () {
      console.log(this.num)
    }, 2000)
  }
}
var obj = new Obj(1)
obj.func() //>> 1　             输出的是obj.num
obj.func1() //>> setTimeout:0　  输出的是window.num
obj.func2() //>> 0 0 0 0 ……　    输出的是window.num
```

可以发现在 s`etInterval`和`setTimeout`中传入函数时，函数中的`this`会指向`window`对象。

### 2. 隐式指向

隐式指向是日常开发中最常见的指向。

函数体内`this`的指向由调用位置的调用者决定。**如果调用者调用的函数，为某以个对象的方法，那么该函数在被调用时，其内部的`this`指向该对象**。

```js
function func() {
  console.log(this.a)
}
var obj = {
  a: 2,
  func: func,
}
obj.func() //>> 2
// 找到调用位置，由 obj 对象来调用函数func，
// 此时可以说函数func被调用时，obj 对象“拥有”或者“包含”func函数，
// 所以此时的 this 指向调用 func 函数的 obj 对象。
```

**对象属性引用链中只有最顶层或者说最后一层会影响调用位置**，也就是说`this`指向最终调用函数的对象。这句话可能说得比较拗口，其实简单通俗地说，`this`指向最靠近被调用函数的对象，离得远的不是。举例来说：

```js
function func() {
  console.log(this.a)
}

var obj2 = {
  a: '1891',
  func: func,
}

var obj1 = {
  a: 'coffe',
  obj2: obj2,
}

//此时的 this 指向 obj2 对象，因为obj2离得近！
obj1.obj2.func() //>> 1891
```

再来看看**隐式丢失**：

```js
function func() {
  console.log(this.a)
}

var obj = {
  a: 'coffe1891',
  func: func,
}

var bar = obj.func // 间接引用,见本文【壹.2.3.6】。此时bar和obj.func其实
// 都指向内存中的函数func本身。
var a = 'oops, global' // a 是全局对象window的属性，也是全局变量
bar() //>> oops, global

// 虽然 bar 是 obj.func 的一个引用，但是实际上，它引用的是func函数本身，
// 因此此时的 bar() 其实是一个不带任何定语的独立函数调用，应用【默认指向】规则,
// 因此函数体内的this指向window，this.a指向window的属性a（全局变量a）
```

### 3. 显式指向

JavaScript 内置对象`Function`的三个原型方法`call()`、`apply()`和`bind()`，它们的第一个参数是一个对象，它们会把这个对象绑定到`this`，接着在调用函数时让`this`指向这个对象。

```js
var a = 'makai'

function func() {
  console.log(this.a)
}
var obj = {
  a: 'coffe1891',
}

func.call(obj) //>> coffe1891
// 在调用 func 时强制把它的 this 绑定到 obj 上
```

另外，使用`bind`可以修正`setTimeout`和`setInterval`的`this`指向。

```js
var num = 0
class Obj {
  constructor(num) {
    this.num = num
  }
  func() {
    console.log(this.num)
  }
  func1() {
    setTimeout(
      function () {
        console.log('setTimeout:' + this.num)
      }.bind(this),
      1000,
    ) //bind
  }
  func2() {
    setInterval(
      function () {
        console.log(this.num)
      }.bind(this),
      2000,
    ) //bind
  }
}
var obj = new Obj(1)
obj.func() //>> 1　             输出的是obj.num
obj.func1() //>> setTimeout:1　  输出的是obj.num
obj.func2() //>> 1 1 1 1 ……　    输出的是obj.num
```

### 4. “new”操作符指向

在 JavaScript 中，**构造函数**只是一些**使用`new`操作符时被调用的函数**。它们并不会属于某个类，也不会实例化一个类。实际上，它们甚至都不能算是一种特殊的类型（class），它们**只是被 new 操作符调用的普通函数而已**。

使用 new 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作：

1. 创建（或者说构造）一个全新的对象；
2. 将构造函数的作用域赋给新对象（因此`this`就指向了这个新对象）；
3. 执行构造函数中的代码（为这个新对象添加属性、方法等）；
4. 如果函数没有返回其他对象，那么返回这个新对象。

```js
function func(a) {
  this.a = a
}
var bar = new func('coffe1891')
console.log(bar.a) //>> coffe1891
// 使用new 来调用func(..)时，我们会构造一个新对象并把它绑定到func(..)调用中的this上
```

## 如何利用规则判断 this 的指向

this 的指向判断，可以按照下面的优先级顺序来判断函数在某个调用位置应用的是哪条规则

### 1. 函数是否在 new 中被调用（new 操作符指向）？

如果是的话，**`this`绑定的是新创建的对象**。

```js
function func(name) {
  this.name = name
  this.getName = function () {
    return this.name
  }
}

var obj = new func('coffe') //this会指向obj
console.log(obj.getName()) //>> coffe
```

### 2. 函数是否通过 call、apply、bind 显式指向？

如果是的话，**`this`指向的是 call、apply、bind 三个方法的第一个参数指定的对象**。

```js
var obj1 = {
  name: 'coffe',
}
function func() {
  return this.name //这里的this本来指向window
}
var str = func.call(obj1) //改变了func函数里面this的指向，指向obj1
console.log(str) //>> coffe
```

### 3. 函数是否被当做某个对象的方法而调用（隐式指向）？

如果是的话，`this`指向的是这个对象。

```js
var obj1 = {
  name: 'coffe',
  func() {
    return this.name //指向obj1
  },
}

//这里的obj1.func()，表明func函数被obj1调用，因此func中的this指向obj1
console.log(obj1.func()) //>> coffe
```

### 4. 若以上都不是的话，使用默认绑定。

如果在严格模式下，就绑定到`undefined`，否则绑定到**全局对象**。

```js
var a = 'coffe' //为全局对象window添加一个属性a
function func() {
  'use strict' //开启严格模式
  return this.a
}

//严格模式下，this指向undefined
console.log(func()) //>> TypeError
```

## 几个例外情况

### 1. 被忽略的 this

`null`或者`undefined`作为`this`指向的对象传入`call`、`apply`或者`bind`，这些值在调用时会被忽略，实际应用的是**默认指向规则**。

```js
function func() {
  console.log(this.a)
}

var a = 2
func.call(null) //>> 2
//this指向了window
```

### 2. 隐式指向之隐式丢失

**隐式丢失最容易在赋值时发生**；隐式丢失发生时，调用这个函数会应用**默认指向规则**。下面再举一段更具迷惑性的例子：

```js
function func() {
  console.log(this.a)
}
var a = 2
var o = { a: 3, func: func }
var p = { a: 4 }
o.func() //>> 3
;(p.func = o.func)() //>> 2
// 赋值表达式 p.func=o.func 的返回值是目标函数的引用，也就是 func 函数的引用
// 因此调用位置是 func() 而不是 p.func() 或者 o.func()
```

### 3. 箭头函数

箭头函数并不是使用`function`关键字定义的，而是使用被称为“胖箭头”的操作符`=>`定义的。

箭头函数不遵守`this`的四种指向规则，而是**根据函数定义时的作用域来决定 `this` 的指向**。何谓“定义时的作用域”？就是你定义这个箭头函数的时候，该箭头函数在哪个函数里，那么箭头函数体内的`this`就是它父函数的`this`。

看下面代码加深理解：

```js
function func() {
  // 返回一个箭头函数
  return (a) => {
    //this 继承自 func()
    console.log(this.a)
  }
}
var obj1 = {
  a: 2,
}
var obj2 = {
  a: 3,
}

var bar = func.call(obj1)
bar.call(obj2) //>> 2         不是 3 ！

// func() 内部创建的箭头函数会捕获调用时 func() 的 this。
// 由于 func() 的 this 绑定到 obj1， bar（引用箭头函数）的 this 也会绑定到 obj1，
// this一旦被确定，就不可更改，所以箭头函数的绑定无法被修改。（new 也不行！）
```

这个特性甚至被 mozilla 的 MDN 称作“[没有 this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)”，这种说法很费解。其实应该这么理解：一般而言，this 的指向是在函数运行之后才确定的，而箭头函数的 this 指向在定义时也即调用之前就定死了，在运行之后无法更改，那相当于当成一个固定值的变量，此时 this 失去了原来作为“指向当前代码运行时所处的上下文环境（context）”的意义，所以 MDN 说箭头函数没有了 this，我觉得翻译成“把 this 阉割了”更贴切 🤣 。
