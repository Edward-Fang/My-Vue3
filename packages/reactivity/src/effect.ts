export let activeEffect
class ReactiveEffect {
  public parent = null
  public active = true // 默认effect是激活状态
  constructor(public fn) {
    // 在this上添加用户传递的参数 相当于this.fn = fn
  }
  run() {
    // 执行effect
    if (!this.active) {
      // 表示非激活状态，只需要执行函数，不用收集依赖
      this.fn()
    }
    // 收集依赖 核心是将当前的effect和之后渲染的属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this
      return this.fn() // 当稍后调用取值操作的时候，就可以获得这个全局activeEffect
    } catch (e) {
      activeEffect = this.parent
    }
  }
}

// fn会根据状态发生变化，重新执行 可以嵌套着写
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run() // 默认先执行一次
}

const targetMap = new WeakMap()
export function track(target, type, key) {
  // 对象 某个属性 对应 多个effect
  // WeakMap = {对象：Map{name: Set}}
  // {对象：{name：[]}}
  debugger
  // 只有在effect中调用才添加
  if (!activeEffect) return
  let depsMap = targetMap.get(target) // 第一次没有
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect) // 这里去重
  shouldTrack && dep.add(activeEffect)
}

// 原先用栈来解决 先进后出
// [e1, e2]
// effect(() => { // e1
//   state.name // name -> e1
//   effect(() => { // e2
//     state.age // age -> e2
//   })
//   state.address // activeEffect -> e1
// })

// 之后利用树形结构 父节点
// effect(() => { // parent = null activeEffect = e1
//   state.name // name -> e1
//   effect(() => { // parent = e1 activeEffect = e2
//     state.age // age -> e2
//   })
//   state.address // activeEffect -> this.parent
//   effect(() => { // parent = e1 activeEffect = e3
//     state.age // age -> e3
//   })
// })
