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

