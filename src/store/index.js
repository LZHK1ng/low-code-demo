import Vue from 'vue'
import Vuex from 'vuex'
import { swap, deepClone } from '@/utils/utils'
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
    snapshotData: [], // 编辑器快照数据
    snapshotIndex: -1, // 快照索引
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
    // 吸附
    setShapePosStyle({ curComponent }, { key, value }) {
      curComponent.style[key] = value
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
    // 撤销操作 -> 将上一步的快照数据赋值给画布
    undo(state) {
      if (state.snapshotIndex >= 0) {
        state.snapshotIndex--
        store.commit('setComponentData', deepClone(state.snapshotData[state.snapshotIndex]))
      }
    },
    // 重做操作
    redo(state) {
      if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotIndex++
        store.commit('setComponentData', deepClone(state.snapshotData[state.snapshotIndex]))
      }
    },
    setComponentData(state, componentData = []) {
      Vue.set(state, 'componentData', componentData)
    },
    // 添加新的快照
    recordSnapshot(state) {
      // 这里需要 snapshotIndex 索引来记录，不用push
      state.snapshotData[++state.snapshotIndex] = deepClone(state.componentData)
      // 在 undo(重做) 过程中，添加新的快照时，要将它后面的快照清理掉
      if (state.snapshotIndex < state.snapshotData.length - 1) {
        state.snapshotData = state.snapshotData.slice(0, state.snapshotIndex + 1)
      }
    }
  },
})

export default store
