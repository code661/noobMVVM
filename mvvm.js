data = {
  name: 'tan',
  age: 18,
  friends:{
    dad: 'yi',
    mom: 'rui'
  }
}

function observer(data) {
  if (!data && typeof data !== 'object') return
  for (let key in data) {
    let val = data[key]
    Object.defineProperty(data, key, {
      configurable: true,
      enmerable: true,
      get: function(){
        console.log(`get ${key}`)
        return val
      },
      set: function(newVal){
        console.log(`set ${key} => ${newVal}`)
        val = newVal
      }
    })
    if (typeof val === 'object'){
      observer(val)
    }
  }
}

observer(data)

class Observer {
  constructor(name){
    this.name = name
  }
  update(){
    console.log(`${this.name} update ...`)
  }
}

class Subject {
  constructor(){
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
  notify(){
    this.observers.forEach((item)=>{
      item.update()
    })
  }
}

