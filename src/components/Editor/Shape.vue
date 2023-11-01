<template>
  <div
    class="shape"
    :class="{ active: this.active }"
    @click="selectCurComponent"
    @mousedown="handleMouseDownOnShape"
    @contextmenu="handleContextMenu"
  >
    <i
      class="el-icon-refresh-right"
      v-show="active"
      @mousedown="handleRotate"
    ></i>
    <div
      class="shape-point"
      v-for="(item, index) in active ? pointList : []"
      :key="index"
      @mousedown="handleMouseDownOnPoint(item)"
      :style="getPointStyle(item, index)"
    ></div>
    <slot></slot>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import eventBus from '@/utils/eventBus'
import runAnimation from '@/utils/runAnimation'
import calculateComponentPositionAndSize from '@/utils/calculateComponentPositionAndSize'

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
    eventBus.$on('runAnimation', () => {
      if (this.element == this.curComponent) {
        runAnimation(this.$el, this.curComponent.animations)
      }
    })
  },
  data() {
    return {
      pointList: ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'], // 八个方向
      initialAngle: { // 每个点对应的初始角度
        lt: 0,
        t: 45,
        rt: 90,
        r: 135,
        rb: 180,
        b: 225,
        lb: 270,
        l: 315,
      },
      angleToCursor: [ // 每个范围的角度对应的光标
        { start: 338, end: 23, cursor: 'nw' }, // 337.5 22.5
        { start: 23, end: 68, cursor: 'n' },
        { start: 68, end: 113, cursor: 'ne' },
        { start: 113, end: 158, cursor: 'e' },
        { start: 158, end: 203, cursor: 'se' },
        { start: 203, end: 248, cursor: 's' },
        { start: 248, end: 293, cursor: 'sw' },
        { start: 293, end: 338, cursor: 'w' },
      ],
      cursors: {}
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
        marginLeft: hasR ? '-4px' : '-4px',
        marginTop: '-4px',
        cursor: this.cursors[point]
      }

      return style
    },
    getCursor() {
      // 防止角度有负数 +360
      const rotate = (this.curComponent.style.rotate + 360) % 360
      const result = {}
      let lastMatchIndex = -1
      this.pointList.forEach(point => {
        // 当前点的角度
        const angle = (this.initialAngle[point] + rotate) % 360
        let i = 0, len = this.angleToCursor.length
        while (i < len) {
          lastMatchIndex = (lastMatchIndex + 1) % len
          const curAngle = this.angleToCursor[lastMatchIndex]
          if (angle >= 338 || angle < 23) {
            result[point] = 'nw-resize'
            break
          }
          if (curAngle.start <= angle && curAngle.end > angle) {
            result[point] = curAngle.cursor + '-resize'
            break
          }
        }
      })
      return result
    },
    handleMouseDownOnShape(e) {
      // 输入框不需要阻止默认事件（不然点击输入不了）
      if (this.element.component != 'v-text') {
        e.preventDefault()
      }
      e.stopPropagation()
      // console.log(this.element)
      this.$store.commit('setCurComponent', { component: this.element, zIndex: this.zIndex })
      this.cursors = this.getCursor() // 根据旋转角度获取光标位置

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
        /**
         * 等更新完当前组件的样式绘制到屏幕后再判断是否需要吸附
         * 如果不使用 $nextTick，事件操作可能会发生在DOM更新之前，吸附后无法移动
         * 后两个参数代表鼠标移动方向 -> 用于解决同一方向最多显示一条线段美化界面 TODO
         * curY - startY > 0 true 表示向下移动 false 表示向上移动
         * curX - startX > 0 true 表示向左移动 false 表示向右移动
         */
        this.$nextTick(() => {
          eventBus.$emit('move')
        })
      }
      // 鼠标抬起时结束移动
      const up = () => {
        hasMove && this.$store.commit('recordSnapshot')
        // 触发元素停止移动事件，用于隐藏标线
        eventBus.$emit('unmove')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        this.cursors = this.getCursor() // 根据旋转角度获取光标位置
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

      const style = { ...this.defaultStyle }

      // 中心点坐标
      const center = {
        x: style.left + style.width / 2,
        y: style.top + style.height / 2
      }

      // 获取画布位移信息
      const editorRectInfo = document.querySelector('#editor').getBoundingClientRect()
      // 获取当前点击坐标
      const clickPoint = {
        x: downEvent.clientX - editorRectInfo.left,
        y: downEvent.clientY - editorRectInfo.top
      }
      // 获取对称点坐标
      const symmetricPoint = {
        x: 2 * center.x - clickPoint.x,
        y: 2 * center.y - clickPoint.y
      }

      // 是否需要保存快照
      let needSave = false
      const move = (moveEvent) => {
        needSave = true
        // 按住组件左上角进行拉伸时，通过当前鼠标实时坐标和对称点计算出新的组件中心点
        const curPosition = {
          x: moveEvent.clientX - editorRectInfo.left,
          y: moveEvent.clientY - editorRectInfo.top
        }
        calculateComponentPositionAndSize(point, style, curPosition, { symmetricPoint, clickPoint })
        // console.log(style)
        this.$store.commit('setShapeStyle', style)
      }
      const up = () => {
        needSave && this.$store.commit('recordSnapshot')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    handleRotate(e) {
      e.stopPropagation()
      // 获得当前旋转的中心点坐标
      const rect = this.$el.getBoundingClientRect()
      const centerX = rect.width / 2 + rect.left
      const centerY = rect.height / 2 + rect.top
      const pos = { ...this.defaultStyle }
      const startRotate = pos.rotate
      // 旋转前坐标
      const startX = e.clientX
      const startY = e.clientY

      // 旋转前角度
      const rotateDegBefore = Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180)

      let hasMove = false
      const move = (rotateEvent) => {
        hasMove = true
        // 旋转后坐标
        const curX = rotateEvent.clientX
        const curY = rotateEvent.clientY

        // 旋转后角度
        const rotateDegAfter = Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180)
        // 得到旋转的角度
        pos.rotate = startRotate + rotateDegAfter - rotateDegBefore

        this.$store.commit('setShapeStyle', pos)
      }

      const up = () => {
        hasMove && this.$store.commit('recordSnapshot')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        this.cursors = this.getCursor() // 根据旋转角度获取光标位置
        // console.log(this.cursors)
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

  &:hover {
    cursor: move;
  }
}

.active {
  outline: 1px solid #70c0ff;
  user-select: none;
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.el-icon-refresh-right {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -30px;
  font-size: 22px;
  font-weight: 600;
  cursor: grab;
  color: #59c7f9;
  font-size: 22px;
  font-weight: normal;

  &:active {
    cursor: grabbing;
  }
}
</style>
