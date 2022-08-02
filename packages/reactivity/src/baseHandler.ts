import { track, trigger } from './effect'
import { isObject } from '@vue/shared'
import { reactive } from './reactive'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  // 通过Reflect可以监控到取值和赋值
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    track(target, 'get', key)

    // 实现深度代理，性能好，取值才进行代理
    let res = Reflect.get(target, key, receiver)
    if(isObject(res)){
      return reactive(res)
    }
    return res
  },
  set(target, key, value, receiver) {
    // 代理上设置值，执行set
    let oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver)
    if(oldValue !== value){
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}
