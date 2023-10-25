<template>
  <div
    class="shape"
    :class="{ active: this.active }"
    @click="selectCurComponent"
    @mousedown="handleMouseDown"
    @contextmenu="handleContextMenu"
  >
    <div
      class="shape-point"
      v-for="(item, index) in active ? pointList : []"
      :key="index"
      @mousedown="handleMouseDownOnPoint(item)"
      :style="getPointStyle(item)"
    ></div>
    <slot></slot>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    element: {
      require: true,
      type: Object
    },
    defaultStyle: {
      require: true,
      type: Object
    },
    zIndex: {
      require: true,
      type: [Number, String]
    }
  },
  mounted() {
    // console.log(this.props)
  },
  data() {
    return {
      pointList: ['t', 'r', 'b', 'l', 'lt', 'rt', 'lb', 'rb'],
      directionKey: { // 光标显示样式
        t: 'n',
        b: 's',
        l: 'w',
        r: 'e'
      }
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent
    })
  },
  methods: {
    // 获取shape框每个点坐标
    getPointStyle(point) {
      const { width, height } = this.defaultStyle
      const hasL = /l/.test(point)
      const hasT = /t/.test(point)
      const hasR = /r/.test(point)
      const hasB = /b/.test(point)
      let newLeft = 0
      let newTop = 0

      // 四个角的点
      if (point.length == 2) {
        newLeft = hasL ? 0 : width
        newTop = hasT ? 0 : height
      } else {
        // 上下两边的点，宽度居中
        if (hasT || hasB) {
          // 是否需要Math.floor TODO
          newLeft = Math.floor(width / 2)
          newTop = hasT ? 0 : height
        }
        // 左右两边的点，高度剧中
        if (hasL || hasR) {
          newLeft = hasL ? 0 : width
          newTop = Math.floor(height / 2)
        }
      }
      // console.log(point.split('').reverse().map(m => this.directionKey[m]).join(''))
      const style = {
        left: `${newLeft}px`,
        top: `${newTop}px`,
        marginLeft: hasR ? '-4px' : '-3px',
        marginTop: '-3px',
        cursor: point.split('').reverse().map(m => this.directionKey[m]).join('') + '-resize'
      }

      return style
    },
    handleMouseDown(e) {
      // 输入框不需要阻止默认事件（不然点击输入不了）
      if (this.element.component != 'v-text') {
        e.preventDefault()
      }
      e.stopPropagation()
      this.$store.commit('setCurComponent', { component: this.element, zIndex: this.zIndex })
      const pos = { ...this.defaultStyle }
      const startX = e.clientX
      const startY = e.clientY
      // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
      const startTop = Number(pos.top)
      const startLeft = Number(pos.left)

      // 如果元素没有移动，则不保存快照
      let hasMove = false
      // 每次鼠标移动时的事件 -> 获取坐标
      const move = (moveEvent) => {
        hasMove = true
        const curX = moveEvent.clientX
        const curY = moveEvent.clientY
        pos.top = curY - startY + startTop
        pos.left = curX - startX + startLeft

        // 修改当前组件样式
        this.$store.commit('setShapeStyle', pos)

        // console.log('当前组件', this.curComponent)

        this.$nextTick(() => {

        })
      }
      // 鼠标抬起时结束移动
      const up = (moveEvent) => {
        hasMove && this.$store.commit('recordSnapshot')

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    selectCurComponent(e) {
      // 阻止向父组件冒泡
      e.stopPropagation()
      e.preventDefault()
      this.$store.commit('hideContextMenu')
    },
    handleContextMenu(e) {
      e.preventDefault()
      e.stopPropagation()

      let left = e.offsetX
      let top = e.offsetY
      let target = e.target
      while (target && !target.className.includes('editor')) {
        left += target.offsetLeft
        top += target.offsetTop
        target = target.parentNode
      }

      this.$store.commit('showContextMenu', { top, left })
    },
    // 点击圆点 放大or缩小
    handleMouseDownOnPoint(point) {
      const downEvent = window.event
      downEvent.stopPropagation()
      downEvent.preventDefault()

      const pos = { ...this.defaultStyle }
      const startX = downEvent.clientX
      const startY = downEvent.clientY
      const height = pos.height
      const width = pos.width
      const left = pos.left
      const top = pos.top

      // 是否需要保存快照
      let needSave = false
      const move = (moveEvent) => {
        needSave = true
        const curX = moveEvent.clientX
        const curY = moveEvent.clientY

        // 移动的距离
        const disX = curX - startX
        const disY = curY - startY
        // 判断当前是拉了哪个点
        const hasL = /l/.test(point)
        const hasT = /t/.test(point)
        const hasR = /r/.test(point)
        const hasB = /b/.test(point)

        const newHeight = height + (hasT ? -disY : hasB ? +disY : 0)
        const newWidth = width + (hasL ? -disX : hasR ? +disX : 0)

        pos.height = newHeight > 0 ? newHeight : 0
        pos.width = newWidth > 0 ? newWidth : 0
        // 如果是点左边或上边的点需要改变left 和 top值
        pos.left = left + (hasL ? disX : 0)
        pos.top = top + (hasT ? disY : 0)
        this.$store.commit('setShapeStyle', pos)
      }
      const up = () => {
        needSave && this.$store.commit('recordSnapshot')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    }
  },
}
</script>
<style lang="scss">
.shape {
  position: absolute;
}

.active {
  border: 1px solid #70c0ff;
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
