# 剖析 Vue.js 内部运行机制

## `Object.defineProperty()`

首页我们需要了解[`Object.defineProperty()` ](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)，Vue 就是基于它实现「响应式系统」的。

它的使用方法：
```js
/*
  obj: 目标对象
  prop: 需要操作的目标对象的属性名
  desciptor: 表述符
  
  return value 传入对象
*/
Object.defineProperty(obj, prop, descriptor)
```

这里的 `descriptor`是一个对象。我们来看看它的几个属性分别是用来干嘛。
* `enumerable`，属性是否可枚举，默认 false。
* `configurable`，属性是否可以被修改或者删除，默认 false。
* `get`，获取属性的方法。
* `set`，设置属性的方法。

## 数据劫持（观察）

在 init 的阶段会进行初始化，对数据进行「响应式化」。我们通过一段代码来模拟实现。
```js
function defineReative(obj, key, val){
  Object.defineProprety(obj, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter(){
      return val
    },
    set: function reactiveSetter(newVal){
      if (newVal === val) return
      cb(newVal)
    }
  })
}
```

```js
function observe(obj){
  if (typeof obj !== Object) return
  Object.keys(obj).forEach((key)=>{
    defineReative(obj, key, obj[key])
  })
}
```

## 发布订阅（观察者）模式

一个典型的观察者模式应用场景是用户在一个网站订阅主题

多个用户(观察者，Observer)都可以订阅某个主题(Subject)
当主题内容更新时订阅该主题的用户都能收到通知
以下是代码实现

Subject是构造函数，new Subject() 创建一个主题对象，该对象内部维护订阅当前主题的观察者数组。主题对象上有一些方法，如添加观察者(addObserver)、删除观察者(removeObserver)、通知观察者更新(notify)。 当notify 时实际上调用全部观察者 observer 自身的 update 方法。

Observer 是构造函数，new Observer() 创建一个观察者对象，该对象有一个 update 方法。

[写一个简单的发布订阅模式](https://github.com/code661/noobMVVM/commit/723f8177372804265ab0710a729138080d04bdb2?diff=unified)

# 先实现单向数据绑定
结合之前讲观察者模式和数据监听，思路：

1. 主题(subject)是什么？
2. 观察者(observer)是什么？
3. 观察者何时订阅主题？
4. 主题何时通知更新？

上面的例子中，主题应该是data的 name 属性，观察者是视图里的{{name}}，当一开始执行mvvm初始化(根据 el 解析模板发现{{name}})的时候订阅主题，当data.name发生改变的时候，通知观察者更新内容。 我们可以在一开始监控 data.name （Object.defineProperty(data, 'name', {...})），当用户修改 data.name 的时候调用主题的 subject.notify。

## 双向数据绑定
