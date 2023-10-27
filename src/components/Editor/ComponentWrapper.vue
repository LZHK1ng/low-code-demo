<template>
  <div @click="handleClick">
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
import { mixins } from '@/utils/events'

export default {
  props: {
    config: {
      type: Object,
      require: true
    }
  },
  mixins: [mixins],
  methods: {
    getStyle,
    handleClick() {
      console.log(this.config)
      const events = this.config.events
      Object.keys(events).forEach(event => {
        this[event](events[event])
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.component {
  position: absolute;
}
</style>
