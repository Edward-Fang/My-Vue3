import { activeEffect, track } from './effect'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  // 通过Reflect可以监控到取值和赋值
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    track(target, 'get', key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
}
