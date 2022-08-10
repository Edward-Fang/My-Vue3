import { isArray, isObject } from '@vue/shared'
import { createVnode, isVnode } from './vnode'

// render(h('h1', 'hello'), app)
// render(h('h1', null, h('span', null, 'hihi'), h('span', null, '999')), app)
// render(h('h1', h('span', null, 'hihi')), app)
// render(h('h1', null, 'hello', 'world'), app)
// render(
//   h('h1', { style: { color: 'red' } }, [h('span', null, 'hello'), h('span', null, 'world')]),
//   app
// )

// type  标签 propsChildren   放属性 children  放儿子
export function h(type, propsChildren, children) {
  let l = arguments.length
  // h('div',{style:{"color"：“red”}})
  // h('div',h('span'))
  // h('div',[h('span'),h('span')])
  // h('div','hello')
  if (l === 2) {
    // 将儿子包装成数组，元素可以循环创建。 文本不需要包装
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      // h('div',h('span'))
      if (isVnode(propsChildren)) {
        return createVnode(type, null, [propsChildren])
      }
      return createVnode(type, propsChildren) // 是属性 h('div',{style:{"color"：“red”}})
    }
    // 是数组  h('div',[h('span'),h('span')])
    // 文本也走这里 h('div','hello')
    else {
      return createVnode(type, null, propsChildren)
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) {
      // h('div,{},h('span'))
      children = [children]
    }
    return createVnode(type, propsChildren, children)
  }
}
