// 修改 DOM 节点上的属性的值
// 四类属性 类名class、样式style、普通属性attr、事件events
import { patchAttr } from './modules/attr'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/event'
import { patchStyle } from './modules/style'

export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    // key 是事件名称(Click) nextValue是函数
    patchEvent(el, key, nextValue)
  } else {
    // key 是属性名称 nextValue是属性值
    patchAttr(el, key, nextValue)
  }
}
