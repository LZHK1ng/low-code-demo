<template>
  <div class="add-event-modal-bg" v-if="isShowEvent" @click="hideModal">
    <div class="add-event-modal fadeInLeft animated" @click="stopPropagation">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    isShowEvent: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    hideModal() {
      this.$emit('closeModal')
    },
    stopPropagation(e) {
      e.stopPropagation()
    }
  }
}
</script>
<style lang="scss" scoped>
.add-event-modal-bg {
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0, 0.5);
  z-index: 1011;

  .add-event-modal {
    width: 400px;
    height: 100%;
    background: #fff;
  }
}
</style>
