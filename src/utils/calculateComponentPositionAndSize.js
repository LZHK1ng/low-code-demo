import { calculateRotatedPointCoordinate, getCenterPoint } from './translate'

const funcs = {
  lt: calculateLeftTop,
  t: calculateTop,
  rt: calculateRightTop,
  r: calculateRight,
  rb: calculateRightBottom,
  b: calculateBottom,
  lb: calculateLeftBottom,
  l: calculateLeft
}

function calculateLeftTop(style, curPosition, pointInfo) {
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

function calculateRightTop(style, curPosition, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  const newTopRightPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  const newBottomLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth)
    style.height = Math.round(newHeight)
    style.left = Math.round(newBottomLeftPoint.x)
    style.top = Math.round(newTopRightPoint.y)
  }
}

function calculateLeftBottom(style, curPosition, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  const newBottomLeftPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  const newTopRightPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newWidth = newTopRightPoint.x - newBottomLeftPoint.x
  const newHeight = newBottomLeftPoint.y - newTopRightPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth)
    style.height = Math.round(newHeight)
    style.left = Math.round(newBottomLeftPoint.x)
    style.top = Math.round(newTopRightPoint.y)
  }
}

function calculateRightBottom(style, curPosition, pointInfo) {
  const { symmetricPoint } = pointInfo
  const newCenterPoint = getCenterPoint(curPosition, symmetricPoint)
  const newBottomRightPoint = calculateRotatedPointCoordinate(curPosition, newCenterPoint, -style.rotate)
  const newTopLeftPoint = calculateRotatedPointCoordinate(symmetricPoint, newCenterPoint, -style.rotate)
  const newWidth = newBottomRightPoint.x - newTopLeftPoint.x
  const newHeight = newBottomRightPoint.y - newTopLeftPoint.y
  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth)
    style.height = Math.round(newHeight)
    style.left = Math.round(newTopLeftPoint.x)
    style.top = Math.round(newTopLeftPoint.y)
  }
}

function calculateTop(style, curPosition, pointInfo) {
  const { symmetricPoint, clickPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, clickPoint, -style.rotate)
}

function calculateRight(style, curPosition, pointInfo) {

}

function calculateBottom(style, curPosition, pointInfo) {

}

function calculateLeft(style, curPosition, pointInfo) {

}

export default function calculateComponentPositonAndSize(name, style, curPosition, pointInfo) {
  funcs[name](style, curPosition, pointInfo)
}
