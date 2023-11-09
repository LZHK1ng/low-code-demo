<template>
  <div class="group">
    <div>
      <template v-for="item in propValue">
        <component
          class="component"
          :style="item.groupStyle"
          :propValue="item.propValue"
          :is="item.component"
          :key="item.id"
          :id="'component' + item.id"
          :element="item"
        >
        </component>
      </template>
    </div>
  </div>
</template>
<script>
import { getStyle } from '@/utils/style'

export default {
  props: {
    // 组合group内的所有子组件[{}, {}, {}]
    propValue: {
      type: Array,
      default: () => []
    },
    // 当前group组件样式
    element: {
      type: Object,
    }
  },
  data() {
    return {
      groupStyle: {},
    }
  },
  created() {
    const parentStyle = this.element.style
    this.propValue.forEach(component => {
      // 计算每个字组件在Group组件内相对位移和相对大小
      // 如果已经存在component.groupStyle,说明计算过一次，不需要再次计算
      if (!component.groupStyle || !Object.keys(component.groupStyle).length) {
        const style = { ...component.style }
        component.groupStyle = getStyle(style)
        component.groupStyle.left = this.toPercent((style.left - parentStyle.left) / parentStyle.width)
        component.groupStyle.top = this.toPercent((style.top - parentStyle.top) / parentStyle.height)
        component.groupStyle.width = this.toPercent(style.width / parentStyle.width)
        component.groupStyle.height = this.toPercent(style.height / parentStyle.height)
      }
    })
  },
  methods: {
    toPercent(val) {
      return val * 100 + '%'
    }
  }
}

</script>
<style lang="scss" scoped>
.group {
  & > div {
    position: relative;
    width: 100%;
    height: 100%;

    .component {
      position: absolute;
    }
  }
}
</style>
