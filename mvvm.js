id = 0
currentObserver = null

class Subject {
  constructor(){
    this.id = id++
    this.observers = []
  }
  addObserver(observer){
    this.observers.push(observer)
  }
  removeObserver(observer){
    let index = this.observers.indexOf(observer)
    if (index > -1){
      this.observers.splice(index, 1)
    }
  }
  notify(newVal, oldVal){
    this.observers.forEach((item)=>{
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
      get: function(){
        if (currentObserver){
          subject.addObserver(currentObserver)
        }
        return val
      },
      set: function(newVal){
        console.log(`set ${key} => ${newVal}`)
        subject.notify(newVal, val)
        val = newVal
      }
    })
    if (typeof val === 'object'){
      observer(val)
    }
  }
}

class Observer {
  constructor(vm, key, cb){
    this.vm = vm
    this.key = key
    this.cb = cb
    this.value = this.getValue()
  }
  update(newVal, oldVal){
    this.cb.bind(this)(newVal, oldVal)
  }
  getValue(){
    currentObserver = this
    var value = this.vm._data[this.key]
    currentObserver = null
    return value
  }
}

class mvvm{
  constructor(option){
    this.init(option)
    observer(this._data)
    this.compile(this.$el)
  }
  init(option){
    this.$el = document.querySelector(option.el)
    this._data = option.data
  }
  compile(node){
    if (node.nodeType === 1){
      node.childNodes.forEach((cnode)=>{
        this.compile(cnode)
      })
    }
    else if (node.nodeType === 3){
      this.renderText(node)
    }
  }
  renderText(node){
    let reg = /{{(.+?)}}/g
    let match
    while (match = reg.exec(node.nodeValue)){
      let raw = match[0]
      let key = match[1].trim()
      node.nodeValue = node.nodeValue.replace(raw, this._data[key])
      new Observer(this, key, function(newVal, oldVal){
        node.nodeValue = node.nodeValue.replace(oldVal, newVal)
      })
    }
  }
}
