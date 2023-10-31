/**
 * 求两点中点坐标
 * @param {*} p1
 * @param {*} p2
 */
export function getCenterPoint(p1, p2) {
  return {
    x: p1.x + ((p2.x - p1.x) / 2),
    y: p1.y + ((p2.y - p1.y) / 2)
  }
}

// 角度转弧度 Math.PI = 180度
export function angleToRadian(angle) {
  return angle * Math.PI / 180
}

/**
 * 计算根据圆心旋转后的点的坐标
 * @param   {Object}  point  旋转前的点坐标
 * @param   {Object}  center 旋转中心
 * @param   {Number}  rotate 旋转的角度
 * @return  {Object}         旋转后的坐标
 * https://www.zhihu.com/question/67425734/answer/252724399 旋转矩阵公式
 */
export function calculateRotatedPointCoordinate(point, center, rotate) {
  /**
   * 旋转公式：
   *  点a(x, y)
   *  旋转中心c(x, y)
   *  旋转后点n(x, y)
   *  旋转角度θ                tan ??
   * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
   * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
   */

  return {
    x: (point.x - center.x) * Math.cos(angleToRadian(rotate)) - (point.y - center.y) * Math.sin(angleToRadian(rotate)) + center.x,
    y: (point.x - center.x) * Math.sin(angleToRadian(rotate)) + (point.y - center.y) * Math.cos(angleToRadian(rotate)) + center.y,
  }
}

export function calculateLeftTop(style, curPosition, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  const newTopLeftPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  const newBottomRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth)
    style.height = Math.round(newHeight)
    style.left = Math.round(newTopLeftPoint.x)
    style.top = Math.round(newTopLeftPoint.y)
  }
}

// 计算旋转组件后看到的样式 -> 吸附功能
export function translateComponentStyle(style) {
  style = { ...style }
  if (style.rotate == 0) {
    style.right = style.left + style.width
    style.bottom = style.top + style.height
  } else {
    const newWidth = cos(style.rotate) * style.width + sin(style.rotate) * style.height
    style.left += (style.width - newWidth) / 2
    style.right = style.left + newWidth

    const newHeight = sin(style.rotate) * style.width + cos(style.rotate) * style.height
    style.top -= (newHeight - style.height) / 2
    style.bottom = style.top + newHeight

    style.height = newHeight
    style.width = newWidth
  }
  return style
}

function sin(rotate) {
  return Math.abs(Math.sin(angleToRadian(rotate)))
}

function cos(rotate) {
  return Math.abs(Math.cos(angleToRadian(rotate)))
}
