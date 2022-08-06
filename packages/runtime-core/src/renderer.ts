import { invokeArrayFns, isNumber, isString, ShapeFlags } from '@vue/shared'
import { ReactiveEffect } from '@vue/reactivity'
import { Text, createVnode, isSameVnode, Fragment } from './vnode'

export function createRenderer(renderOptions) {
  let {
    // 增删改查
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      // const child = normalize(children, i)
      patch(null, children[i], container)
    }
  }

  const mountElement = (vnode, container) => {
    let { type, props, children, shapeFlag } = vnode
    // 创建元素
    let el = vnode.el = hostCreateElement(type)

    // 创建属性 如果有props就循环添加  props 包括 style class event attrs
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 创建孩子 文本或数组
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    // 把真实节点插入到容器中
    hostInsert(el, container)
  }

  const patch = (n1, n2, container) => {
    if(n1 === n2) return
    if(n1 == null){
      // 初次渲染
      // 后续组件的初次渲染 目前是元素的初始化渲染
      mountElement(n2, container)
    } else {
      // 更新流程
    }
  }

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载的逻辑
      // 判断一下容器中是否有虚拟节点
      if (container._vnode) {
        // unmount(container._vnode)
      }
    } else {
      // 第一次的时候 vnode 是 null
      // 第二次的时候就会从 容器上去取 vnode 进行走更新的逻辑
      patch(container._vnode || null, vnode, container)
    }
    // 在容器上保存一份 vnode
    container._vnode = vnode
  }
  return {
    render
  }
}
