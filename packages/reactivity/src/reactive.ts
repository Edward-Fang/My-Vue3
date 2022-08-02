import { isObject } from '@vue/shared'
import { mutableHandlers, ReactiveFlags } from './baseHandler'

// 将对象转化为响应式的，只能做对象的代理
// 如果传入相同的对象，会重复代理
const reactiveMap = new WeakMap() // WeakMap key只能是对象 不会导致内存泄漏 弱引用

export function isReactive(value){
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

// 1.实现同一个对象被多次代理，返回同一个对象
// 2.代理对象被代理，直接返回
export function reactive(target) {
  if (!isObject(target)) {
    return
  }

  // 代理一个对象 没有get方法不会调用，往下创建Proxy，添加get方法
  // 代理一个代理对象 if判断访问属性会调用get，直接返回true，因为只有代理对象会有get
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  let existingProxy = reactiveMap.get(target)
  if (existingProxy) return existingProxy

  // 第一次普通对象代理，会通过new Proxy代理一次
  // 第二次传递Proxy对象，先判断是否代理过(有无get方法)

  // 并没有重新定义，只是代理
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

// let target = {
//   name: 'hhh',
//   get getName() {
//     return this.name
//   }
// }
// const proxy = new Proxy(target, {
//   get(target, key, receiver) {
//     console.log(key, receiver) // receiver就是proxy 作用是改变调用时this指向
//     // return target[key] // 只能取到getName取不到name 而且报错 要用Reflect
//     return Reflect.get(target, key, receiver)
//   }
//   // set(target, key, value, receiver) {
//   //   return Reflect.set(target, key, value, receiver)
//   // }
// })
// proxy.getName // 在页面上使用了getName对应的name，稍后name变化了，要重新渲染
