import { isObject, isArray } from "@vue/shared"
import { trackEffects, triggerEffects } from "./effect"
import { reactive } from './reactive'

function toReactive(value){
  return isObject(value) ? reactive(value) : value
}

class RefImpl{
  public _value
  public dep = new Set()
  public __v_isRef = true
  // rawValue 未加工过的值
  constructor(public rawValue){
    this._value = toReactive(rawValue)
  }
  get value() {
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue) {
    if(newValue !== this.rawValue){
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffects(this.dep)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

class ObjectRefImpl {
  constructor(public object, public key) {}

  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

// 给每一个对象的属性都包装了value属性 类似于做代理
export function toRefs(object) {
  const result = isArray(object) ? new Array(object.length) : {}
  for (let key in object) {
    result[key] = toRef(object, key)
  }
  return result
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, receiver) {
      let oldValue = target[key]
      // 如果是 ref 就改写原来值的 .value 属性
      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}