export function deepClone(target) {
  if (typeof target == 'object') {
    const result = Array.isArray(target) ? [] : {}
    for (const key in result) {
      if (typeof target[key] == 'object') {
        result[key] = deepClone(target[key])
      } else {
        result[key] = target[key]
      }
    }
  }
  return target
}

export function swap(arr, i, j) {
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}
