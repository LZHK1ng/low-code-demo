<template>
  <div>
    <component
      class="component"
      :is="config.component"
      :style="getStyle(config.style)"
      :propValue="config.propValue"
    />
  </div>
</template>
<script>
import getStyle from '@/utils/style'

export default {
  props: {
    config: {
      type: Object,
      require: true
    }
  },
  methods: {
    getStyle
  }
}
</script>
<style lang="scss" scoped>
.component {
  position: absolute;
}
</style>
