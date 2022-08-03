export let activeEffect

function cleanupEffect(effect) {
  const { deps } = effect // 装的是对应的effect
  // 多对多的关系，两边都要删除
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect) // 解除effect，重新依赖收集
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  public parent = null
  public deps = []
  public active = true // 默认effect是激活状态
  constructor(public fn, public scheduler) {
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
      // 这里在执行用户函数之前清空收集的内容 activeEffect.deps = [ name(Set), age(Set)]
      // 这里删除添加删除添加造成死循环，修改下面forEach之前的代码，运行Set后的effects
      cleanupEffect(this)
      return this.fn() // 当稍后调用取值操作的时候，就可以获得这个全局activeEffect
    } finally {
      activeEffect = this.parent
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this) // 停止effect收集
    }
  }
}

// fn会根据状态发生变化，重新执行 可以嵌套着写
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  _effect.run() // 默认先执行一次

  const runner = _effect.run.bind(_effect) // 绑定this执行
  runner.effect = _effect // 将effect挂载到runner函数上
  return runner // runner() runner.effect.stop()
}

// 多对多 一个effect对应多个属性，一个属性对应多个effect
const targetMap = new WeakMap()
export function track(target, type, key) {
  // 只有在effect中调用才添加
  if (!activeEffect) return
  let depsMap = targetMap.get(target) // 第一次没有
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key) // key -> name, age
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffects(dep)

  // 单向 指属性记录effect，反向记录，effect也记录他被哪些属性收集过，为了可以清理
  // 对象 某个属性 对应 多个effect
  // WeakMap = {对象：Map{name: Set}}
  // {对象：{name：[]}}
}
export function trackEffects(dep) {
  if (activeEffect) {
    let shouldTrack = !dep.has(activeEffect) // 这里去重
    if (shouldTrack) {
      dep.add(activeEffect)
      // 让effect记录对应的dep，稍后清理会用到
      // 存放的是属性对应的set  name: new Set()
      activeEffect.deps.push(dep)
    }
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 触发的值不在模板中
  let effects = depsMap.get(key)
  effects && triggerEffects(effects)
}
export function triggerEffects(effects) {
  effects = new Set(effects)
  effects.forEach(effect => {
    // 执行effect时又执行自己，需要屏蔽
    if (effect !== activeEffect) {
      // 如果传入了调用函数，就用调用函数
      effect.scheduler ? effect.scheduler() : effect.run()
    }
  })
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

// 1.先定义响应式对象 new Proxy
// 2.effect默认数据变化能更新，先将在执行的effect作为全局变量渲染，渲染，在get方法中进行依赖收集
// 3.WeakMap(对象:map(属性:set(effect)))
// 4.之后发生数据变化，会通过对象属性查找对应的effect集合，找到effect全部执行
