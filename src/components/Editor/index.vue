<template>
  <div
    class="editor"
    id="editor"
    :class="{ edit: isEdit }"
    :style="{
      width: canvasStyleData.width + 'px',
      height: canvasStyleData.height + 'px',
    }"
  >
    <!-- 页面组件列表展示 -->
    <Shape
      v-for="(item, index) in componentData"
      :key="item.id"
      :defaultStyle="item.style"
      :active="item === curComponent"
      :style="getShapeStyle(item.style, index)"
      :element="item"
      :zIndex="index"
    >
      <!-- 如果不是输入框 -->
      <component
        v-if="item.component != 'v-text'"
        class="component"
        :is="item.component"
        :style="getComponentStyle(item.style)"
        :propValue="item.propValue"
      />
      <!-- 如果是输入框 需要传入element -->
      <component
        v-else
        class="component"
        :is="item.component"
        :style="getComponentStyle(item.style)"
        :propValue="item.propValue"
        :element="item"
        @input="handleInput"
      />
    </Shape>
    <!-- 右击菜单 -->
    <ContextMenu />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Shape from './Shape'
import { mounted } from 'vue'
import getStyle from '@/utils/style.js'
import ContextMenu from './ContextMenu'

export default {
  props: {
    isEdit: {
      type: Boolean,
      default: true,
    },
  },
  components: { Shape, ContextMenu },
  computed: {
    ...mapState({
      componentData: state => state.componentData,
      curComponent: state => state.curComponent,
      canvasStyleData: state => state.canvasStyleData
    }),
  },
  methods: {
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
      result.zIndex = index

      return result
    },
    // 组件样式
    getComponentStyle(style) {
      return getStyle(style, ['top', 'left', 'width', 'height', 'zIndex', 'rotate'])
    },
    handleInput(element, value) {
      element.propValue = value
    }
  }
}
</script>
<style lang="scss" scoped>
.editor {
  position: relative;
  background: #fff;
}

.edit {
  .component {
    outline: none;
    width: 100%;
    height: 100%;
  }
}
</style>
