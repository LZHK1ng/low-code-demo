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
      <component
        class="component"
        :is="item.component"
        :style="getComponentStyle(item.style)"
        :propValue="item.propValue"
      />
    </Shape>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Shape from './Shape'
import { mounted } from 'vue'
import getStyle from '@/utils/style.js'

export default {
  props: {
    isEdit: {
      type: Boolean,
      default: true,
    },
  },
  components: { Shape },
  computed: {
    ...mapState({
      componentData: state => state.componentData,
      curComponent: state => state.curComponent,
      canvasStyleData: state => state.canvasStyleData
    }),
  },
  methods: {
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
    getComponentStyle(style) {
      return getStyle(style, ['top', 'left', 'width', 'height', 'zIndex', 'rotate'])
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
