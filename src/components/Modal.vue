<template>
  <div class="modal-bg" v-if="show" @click="hideModal">
    <div class="modal fadeInLeft animated" @click="stopPropagation">
      <slot></slot>
    </div>
  </div>
</template>
<script>
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
  methods: {
    hideModal() {
      this.$emit('change')
    },
    stopPropagation(e) {
      e.stopPropagation()
    }
  }
}
</script>
<style lang="scss" scoped>
.modal-bg {
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0, 0.5);
  z-index: 1011;

  .modal {
    width: 400px;
    height: 100%;
    background: #fff;
  }
}
</style>
