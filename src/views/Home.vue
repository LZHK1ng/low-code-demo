<template>
  <div class="home">
    <Toolbar />
    <main>
      <!-- 左侧组件 -->
      <section class="left">
        <ComponentList />
      </section>
      <!-- 中间画布 -->
      <section class="center">
        <div
          class="content"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="deselectCurComponent"
        >
          <Editor />
        </div>
      </section>
      <!-- 右侧属性列表 -->
      <section class="right">
        <el-tabs v-model="activeName">
          <!-- 属性 -->
          <el-tab-pane label="属性" name="attr">
            <AttrList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <!-- 动画 -->
          <el-tab-pane label="动画" name="animation">
            <AnimationList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <!-- 事件 -->
          <el-tab-pane label="事件" name="events">
            <EventList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
        </el-tabs>
      </section>
    </main>
  </div>
</template>
<script>
import ComponentList from '@/components/ComponentList' // 左侧列表组件
import componentList from '@/custom-component/component-list' // 左侧列表数据
import AttrList from '@/components/AttrList' // 右侧属性列表
import Modal from '@/components/Modal'
import Editor from '@/components/Editor/index'
import Toolbar from '@/components/Toolbar'
import AnimationList from '@/components/AnimationList'
import EventList from '@/components/EventList'
import { mapState } from 'vuex'
import { deepClone } from '@/utils/utils'
import generateID from '@/utils/generateID'
import eventBus from '@/utils/eventBus'

export default {
  components: { ComponentList, Editor, AttrList, Toolbar, AnimationList, EventList },
  created() {
    this.restore()
    // 监听复制粘贴
    this.listenCopyAndPaste()
  },
  data() {
    return {
      activeName: 'attr',
      eventBus
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent,
      canvasStyleData: state => state.canvasStyleData,
      componentData: state => state.componentData
    })
  },
  methods: {
    listenCopyAndPaste() {
      const ctrlKey = 17, vKey = 86, cKey = 67, xKey = 88
      let isCtrlDown = false
      window.onkeydown = (e) => {
        if (e.keyCode == ctrlKey) {
          isCtrlDown = true
        } else if (isCtrlDown && e.keyCode == cKey) {
          this.$store.commit('copy')
        } else if (isCtrlDown && e.keyCode == vKey) {
          this.$store.commit('paste')
          this.$store.commit('recordSnapshot')
        } else if (isCtrlDown && e.keyCode == xKey) {
          this.$store.commit('cut')
        }
      }

      window.onkeyup = (e) => {
        if (e.keyCode == ctrlKey) {
          isCtrlDown = false
        }
      }
    },
    restore() {
      if (localStorage.getItem('canvasData')) {
        this.$store.commit('setComponentData', this.resetID(JSON.parse(localStorage.getItem('canvasData'))))
      }
      if (localStorage.getItem('canvasStyle')) {
        this.$store.commit('setCanvasStyle', JSON.parse(localStorage.getItem('canvasStyle')))
      }
    },
    // 如果localStorage有数据，重新进入页面，插入图片，id可能会初始化会变为0导致id重复
    resetID(componentData) {
      componentData.forEach(item => {
        item.id = generateID()
      })
      return componentData
    },
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      const component = deepClone(componentList[e.dataTransfer.getData('index')])
      component.style.top = e.offsetY
      component.style.left = e.offsetX
      component.id = generateID()
      this.$store.commit('addComponent', { component })
      this.$store.commit('recordSnapshot')
    },
    handleDragOver(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },

    deselectCurComponent() {
      this.$store.commit('setCurComponent', { component: null, index: null })
      this.$store.commit('hideContextMenu')
    },

    preview() {
      this.isShowPreview = true
      this.$store.commit('setEditMode', 'read')
    },
    handlePreviewChange() {
      this.$store.commit('setEditMode', 'edit')
    },
    save() {
      localStorage.setItem('canvasData', JSON.stringify(this.componentData))
      localStorage.setItem('canvasStyle', JSON.stringify(this.canvasStyleData))
      this.$message.success('保存成功')
    },
    clearCanvas() {
      this.$store.commit('setComponentData', [])
    },
    closeModal() {
      this.isShowEvent = false
    },
  },
}
</script>
<style lang="scss">
.home {
  height: 100vh;
  background: #fff;

  main {
    display: flex;
    height: calc(100% - 64px);
    width: 100%;

    .left {
      order: 1;
      height: 100%;
      width: 200px;
    }

    .center {
      order: 2;
      height: 100%;
      flex-grow: 1;
      background: #f5f5f5;
      padding: 20px;

      .content {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    }

    .right {
      order: 3;
      height: 100%;
      width: 262px;
      background-color: antiquewhite;
    }

    .placeholder {
      text-align: center;
      color: #333;
    }
  }
}
</style>
