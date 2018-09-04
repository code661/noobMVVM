id = 0
currentObserver = null

class Subject {
  constructor() {
    this.id = id++
    this.observers = []
  }
  addObserver(observer) {
    this.observers.push(observer)
  }
  removeObserver(observer) {
    let index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
  notify(newVal, oldVal) {
    this.observers.forEach((item) => {
      item.update(newVal, oldVal)
    })
  }
}

function observer(data) {
  if (!data && typeof data !== 'object') return
  for (let key in data) {
    let val = data[key]
    let subject = new Subject()
    Object.defineProperty(data, key, {
      configurable: true,
      enmerable: true,
      get: function () {
        if (currentObserver) {
          subject.addObserver(currentObserver)
        }
        return val
      },
      set: function (newVal) {
        console.log(`set ${key} => ${newVal}`)
        subject.notify(newVal, val)
        val = newVal
      }
    })
    if (typeof val === 'object') {
      observer(val)
    }
  }
}

class Observer {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb
    this.value = this.getValue()
  }
  update(newVal, oldVal) {
    this.cb.bind(this)(newVal, oldVal)
  }
  getValue() {
    currentObserver = this
    var value = this.vm._data[this.key]
    currentObserver = null
    return value
  }
}

class Compile {
  constructor(vm) {
    this.vm = vm
    this.node = vm.$el
    this.traverse(this.node)
  }
  traverse(node) {
    if (node.nodeType === 1) {
      this.compileNode(node)
      node.childNodes.forEach((childNode) => {
        this.traverse(childNode)
      })
    }
    else if (node.nodeType === 3) {
      this.compileText(node)
    }
  }
  compileText(node) {
    let reg = /{{(.+?)}}/g
    let match
    while (match = reg.exec(node.nodeValue)) {
      let raw = match[0]
      let key = match[1].trim()
      node.nodeValue = node.nodeValue.replace(raw, this.vm._data[key])
      new Observer(this.vm, key, function (newVal, oldVal) {
        node.nodeValue = node.nodeValue.replace(oldVal, newVal)
      })
    }
  }
  compileNode(node){
    let attrs = [...node.attributes]
    attrs.forEach((attr)=>{
      let name = attr.name
      let value = attr.value
      if(this.isDirective(name)){
        new Observer(this.vm, value, function(newVal, oldVal){
          node.value = newVal
        })
        node.oninput = (e)=>{
          this.vm._data[value] = e.target.value
        }
      }
    })
  }
  isDirective(name){
    return name === 'v-model' ? true : false
  }
}

class mvvm {
  constructor(option) {
    this.init(option)
    observer(this._data)
    new Compile(this)
  }
  init(option) {
    this.$el = document.querySelector(option.el)
    this._data = option.data
  }
}
