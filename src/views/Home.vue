<template>
  <div class="home">
    <header>
      <el-button @click="undo">撤销</el-button>
      <el-button @click="redo">重做</el-button>
      <el-button>插入图片</el-button>
      <el-button>预览</el-button>
      <el-button>保存</el-button>
      <el-button>清空画布</el-button>
    </header>
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
          <el-tab-pane label="属性" name="attr">
            <AttrList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <el-tab-pane label="动画" name="animation">
            <p class="placeholder">请选择组件</p>
          </el-tab-pane>
          <el-tab-pane label="事件" name="events">
            <p class="placeholder">请选择组件</p>
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
import Editor from '@/components/Editor/index'
import { mapState } from 'vuex'
import { deepClone } from '@/utils/utils'
import generateID from '@/utils/generateID'

export default {
  components: { ComponentList, Editor, AttrList },
  data() {
    return {
      activeName: 'attr',
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent
    })
  },
  methods: {
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      const component = deepClone(componentList[e.dataTransfer.getData('index')])
      component.style.top = e.offsetY
      component.style.left = e.offsetX
      component.id = generateID()
      this.$store.commit('addComponent', component)
      this.$store.commit('recordSnapshot')
    },
    handleDragOver(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    deselectCurComponent() {
      this.$store.commit('setCurComponent', { component: null, zIndex: null })
      this.$store.commit('hideContextMenu')
    },
    undo() {
      this.$store.commit('undo')
    },
    redo() {
      this.$store.commit('redo')
    },
  },
}
</script>
<style lang="scss">
.home {
  height: 100vh;
  background: #fff;

  header {
    height: 64px;
    line-height: 64px;
    width: 100%;
    border-bottom: 1px solid #ddd;
  }

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
      background-color: aquamarine;

      .content {
        height: 100%;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
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
  .el-scrollbar__view {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 14px;
  }
  .el-tag {
    width: 100%;
    display: block;
    margin: auto;
    margin-bottom: 10px;
  }
}
</style>
