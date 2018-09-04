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
    var value = this.vm.$data[this.key]
    currentObserver = null
    return value
  }
}

class Compile {
  constructor(vm) {
    this.vm = vm
    this.$methods = vm.method
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
      node.nodeValue = node.nodeValue.replace(raw, this.vm.$data[key])
      new Observer(this.vm, key, function (newVal, oldVal) {
        node.nodeValue = node.nodeValue.replace(oldVal, newVal)
      })
    }
  }
  compileNode(node) {
    let attrs = [...node.attributes]
    attrs.forEach((attr) => {
      if (this.isModelDirective(attr.name)) {
        this.bindModel(node, attr.value)
      } else if (this.isEventDirective(attr.name)) {
        this.bindEventHandler(node, attr)
      }
    })
  }
  isModelDirective(attr) {
    return attr === 'v-model'
  }
  bindModel(node, attr) {
    new Observer(this.vm, attr, function (newVal, oldVal) {
      node.value = newVal
    })
    node.oninput = (e) => {
      this.vm.$data[attr] = e.target.value
    }
  }
  bindEventHandler(node, attr) {
    let eventType = attr.name.substr(5)
    let methodName = attr.value
    node.addEventListener(eventType, this.vm[methodName])
  }
  isEventDirective(attr) {
    return attr.indexOf('v-on') > -1
  }
}

class mvvm {
  constructor(option) {
    this.init(option)
    observer(this.$data)
    new Compile(this)
  }
  init(option) {
    this.$el = document.querySelector(option.el)
    this.$data = option.data
    this.$methods = option.methods

    for (let key in this.$data) {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get: function () {
          return this.$data[key]
        },
        set: function (newVal) {
          this.$data[key] = newVal
        }
      })
    }

    for (let method in this.$methods) {
      this[method] = this.$methods[method].bind(this)
    }
  }
}
