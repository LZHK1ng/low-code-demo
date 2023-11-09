<template>
  <div
    v-if="editMode == 'edit'"
    class="v-text"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
  >
    <!-- tabindex >= 0 使得双击时聚集该元素 -->
    <div
      :contenteditable="canEdit"
      :class="{ canEdit }"
      :tabindex="element.id"
      :style="{ verticalAlign: element.style.verticalAlign }"
      @dblclick="setEdit"
      @paste="clearStyle"
      @mousedown="handleMousedown"
      @blur="handleBlur"
      @input="handleInput"
      v-html="element.propValue"
      ref="text"
    ></div>
  </div>
  <div v-else class="v-text">
    <div
      v-html="element.propValue"
      :style="{ verticalAlign: element.style.verticalAlign }"
    ></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    propValue: {
      type: String,
      require: true
    },
    element: {
      type: Object,
    },
  },
  data() {
    return {
      canEdit: false,
      crtlKey: 17,
      keys: [67, 68, 86, 88, 89, 90], // 复制 删除 撤销 重做 剪切 删除键
      isCtrlDown: false,
    }
  },
  computed: {
    ...mapState({
      editMode: state => state.editMode,
    }),
  },
  methods: {
    handleInput(e) {
      this.$emit('input', this.element, e.target.innerHTML)
    },
    stopPropagation(e) {
      if (this.canEdit) {
        e.stopPropagation()
      }
    },
    handleKeydown(e) {
      if (e.keyCode == this.crtlKey) {
        this.isCtrlDown = true
      } else if (this.isCtrlDown && this.canEdit) {
        e.stopPropagation()
      } else if (e.keyCode == 46) {
        e.stopPropagation()
      }
    },
    handleKeyup(e) {
      if (e.keyCode == this.crtlKey) {
        this.isCtrlDown = false
      }
    },
    handleMousedown(e) {
      if (this.canEdit) {
        e.stopPropagation()
      }
    },
    clearStyle(e) {
      e.preventDefault()
      const clp = e.clipboardData
      const text = clp.getData('text/plain') || ''
      if (text !== '') {
        document.execCommand('insertText', false, text)
      }

      this.$emit('input', this.element, e.target.innerHTML)
    },

    handleBlur(e) {
      this.element.propValue = e.target.innerHTML || '&nbsp;'
      this.canEdit = true
    },
    setEdit() {
      this.canEdit = true
      // 全选
      this.selectText(this.$refs.text)
    },
    selectText(element) {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  },
}
</script>

<style lang="scss" scoped>
.v-text {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: table;
  padding: 0 5px;

  div {
    display: table-cell;
    width: 100%;
    height: 100%;
    outline: none;
    overflow: auto;
  }

  .canEdit {
    cursor: text;
  }

  .text {
    border: 1px solid #ddd;
    padding: 5px 10px;
    white-space: normal;
    word-break: break-all;
  }
}
</style>
