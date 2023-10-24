import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    editMode: 'read', // 编译器模式 edit read
    canvasStyleData: {
      width: 900,
      height: 440,
    },
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
    }
  },
})

export default store
