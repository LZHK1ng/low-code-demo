import Vue from 'vue'
import Vuex from 'vuex'
import { swap } from '@/utils/utils'
import toast from '@/utils/toast'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    editMode: 'edit', // 编译器模式 edit read
    canvasStyleData: {
      width: 900,
      height: 440,
    },
    menuShow: false,
    menuLeft: null,
    menuTop: null,
    componentData: [],
    curComponent: null,
    curComponentZIndex: null,

  },
  mutations: {
    setEditMode(state, mode) {
      state.editMode = mode
    },
    setCanvasStyle(state, style) {
      state.canvasStyleData = style
    },
    addComponent(state, component) {
      state.componentData.push(component)
      console.log(state.componentData)
    },
    setCurComponent(state, { component, zIndex }) {
      state.curComponent = component
      state.curComponentZIndex = zIndex
    },
    setShapeStyle({ curComponent }, { top, left, width, height }) {
      if (top) curComponent.style.top = top
      if (left) curComponent.style.left = left
      if (width) curComponent.style.width = width
      if (height) curComponent.style.height = height
    },
    showContextMenu(state, { top, left }) {
      state.menuShow = true
      state.menuLeft = left
      state.menuTop = top
    },
    hideContextMenu(state) {
      state.menuShow = false
    },
    deleteComponent(state) {
      state.componentData.splice(state.curComponentZIndex, 1)
    },
    // 上移图层
    upComponent({ componentData, curComponentZIndex }) {
      if (curComponentZIndex < componentData.length - 1) {
        swap(componentData, curComponentZIndex, curComponentZIndex + 1)
      } else {
        toast('已经到顶了', 'error')
      }
    },
    // 下移图层
    downComponent({ componentData, curComponentZIndex }) {
      if (curComponentZIndex > 0) {
        swap(componentData, curComponentZIndex, curComponentZIndex - 1)
      } else {
        toast('已经到底了', 'error')
      }
    },
    topComponent({ componentData, curComponentZIndex }) {
      if (curComponentZIndex < componentData.length - 1) {
        swap(componentData, curComponentZIndex, componentData.length - 1)
      } else {
        toast('已经到顶了', 'error')
      }
    },
    bottomComponent({ componentData, curComponentZIndex }) {
      if (curComponentZIndex > 0) {
        swap(componentData, curComponentZIndex, 0)
      } else {
        toast('已经到底了', 'error')
      }
    },
  },
})

export default store
