import Vue from 'vue'
import Vuex from 'vuex'
import { swap, deepClone, $ } from '@/utils/utils'
import toast from '@/utils/toast'
import generateID from '@/utils/generateID'
import { commonStyle, commonAttr } from '@/custom-component/component-list'
import eventBus from '@/utils/eventBus'
import { decomposeComponent } from '@/utils/style'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    editMode: 'edit', // 编译器模式 edit read
    canvasStyleData: {
      width: 900,
      height: 440,
      scale: 100
    },
    menuShow: false, // 右键菜单
    menuLeft: null,
    menuTop: null,
    componentData: [], // 画布组件数据
    curComponent: null, // 当前组件
    curComponentIndex: null,
    snapshotData: [], // 编辑器快照数据
    snapshotIndex: -1, // 快照索引
    copyData: null, // 复制粘贴剪切
    areaData: {
      style: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      components: [],
    },
    editor: null,
  },
  mutations: {
    lock({ curComponent }) {
      curComponent.isLock = true
    },
    unlock({ curComponent }) {
      curComponent.isLock = false
    },
    getEditor(state) {
      state.editor = $('#editor')
    },
    setAreaData(state, data) {
      state.areaData = data
    },
    compose({ componentData, areaData, editor }) {
      const components = []
      areaData.components.forEach(component => {
        if (component.component != 'Group') {
          components.push(component)
        } else {
          // 如果要组合的组件中，已经存在组合数据，则需要提前拆分
          const parentStyle = { ...component.style }
          const subComponents = component.propValue
          const editorRect = editor.getBoundingClientRect()

          store.commit('deleteComponent')
          subComponents.forEach(component => {
            decomposeComponent(component, editorRect, parentStyle)
            store.commit('addComponent', { component })
          })

          components.push(...component.propValue)
          store.commit('batchDeleteComponent', component.propValue)
        }
      })
      store.commit('addComponent', {
        component: {
          id: generateID(),
          component: 'Group',
          ...commonAttr,
          style: {
            ...commonStyle,
            ...areaData.style
          },
          propValue: components
        }
      })
      eventBus.$emit('hideArea')
      // 删掉组合的组件，把当前加进去的group组件设为当前组件
      store.commit('batchDeleteComponent', areaData.components)
      store.commit('setCurComponent', {
        component: componentData[componentData.length - 1],
        index: componentData.length - 1
      })
      areaData.components = []
    },
    batchDeleteComponent({ componentData }, deleteData) {
      deleteData.forEach(component => {
        for (let i = 0, len = componentData.length; i < len; i++) {
          if (component.id == componentData[i].id) {
            componentData.splice(i, 1)
            break
          }
        }
      })
    },
    decompose({ curComponent, editor }) {
      const parentStyle = { ...curComponent.style }
      const components = curComponent.propValue
      const editorRect = editor.getBoundingClientRect()
      // 删除当前组件
      store.commit('deleteComponent')
      // 把当前group组件拆分加回去
      components.forEach(component => {
        decomposeComponent(component, editorRect, parentStyle)
        store.commit('addComponent', { component })
      })
    },
    copy(state) {
      state.copyData = {
        data: deepClone(state.curComponent),
        index: state.curComponentIndex
      }
    },
    paste(state, isMouse) {
      if (!state.copyData) {
        toast('请选择组件', 'error')
        return
      }

      const data = state.copyData.data
      if (isMouse) {
        data.style.top = state.menuTop
        data.style.left = state.menuLeft
      } else {
        data.style.top += 10
        data.style.left += 10
      }

      data.id = generateID()
      store.commit('addComponent', { component: data })
      state.copyData = null
    },
    cut(state) {
      if (state.copyData) {
        store.commit('addComponent', { component: state.copyData.data, index: state.copyData.index })
        if (state.curComponentIndex >= state.copyData.index) {
          // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
          state.curComponentIndex++
        }
      }
      store.commit('copy')
      store.commit('deleteComponent')
    },
    setEditMode(state, mode) {
      state.editMode = mode
    },
    setCanvasStyle(state, style) {
      state.canvasStyleData = style
    },
    addComponent(state, { component, index }) {
      if (index !== undefined) {
        state.componentData.splice(index, 0, component)
      } else {
        state.componentData.push(component)
      }
    },
    setCurComponent(state, { component, index }) {
      state.curComponent = component
      state.curComponentIndex = index
    },
    setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
      if (top) curComponent.style.top = top
      if (left) curComponent.style.left = left
      if (width) curComponent.style.width = width
      if (height) curComponent.style.height = height
      if (rotate) curComponent.style.rotate = rotate
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
    deleteComponent(state, index) {
      if (index === undefined) {
        index = state.curComponentIndex
      }
      state.componentData.splice(index, 1)
    },
    // 上移图层
    upComponent({ componentData, curComponentIndex }) {
      if (curComponentIndex < componentData.length - 1) {
        swap(componentData, curComponentIndex, curComponentIndex + 1)
      } else {
        toast('已经到顶了', 'error')
      }
    },
    // 下移图层
    downComponent({ componentData, curComponentIndex }) {
      if (curComponentIndex > 0) {
        swap(componentData, curComponentIndex, curComponentIndex - 1)
      } else {
        toast('已经到底了', 'error')
      }
    },
    topComponent({ componentData, curComponentIndex }) {
      if (curComponentIndex < componentData.length - 1) {
        swap(componentData, curComponentIndex, componentData.length - 1)
      } else {
        toast('已经到顶了', 'error')
      }
    },
    bottomComponent({ componentData, curComponentIndex }) {
      if (curComponentIndex > 0) {
        swap(componentData, curComponentIndex, 0)
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
    },
    addEvent({ curComponent }, { event, param }) {
      curComponent.events[event] = param
    },
    removeEvent({ curComponent }, event) {
      // console.log(curComponent)
      delete curComponent.events[event]
    },
    addAnimation({ curComponent }, animate) {
      curComponent.animations.push(animate)
    },
    removeAnimation({ curComponent }, index) {
      curComponent.animations.splice(index, 1)
    }
  },
})

export default store
