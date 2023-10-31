import { calculateRotatedPointCoordinate, getCenterPoint } from './translate'

const func = {
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
  const rotatedTopMiddlePosition = calculateRotatedPointCoordinate({
    x: clickPoint.x,
    y: rotatedCurPosition.y
  }, clickPoint, style.rotate)
  const newHeight = Math.sqrt((rotatedTopMiddlePosition.x - symmetricPoint.x) ** 2 + (rotatedTopMiddlePosition.y - symmetricPoint.y) ** 2)
  if (newHeight > 0) {
    const newCenter = {
      x: rotatedTopMiddlePosition.x - (rotatedTopMiddlePosition.x - symmetricPoint.x) / 2,
      y: rotatedTopMiddlePosition.y + (symmetricPoint.y - rotatedTopMiddlePosition.y) / 2
    }
    style.height = Math.round(newHeight)
    style.top = Math.round(newCenter.y - newHeight / 2)
    style.left = Math.round(newCenter.x - style.width / 2)
  }
}

function calculateRight(style, curPosition, pointInfo) {
  const { symmetricPoint, clickPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, clickPoint, -style.rotate)
  const rotatedRightMiddlePosition = calculateRotatedPointCoordinate({
    x: rotatedCurPosition.x,
    y: clickPoint.y
  }, clickPoint, style.rotate)
  const newWidth = Math.sqrt((rotatedRightMiddlePosition.x - symmetricPoint.x) ** 2 + (rotatedRightMiddlePosition.y - symmetricPoint.y) ** 2)
  if (newWidth > 0) {
    const newCenter = {
      x: symmetricPoint.x + (rotatedRightMiddlePosition.x - symmetricPoint.x) / 2,
      y: rotatedRightMiddlePosition.y - (rotatedRightMiddlePosition.y - symmetricPoint.y) / 2
    }
    style.width = Math.round(newWidth)
    style.top = Math.round(newCenter.y - style.height / 2)
    style.left = Math.round(newCenter.x - newWidth / 2)
  }
}

function calculateBottom(style, curPosition, pointInfo) {
  const { symmetricPoint, clickPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, clickPoint, -style.rotate)
  const rotatedBottomMiddlePosition = calculateRotatedPointCoordinate({
    x: clickPoint.x,
    y: rotatedCurPosition.y
  }, clickPoint, style.rotate)
  const newHeight = Math.sqrt((rotatedBottomMiddlePosition.x - symmetricPoint.x) ** 2 + (rotatedBottomMiddlePosition.y - symmetricPoint.y) ** 2)
  if (newHeight > 0) {
    const newCenter = {
      x: rotatedBottomMiddlePosition.x + (symmetricPoint.x - rotatedBottomMiddlePosition.x) / 2,
      y: rotatedBottomMiddlePosition.y - (rotatedBottomMiddlePosition.y - symmetricPoint.y) / 2
    }
    style.height = Math.round(newHeight)
    style.top = Math.round(newCenter.y - newHeight / 2)
    style.left = Math.round(newCenter.x - style.width / 2)
  }
}

function calculateLeft(style, curPosition, pointInfo) {
  const { symmetricPoint, clickPoint } = pointInfo
  const rotatedCurPosition = calculateRotatedPointCoordinate(curPosition, clickPoint, -style.rotate)
  const rotatedLeftMiddlePosition = calculateRotatedPointCoordinate({
    x: rotatedCurPosition.x,
    y: clickPoint.y
  }, clickPoint, style.rotate)
  const newWidth = Math.sqrt((rotatedLeftMiddlePosition.x - symmetricPoint.x) ** 2 + (rotatedLeftMiddlePosition.y - symmetricPoint.y) ** 2)
  if (newWidth > 0) {
    const newCenter = {
      x: rotatedLeftMiddlePosition.x + (symmetricPoint.x - rotatedLeftMiddlePosition.x) / 2,
      y: symmetricPoint.y - (symmetricPoint.y - rotatedLeftMiddlePosition.y) / 2
    }
    style.width = Math.round(newWidth)
    style.top = Math.round(newCenter.y - style.height / 2)
    style.left = Math.round(newCenter.x - newWidth / 2)
  }
}

export default function calculateComponentPositonAndSize(name, style, curPosition, pointInfo) {
  func[name](style, curPosition, pointInfo)
}
