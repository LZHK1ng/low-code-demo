<template>
  <div class="home">
    <header>
      <el-button @click="undo">撤销</el-button>
      <el-button @click="redo">重做</el-button>
      <label for="input" class="insert">插入图片</label>
      <input type="file" @change="handleFileChange" id="input" hidden />
      <el-button @click="preview" style="margin-left: 10px">预览</el-button>
      <el-button @click="save">保存</el-button>
      <el-button @click="clearCanvas">清空画布</el-button>
      <div class="canvas-config">
        <span>画布大小</span>
        <input v-model="canvasStyleData.width" />
        <span>*</span>
        <input v-model="canvasStyleData.height" />
      </div>
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
          <!-- 属性 -->
          <el-tab-pane label="属性" name="attr">
            <AttrList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <!-- 动画 -->
          <el-tab-pane label="动画" name="animation">
            <div v-if="curComponent" class="div-animation">
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
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <!-- 事件 -->
          <el-tab-pane label="事件" name="events">
            <div v-if="curComponent" class="div-events">
              <el-button @click="isShowEvent = true">添加事件</el-button>
              <div>
                <el-tag
                  v-for="event in Object.keys(curComponent.events)"
                  :key="event"
                  closable
                  @close="removeEvent(event)"
                >
                  {{ event }}
                </el-tag>
              </div>
            </div>
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
        </el-tabs>
      </section>

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

      <!-- 添加事件 -->
      <Modal v-model="isShowEvent">
        <el-tabs v-model="eventActiveName">
          <el-tab-pane
            v-for="item in eventList"
            :key="item.key"
            :label="item.label"
            :name="item.key"
            style="padding: 0 20px"
          >
            <el-input
              v-if="item.key == 'redirect'"
              v-model="item.param"
              type="textarea"
              placeholder="请输入完整的 URL"
            ></el-input>
            <el-input
              v-if="item.key == 'alert'"
              v-model="item.param"
              type="textarea"
              placeholder="请输入要 alert 的内容"
            ></el-input>
            <el-button
              style="margin-top: 20px"
              @click="addEvent(item.key, item.param)"
              >确定</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </Modal>
    </main>

    <!-- 预览 -->
    <Preview v-model="isShowPreview" @change="handlePreviewChange" />
  </div>
</template>
<script>
import ComponentList from '@/components/ComponentList' // 左侧列表组件
import componentList from '@/custom-component/component-list' // 左侧列表数据
import AttrList from '@/components/AttrList' // 右侧属性列表
import Modal from '@/components/Modal'
import Editor from '@/components/Editor/index'
import Preview from '@/components/Editor/Preview'
import animationClassData from '@/utils/animationClassData'
import { mapState } from 'vuex'
import { deepClone } from '@/utils/utils'
import { eventList } from '@/utils/events'
import generateID from '@/utils/generateID'
import eventBus from '@/utils/eventBus'
import toast from '@/utils/toast'

export default {
  components: { ComponentList, Editor, AttrList, Preview, Modal },
  created() {
    // console.log(localStorage)
    if (localStorage.getItem('canvasData')) {
      this.$store.commit('setComponentData', this.resetID(JSON.parse(localStorage.getItem('canvasData'))))
    }
    if (localStorage.getItem('canvasStyle')) {
      this.$store.commit('setCanvasStyle', JSON.parse(localStorage.getItem('canvasStyle')))
    }
  },
  data() {
    return {
      isShowPreview: false,
      isShowEvent: false,
      isShowAnimation: false,
      activeName: 'attr',
      eventActiveName: 'redirect',
      animationActiveName: '进入',
      animationClassData,
      hoverPreviewAnimation: '',
      eventList,
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
      this.$store.commit('addComponent', component)
      this.$store.commit('recordSnapshot')
    },
    handleDragOver(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    handleFileChange(e) {
      const file = e.target.files[0]
      if (!file.type.includes('image')) {
        toast('只能插入图片', 'error')
        return
      }
      const reader = new FileReader()
      reader.onload = (res) => {
        const fileResult = res.target.result
        const img = new Image()
        img.onload = () => {
          this.$store.commit('addComponent', {
            id: generateID(),
            component: 'Picture',
            label: '图片',
            icon: '',
            propValue: fileResult,
            animations: [],
            events: [],
            style: {
              top: 0,
              left: 0,
              width: img.width,
              height: img.height,
              rotate: '',
            },
          })
        }
        img.src = fileResult
      }
      reader.readAsDataURL(file)
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
    addEvent(event, param) {
      this.isShowEvent = false
      this.$store.commit('addEvent', { event, param })
    },
    removeEvent(event) {
      this.$store.commit('removeEvent', event)
      // 解决点击close页面没有马上刷新问题
      this.$nextTick(() => {
        this.isShowEvent = true
        this.isShowEvent = false
      })
    },
    previewAnimation() {
      eventBus.$emit('runAnimation')
    },
    addAnimation(animate) {
      this.$store.commit('addAnimation', animate)
      this.isShowAnimation = false
    },
    removeAnimation(index) {
      this.$store.commit('removeAnimation', index)
    }
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
      background: #f5f5f5;
      padding: 20px;

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

  .el-tag {
    width: 60%;
    display: block;
    margin: auto;
    margin-bottom: 10px;
  }

  .div-animation {
    text-align: center;

    & > div {
      margin-top: 20px;
    }
  }

  .canvas-config {
    display: inline-block;
    margin-left: 10px;
    font-size: 14px;
    color: #606266;

    input {
      width: 50px;
      margin-left: 10px;
      outline: none;
      padding: 0 5px;
      border: 1px solid #ddd;
      color: #606266;
    }
    span {
      margin-left: 10px;
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

  .div-events {
    text-align: center;
    padding: 0 20px;

    .el-button {
      display: inline-block;
      margin-bottom: 10px;
    }
  }

  .insert {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: 0.1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    margin-left: 10px;

    &:active {
      color: #3a8ee6;
      border-color: #3a8ee6;
      outline: none;
    }

    &:hover {
      background-color: #ecf5ff;
      color: #3a8ee6;
    }
  }
}
</style>
