import { isObject, isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

function traversal(value, set = new Set()) {
  // 递归要有终结条件，不是对象结束
  // 遇到对象本身不在循环
  if (!isObject(value)) return value
  if (set.has(value)) return value
  set.add(value)
  for (let key in value) {
    traversal(value[key], set)
  }
  return value
}

// source -> 传入的数据 对象或者函数
export function watch(source, cb) {
  let getter
  if (isReactive(source)) {
    // 对用户传入的数据循环
    // 递归 循环会访问属性，访问会收集effect
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  }
  let cleanup
  const onCleanup = fn => {
    cleanup = fn
  }
  let oldValue
  const job = () => {
    if (cleanup) cleanup() // 下一次watch出发下一次的清理
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue // 保存老值
  }
  const effect = new ReactiveEffect(getter, job)
  oldValue = effect.run()
}
