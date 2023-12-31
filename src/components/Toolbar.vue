<template>
  <div class="toolbar">
    <el-button @click="undo">撤销</el-button>
    <el-button @click="redo">重做</el-button>
    <label for="input" class="insert">插入图片</label>
    <input type="file" @change="handleFileChange" id="input" hidden />
    <el-button @click="preview" style="margin-left: 10px">预览</el-button>
    <el-button @click="save">保存</el-button>
    <el-button @click="clearCanvas">清空画布</el-button>
    <el-button @click="compose" :disabled="!areaData.components.length"
      >组合</el-button
    >
    <el-button
      @click="decompose"
      :disabled="
        !curComponent ||
        curComponent.isLock ||
        curComponent.component != 'Group'
      "
      >拆分</el-button
    >
    <el-button @click="lock" :disabled="!curComponent || curComponent.isLock"
      >锁定</el-button
    >
    <el-button @click="unlock" :disabled="!curComponent || !curComponent.isLock"
      >解锁
    </el-button>
    <div class="canvas-config">
      <span>画布大小</span>
      <input v-model="canvasStyleData.width" />
      <span>*</span>
      <input v-model="canvasStyleData.height" />
    </div>
    <div class="canvas-config">
      <span>画布比例</span>
      <input v-model="canvasStyleData.scale" /> %
    </div>
    <!-- 预览 -->
    <Preview v-model="isShowPreview" @change="handlePreviewChange" />
  </div>
</template>
<script>
import generateID from '@/utils/generateID'
import toast from '@/utils/toast'
import { mapState } from 'vuex'
import Preview from '@/components/Editor/Preview'
import { commonStyle, commonAttr } from '@/custom-component/component-list'

export default {
  components: {
    Preview,
  },
  data() {
    return {
      isShowPreview: false,
    }
  },
  computed: {
    ...mapState({
      canvasStyleData: state => state.canvasStyleData,
      componentData: state => state.componentData,
      areaData: state => state.areaData,
      curComponent: state => state.curComponent
    })
  },
  methods: {
    lock() {
      this.$store.commit('lock')
    },
    unlock() {
      this.$store.commit('unlock')
    },
    compose() {
      this.$store.commit('compose')
      this.$store.commit('recordSnapshot')
    },
    decompose() {
      this.$store.commit('decompose')
      this.$store.commit('recordSnapshot')
    },
    undo() {
      this.$store.commit('undo')
    },
    redo() {
      this.$store.commit('redo')
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
            component: {
              ...commonAttr,
              id: generateID(),
              component: 'Picture',
              label: '图片',
              icon: '',
              propValue: fileResult,
              style: {
                ...commonStyle,
                top: 0,
                left: 0,
                width: img.width,
                height: img.height,
              },
            },
          })
        }
        img.src = fileResult
      }
      reader.readAsDataURL(file)
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
  }
}
</script>
<style lang="scss" scoped>
.toolbar {
  height: 64px;
  line-height: 64px;
  background: #fff;
  border-bottom: 1px solid #ddd;

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
    outline: 0;
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
      outline: 0;
    }

    &:hover {
      background-color: #ecf5ff;
      color: #3a8ee6;
    }
  }
}
</style>
