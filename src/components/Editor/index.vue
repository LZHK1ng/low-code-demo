<template>
  <div
    class="editor"
    id="editor"
    :class="{ edit: isEdit }"
    :style="{
      width: canvasStyleData.width + 'px',
      height: canvasStyleData.height + 'px',
      transform: 'scale(' + parseInt(canvasStyleData.scale) / 100 + ')',
    }"
    @contextmenu="handleContextMenu"
    @mousedown="handleMouseDown"
  >
    <!-- 页面组件列表展示 -->
    <Shape
      v-for="(item, index) in componentData"
      :key="item.id"
      :defaultStyle="item.style"
      :active="item === curComponent"
      :style="getShapeStyle(item.style, index)"
      :element="item"
      :index="index"
    >
      <!-- 如果不是输入框 -->
      <component
        v-if="item.component != 'v-text'"
        class="component"
        :is="item.component"
        :style="getComponentStyle(item.style)"
        :element="item"
        :propValue="item.propValue"
      />
      <!-- 如果是输入框 需要传入input事件 -->
      <component
        v-else
        class="component"
        :is="item.component"
        :style="getComponentStyle(item.style, index)"
        :propValue="item.propValue"
        :element="item"
        @input="handleInput"
      />
    </Shape>
    <!-- 右击菜单 -->
    <ContextMenu />
    <!-- 标线 -->
    <MarkLine />
    <!-- 选中区域 -->
    <Area :start="start" :width="width" :height="height" v-show="isShowArea" />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Shape from './Shape'
import { mounted } from 'vue'
import { getStyle } from '@/utils/style.js'
import ContextMenu from './ContextMenu'
import Area from './Area.vue'
import MarkLine from './MarkLine'
import eventBus from '@/utils/eventBus'
import { translateComponentStyle } from '@/utils/translate'

export default {
  props: {
    isEdit: {
      type: Boolean,
      default: true,
    },
  },
  components: { Shape, ContextMenu, MarkLine, Area },
  data() {
    return {
      editorX: 0,
      editorY: 0,
      start: { // 选中区域起点
        x: 0,
        y: 0
      },
      width: 0,
      height: 0,
      isShowArea: false
    }
  },
  computed: {
    ...mapState({
      componentData: state => state.componentData,
      curComponent: state => state.curComponent,
      canvasStyleData: state => state.canvasStyleData,
      editor: state => state.editor
    }),
  },
  mounted() {
    // 获取编辑器元素
    this.$store.commit('getEditor')
    const info = this.editor.getBoundingClientRect()
    this.editorX = info.x
    this.editorY = info.y

    eventBus.$on('hideArea', () => {
      this.hideArea()
    })
  },
  methods: {
    handleMouseDown(e) {
      e.preventDefault()
      this.hideArea()

      const startX = e.clientX
      const startY = e.clientY
      this.start.x = startX - this.editorX
      this.start.y = startY - this.editorY
      this.isShowArea = true

      const move = (moveEvent) => {
        this.width = Math.abs(moveEvent.clientX - startX)
        this.height = Math.abs(moveEvent.clientY - startY)
        if (moveEvent.clientX < startX) {
          this.start.x = moveEvent.clientX - this.editorX
        }
        if (moveEvent.clientY < startY) {
          this.start.y = moveEvent.clientY - this.editorY
        }
      }

      const up = (e) => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        if (e.clientX == startX && e.clientY == startY) {
          this.hideArea()
          return
        }

        this.createGroup()
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    hideArea() {
      this.isShowArea = false
      this.width = 0
      this.height = 0
    },
    createGroup() {
      const areaData = this.getSelectArea()
      if (areaData.length <= 1) {
        this.hideArea()
        return
      }
      let top = Infinity, left = Infinity
      let right = -Infinity, bottom = -Infinity
      areaData.forEach(component => {
        const style = translateComponentStyle(component.style)
        if (left > style.left) left = style.left
        if (top > style.top) top = style.top
        if (right < style.right) right = style.right
        if (bottom < style.bottom) bottom = style.bottom
      })

      this.start.x = left
      this.start.y = top
      this.width = right - left
      this.height = bottom - top

      this.$store.commit('setAreaData', {
        style: {
          left,
          top,
          width: this.width,
          height: this.height,
        },
        components: areaData
      })
    },
    getSelectArea() {
      const result = []
      const { x, y } = this.start
      this.componentData.forEach(component => {
        const { left, top, width, height } = component.style
        if (x <= left && (left + width <= x + this.width) && y <= top && (top + height <= y + this.height)) {
          result.push(component)
        }
      })
      return result
    },
    // 获取边框样式
    getShapeStyle(style, index) {
      const result = { ...style }
      if (result.width) {
        result.width += 'px'
      }

      if (result.height) {
        result.height += 'px'
      }

      if (result.top) {
        result.top += 'px'
      }

      if (result.left) {
        result.left += 'px'
      }

      if (result.rotate) {
        result.transform = 'rotate(' + result.rotate + 'deg)'
      }
      // 按顺序添加 z-index 层级
      result.index = index

      return result
    },
    handleContextMenu(e) {
      e.stopPropagation()
      e.preventDefault()
      let target = e.target
      let top = e.offsetY
      let left = e.offsetX
      while (!target.className.includes('editor')) {
        left += target.offsetLeft
        top += target.offsetTop
        target = target.parentNode
      }

      this.$store.commit('showContextMenu', { top, left })
    },
    // 组件样式
    getComponentStyle(style) {
      return getStyle(style, ['top', 'left', 'width', 'height', 'rotate'])
    },
    handleInput(element, value) {
      element.propValue = value
      // 根据文本组件高度调整 shape 高度
      this.$store.commit('setShapeStyle', { height: this.getTextareaHeight(element, value) })
    },
    getTextareaHeight(element, text) {
      let { lineHeight, fontSize, height } = element.style
      if (lineHeight === '') lineHeight = 1.5
      const newHeight = text.split('\n').length * lineHeight * fontSize
      return height > newHeight ? height : newHeight
    },
  }
}
</script>
<style lang="scss" scoped>
.editor {
  position: relative;
  background: #fff;
  flex-shrink: 0;
}

.edit {
  .component {
    outline: none;
    width: 100%;
    height: 100%;
  }
}
</style>
