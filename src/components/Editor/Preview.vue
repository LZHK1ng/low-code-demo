<template>
  <div class="bg" v-if="show">
    <el-button @click="close" class="close">关闭</el-button>
    <div
      class="canvas"
      :style="{
        width: canvasStyleData.width + 'px',
        height: canvasStyleData.height + 'px',
        transform: 'scale(' + parseInt(canvasStyleData.scale) / 100 + ')',
      }"
    >
      <ComponentWrapper
        v-for="(item, index) in componentData"
        :key="index"
        :config="item"
      />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import ComponentWrapper from './ComponentWrapper'

export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    }
  },
  components: { ComponentWrapper },
  computed: {
    ...mapState({
      componentData: state => state.componentData,
      canvasStyleData: state => state.canvasStyleData
    })
  },
  methods: {
    close() {
      this.$emit('change', false)
    }
  }
}

</script>
<style lang="scss" scoped>
.bg {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgb(0, 0, 0, 0.5);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 20px;

  .canvas {
    position: relative;
    background: #fff;
  }

  .close {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>
