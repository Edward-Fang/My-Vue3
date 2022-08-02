import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

// source -> 传入的数据 对象或者函数
export function watch(source, cb)
{
  let getter
  if(isReactive(source)){
    // 对用户传入的数据循环
    // 递归 循环会访问属性，访问会收集effect
    getter = () => source
  }
  const job = () => {
    cb()
  }
  const effect = new ReactiveEffect(getter, job)
  return effect.run()
}