import { isFunction } from '@vue/shared'
import { ReactiveEffect, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl {
  public effect
  public _dirty = true // 默认取值时要计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep = new Set()
  constructor(public getter, public setter) {
    // 将用户的effect放到effect中，firstName和lastName会被effect收集
    this.effect = new ReactiveEffect(getter, () => {
      // 之后依赖的属性发生变化调用此函数
      if (!this._dirty) this._dirty = true
      triggerEffects(this.dep)
    })
  }
  get value() {
    // 要做依赖收集，不然不能更新
    trackEffects(this.dep)
    if (this._dirty) {
      // 如果是脏的，就再执行原函数
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {
      console.log('no set')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}
