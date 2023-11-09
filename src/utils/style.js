import { $ } from '@/utils/utils'

export function getStyle(style, filter=[]) {
  const needUnit = [
    'fontSize',
    'width',
    'height',
    'top',
    'left',
    'borderWidth',
    'letterSpacing',
    'borderRadius',
  ]
  const result = {}
  Object.keys(style).forEach(key => {
    if (!filter.includes(key)) {
      if (key != 'rotate') {
        result[key] = style[key]

        if (needUnit.includes(key)) {
          result[key] += 'px'
        }
      } else {
        result.transform = key + '(' + style[key] + 'deg)'
      }
    }
  })
  return result
}

// 将组合中的各个子组件拆分出来，并计算它们新的 style
export function decomposeComponent(component, editorRect, parentStyle) {
  // 子组件相对于浏览器视口的样式
  const componentRect = $(`#component${component.id}`).getBoundingClientRect()
  // 获取元素的中心点坐标
  const center = {
    x: componentRect.left - editorRect.left + componentRect.width / 2,
    y: componentRect.top - editorRect.top + componentRect.height / 2,
  }

  component.style.rotate = (component.style.rotate + parentStyle.rotate + 360) % 360
  component.style.width = parseFloat(component.groupStyle.width) / 100 * parentStyle.width
  component.style.height = parseFloat(component.groupStyle.height) / 100 * parentStyle.height
  component.style.left = center.x - component.style.width / 2
  component.style.top = center.y - component.style.height / 2
  component.groupStyle = {}
}
