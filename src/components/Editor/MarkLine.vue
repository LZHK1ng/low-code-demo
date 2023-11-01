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
import { translateComponentStyle } from '@/utils/translate'
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
      // console.log(curComponent, isDownward, isRightward)
      const lines = this.$refs
      // 选取当前画板中的所有组件的NodeList
      const components = this.componentData
      // 解构创建一个新对象
      const curComponentStyle = translateComponentStyle(this.curComponent.style)
      // 当前拖动组件的 宽度/高度 的一半 -> 判断当前是否中间对齐 这里的right和bottom表示Shape 右侧和底部 距离 顶部和左侧的距离
      const curComponentHalfWidth = curComponentStyle.width / 2
      const curComponentHalfHeight = curComponentStyle.height / 2

      this.hideLine()
      components.forEach(component => {
        // 相同的组件不用管
        if (component == this.curComponent) return
        const componentStyle = translateComponentStyle(component.style)
        const { width, height, left, top, bottom, right } = componentStyle

        const nodeHalfWidth = width / 2
        const nodeHalfHeight = height / 2

        const conditions = {
          top: [
            {
              isNearly: this.isNearly(curComponentStyle.top, top), // 顶部 对齐 顶部线条
              lineNode: lines.xt[0], // xt
              line: 'xt', // 水平方向顶部线条
              dragShift: top, // top偏移位置
              lineShift: top, // 吸附线位置
            },
            {
              isNearly: this.isNearly(curComponentStyle.bottom, top), // 底部 对齐 顶部线条
              lineNode: lines.xt[0], // xt
              line: 'xt', // 水平方向顶部线条
              dragShift: top - curComponentStyle.height,
              lineShift: top
            },
            {
              // 组件与拖拽接节点的中间是否对齐
              // 中间 对齐 中间线条 -> 拖拽的一半高度 + 顶部高度 = 当前比较组件的一半高度 + 顶部高度
              isNearly: this.isNearly(curComponentStyle.top + curComponentHalfHeight, top + nodeHalfHeight),
              lineNode: lines.xc[0], // xc
              line: 'xc', // 水平方向中间线条
              dragShift: top + nodeHalfHeight - curComponentHalfHeight,
              lineShift: top + nodeHalfHeight
            },
            {
              isNearly: this.isNearly(curComponentStyle.top, bottom), // 顶部 对齐 底部线条
              lineNode: lines.xb[0], // xb
              line: 'xb', // 水平方向底部线条
              dragShift: bottom,
              lineShift: bottom
            },
            {
              isNearly: this.isNearly(curComponentStyle.bottom, bottom), // 底部 对齐 底部线条
              lineNode: lines.xb[0], // xb
              line: 'xb', // 水平方向底部线条
              dragShift: bottom - curComponentStyle.height,
              lineShift: bottom
            },
          ],
          left: [
            {
              isNearly: this.isNearly(curComponentStyle.left, left), // 左侧 对齐 左侧线条
              lineNode: lines.yl[0], // yl
              line: 'yl', // 垂直方向左侧线条
              dragShift: left,
              lineShift: left
            },
            {
              isNearly: this.isNearly(curComponentStyle.right, left), // 右侧 对齐 左侧线条
              lineNode: lines.yl[0], // yl
              line: 'yl', // 垂直方向左侧线条
              dragShift: left - curComponentStyle.width,
              lineShift: left
            },
            {
              // 组件与拖拽接节点的中间是否对齐
              // 中间 对齐 中间线条 -> 拖拽的一半宽度 + 左侧宽度 = 当前比较组件的一半宽度 + 左侧宽度
              isNearly: this.isNearly(curComponentStyle.left + curComponentHalfWidth, left + nodeHalfWidth),
              lineNode: lines.yc[0], // yc
              line: 'yc', // 垂直方向中间线条
              dragShift: left + nodeHalfWidth - curComponentHalfWidth,
              lineShift: left + nodeHalfWidth
            },
            {
              isNearly: this.isNearly(curComponentStyle.left, right), // 左侧 对齐 右侧线条
              lineNode: lines.yr[0], // yr
              line: 'yr', // 垂直方向右侧线条
              dragShift: right,
              lineShift: right
            },
            {
              isNearly: this.isNearly(curComponentStyle.right, right), // 右侧 对齐 右侧线条
              lineNode: lines.yr[0], // yr
              line: 'yr', // 垂直方向右侧线条
              dragShift: right - curComponentStyle.width,
              lineShift: right
            }
          ]
        }
        // 需要展示的线
        const needToShow = []
        const { rotate } = this.curComponent.style
        Object.keys(conditions).forEach(key => {
          // 遍历符合的进行处理
          conditions[key].forEach((condition) => {
            if (!condition.isNearly) return
            // 修改当前组件位移 -> 吸附
            this.$store.commit('setShapePosStyle', {
              key, value: rotate != '0' ? this.translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift
            })
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
    translatecurComponentShift(key, condition, curComponentStyle) {
      const { width, height } = this.curComponent.style
      if (key == 'top') {
        return Math.round(condition.dragShift - (height - curComponentStyle.height) / 2)
      }
      return Math.round(condition.dragShift - (width - curComponentStyle.width) / 2)
    },
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
