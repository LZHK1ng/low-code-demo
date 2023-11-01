<template>
  <div class="animation-list">
    <div class="div-animation">
      <el-button @click="isShowAnimation = true">添加动画</el-button>
      <el-button @click="previewAnimation">预览动画</el-button>
      <div>
        <el-tag
          v-for="(animation, index) in curComponent.animations"
          :key="index"
          closable
          @close="removeAnimation(index)"
        >
          {{ animation.label }}
        </el-tag>
      </div>
    </div>

    <!-- 添加动画 -->
    <Modal v-model="isShowAnimation">
      <el-tabs v-model="animationActiveName">
        <el-tab-pane
          v-for="item in animationClassData"
          :key="item.label"
          :label="item.label"
          :name="item.label"
          style="padding: 0 20px"
        >
          <el-scrollbar>
            <div
              class="animate"
              v-for="(animate, index) in item.children"
              :key="index"
              @mouseover="hoverPreviewAnimation = animate.value"
              @click="addAnimation(animate)"
            >
              <div
                :class="[
                  hoverPreviewAnimation === animate.value &&
                    animate.value + ' animated',
                ]"
              >
                {{ animate.label }}
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </Modal>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import eventBus from '@/utils/eventBus'
import Modal from '@/components/Modal'
import animationClassData from '@/utils/animationClassData'

export default {
  components: { Modal },
  data() {
    return {
      isShowAnimation: false,
      animationActiveName: '进入',
      animationClassData,
      hoverPreviewAnimation: '',
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent
    })
  },
  methods: {
    previewAnimation() {
      eventBus.$emit('runAnimation')
    },
    removeAnimation(index) {
      this.$store.commit('removeAnimation', index)
    },
    addAnimation(animate) {
      this.$store.commit('addAnimation', animate)
      this.isShowAnimation = false
    },
  }
}
</script>
<style lang="scss">
.animation-list {
  .div-animation {
    text-align: center;

    & > div {
      margin-top: 20px;
    }
  }
}
.el-scrollbar__view {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding-left: 14px;

  .animate > div {
    width: 100px;
    height: 60px;
    background: #f5f8fb;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 12px;
    margin-bottom: 10px;
    font-size: 12px;
    color: #333;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
  }
}
</style>
