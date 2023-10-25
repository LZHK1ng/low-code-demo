<template>
  <div
    class="shape"
    :class="{ active: this.active }"
    @click="selectCurComponent"
    @mousedown="handleMouseDown"
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
      pointList: ['t', 'r', 'b', 'l', 'lt', 'rt', 'lb', 'rb']
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

      const style = {
        left: `${newLeft}px`,
        top: `${newTop}px`,
        marginLeft: hasR ? '-4px' : '-3px',
        marginTop: '-3px',
        cursor: point
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

        console.log('pse', pos)
        // 修改当前组件样式
        this.$store.commit('setShapeStyle', pos)

        // console.log('当前组件', this.curComponent)

        this.$nextTick(() => {

        })
      }
      // 鼠标抬起时结束移动
      const up = (moveEvent) => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    selectCurComponent(e) {
      // 阻止向父组件冒泡
      // e.stopPropagation()
      // e.preventDefault()
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
