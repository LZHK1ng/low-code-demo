<template>
  <div class="mark-line">
    <div
      v-for="line in lines"
      :key="line"
      class="line"
      :class="line.includes('x') ? 'xline' : 'yline'"
      :ref="line"
      v-show="lineStatus[line] || false"
    ></div>
  </div>
</template>
<script>
import eventBus from '@/utils/eventBus'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      lines: ['xt', 'xc', 'xb', 'yl', 'yc', 'yr'], // 三条横线 三条竖线
      diff: 3, // 相距 diff 像素自动吸附
      lineStatus: {
        xt: false,
        xc: false,
        xb: false,
        yl: false,
        yc: false,
        yr: false,
      },
      editor: null
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent,
      componentData: state => state.componentData
    })
  },
  mounted() {
    this.editor = document.querySelector('#editor')
    // 监听元素移动和不移动的事件
    eventBus.$on('move', (isDownward, isRightward) => {
      this.showLine(isDownward, isRightward)
    })

    eventBus.$on('unmove', () => {
      this.hideLine()
    })
  },
  methods: {
    hideLine() {
      Object.keys(this.lineStatus).forEach(e => {
        this.lineStatus[e] = false
      })
    },

    showLine() {
      // console.log(dragNode, isDownward, isRightward)
      const lines = this.$refs
      // 选取当前画板中的所有组件的NodeList
      const components = this.componentData
      // 解构创建一个新对象
      const dragNodeRectInfo = { ...this.curComponent.style }
      // 当前拖动组件的 宽度/高度 的一半 -> 判断当前是否中间对齐 这里的right和bottom表示Shape 右侧和底部 距离 顶部和左侧的距离
      const dragNodeHalfWidth = dragNodeRectInfo.width / 2
      const dragNodeHalfHeight = dragNodeRectInfo.height / 2
      dragNodeRectInfo.right = dragNodeRectInfo.left + dragNodeRectInfo.width
      dragNodeRectInfo.bottom = dragNodeRectInfo.top + dragNodeRectInfo.height

      this.hideLine()
      components.forEach(component => {
        // 相同的组件不用管
        if (component == this.curComponent) return

        // const { width, height, left, top, right, bottom } = this.getNodeRelativePosition(component)
        const { width, height, left, top } = component.style
        const right = left + width
        const bottom = top + height

        const nodeHalfWidth = width / 2
        const nodeHalfHeight = height / 2

        const conditions = {
          top: [
            {
              isNearly: this.isNearly(dragNodeRectInfo.top, top), // 顶部 对齐 顶部线条
              lineNode: lines.xt[0], // xt
              line: 'xt', // 水平方向顶部线条
              dragShift: top, // top偏移位置
              lineShift: top, // 吸附线位置
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.bottom, top), // 底部 对齐 顶部线条
              lineNode: lines.xt[0], // xt
              line: 'xt', // 水平方向顶部线条
              dragShift: top - dragNodeRectInfo.height,
              lineShift: top
            },
            {
              // 组件与拖拽接节点的中间是否对齐
              isNearly: this.isNearly(dragNodeRectInfo.top + dragNodeHalfHeight, top + nodeHalfHeight), // 中间 对齐 中间线条 -> 拖拽的一半高度 + 顶部高度 = 当前比较组件的一半高度 + 顶部高度
              lineNode: lines.xc[0], // xc
              line: 'xc', // 水平方向中间线条
              dragShift: top + nodeHalfHeight - dragNodeHalfHeight,
              lineShift: top + nodeHalfHeight
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.top, bottom), // 顶部 对齐 底部线条
              lineNode: lines.xb[0], // xb
              line: 'xb', // 水平方向底部线条
              dragShift: bottom,
              lineShift: bottom
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.bottom, bottom), // 底部 对齐 底部线条
              lineNode: lines.xb[0], // xb
              line: 'xb', // 水平方向底部线条
              dragShift: bottom - dragNodeRectInfo.height,
              lineShift: bottom
            },
          ],
          left: [
            {
              isNearly: this.isNearly(dragNodeRectInfo.left, left), // 左侧 对齐 左侧线条
              lineNode: lines.yl[0], // yl
              line: 'yl', // 垂直方向左侧线条
              dragShift: left,
              lineShift: left
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.right, left), // 右侧 对齐 左侧线条
              lineNode: lines.yl[0], // yl
              line: 'yl', // 垂直方向左侧线条
              dragShift: left - dragNodeRectInfo.width,
              lineShift: left
            },
            {
              // 组件与拖拽接节点的中间是否对齐
              isNearly: this.isNearly(dragNodeRectInfo.left + dragNodeHalfWidth, left + nodeHalfWidth), // 中间 对齐 中间线条 -> 拖拽的一半宽度 + 左侧宽度 = 当前比较组件的一半宽度 + 左侧宽度
              lineNode: lines.yc[0], // yc
              line: 'yc', // 垂直方向中间线条
              dragShift: left + nodeHalfWidth - dragNodeHalfWidth,
              lineShift: left + nodeHalfWidth
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.left, right), // 左侧 对齐 右侧线条
              lineNode: lines.yr[0], // yr
              line: 'yr', // 垂直方向右侧线条
              dragShift: right,
              lineShift: right
            },
            {
              isNearly: this.isNearly(dragNodeRectInfo.right, right), // 右侧 对齐 右侧线条
              lineNode: lines.yr[0], // yr
              line: 'yr', // 垂直方向右侧线条
              dragShift: right - dragNodeRectInfo.width,
              lineShift: right
            }
          ]
        }
        // 需要展示的线
        const needToShow = []
        Object.keys(conditions).forEach(key => {
          // 遍历符合的进行处理
          conditions[key].forEach((condition) => {
            if (!condition.isNearly) return
            // 修改当前组件位移 -> 吸附
            this.$store.commit('setShapePosStyle', { key, value: condition.dragShift })
            // 吸附线的位置
            condition.lineNode.style[key] = `${condition.lineShift}px`
            needToShow.push(condition.line)
          })
        })
        // console.log(needToShow)
        if (needToShow.length) {
          needToShow.forEach((line) => {
            Object.keys(this.lineStatus).forEach((e) => {
              if (e == line) {
                this.lineStatus[e] = true
              }
            })
          })
        }
        // console.log(this.lineStatus)
      })
    },
    // 获取节点相对编辑器的位置
    // getNodeRelativePosition(node) {
    //   let { height, width, left, top, right, bottom } = node.getBoundingClientRect()
    //   const editorRectInfo = this.editor.getBoundingClientRect()

    //   left -= editorRectInfo.left
    //   top -= editorRectInfo.top
    //   right -= editorRectInfo.left
    //   bottom -= editorRectInfo.top

    //   return { width, height, left, top, right, bottom }
    // },
    // 判断当前是否靠近
    isNearly(dragValue, targetValue) {
      return Math.abs(dragValue - targetValue) <= this.diff
    }
  }
}

</script>
<style lang="scss" scoped>
.mark-line {
  height: 100%;
}
.line {
  background: #59c7f9;
  position: absolute;
  z-index: 1000;
}
.xline {
  height: 1px;
  width: 100%;
}
.yline {
  width: 1px;
  height: 100%;
}
</style>
