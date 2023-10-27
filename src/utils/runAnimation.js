/**
 * 运行动画
 * @param {组件对应的DOM元素} $el
 * @param {动画数据} animations
 */
export default async function runAnimation($el, animations = []) {
  const play = (animation) => new Promise(resolve => {
    $el.classList.add(animation.value, 'animated')
    const removeAnimation = () => {
      $el.removeEventListener('animationend', removeAnimation)
      $el.removeEventListener('animationcancel', removeAnimation)
      $el.classList.remove(animation.value, 'animated')
      resolve()
    }
    // animationend 动画结束时触发
    // animationcancel 动画意外终止时触发
    $el.addEventListener('animationend', removeAnimation)
    $el.addEventListener('animationcancel', removeAnimation)
  })

  for (let i = 0, len = animations.length; i < len; i++) {
    await play(animations[i])
  }
}
