// 公共样式
const commonStyle = {
  rotate: '',
  opacity: 1,
}

// 编辑器左侧列表组件
const list = [
  {
    component: 'v-text', // 组件名称，提前注册到vue
    label: '文字', // 左侧组件列表显示名字
    propValue: '文字', // 组件使用值
    icon: 'el-icon-edit', // 显示图标
    animations: [], // 动画列表
    events: {}, // 事件列表
    style: { // 样式
      width: 200,
      height: 33,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '',
      letterSpacing: 0,
      textAlingn: '',
      color: '',
    },
  },
  {
    component: 'v-button',
    label: '按钮',
    propValue: '按钮',
    icon: 'el-icon-thumb',
    animations: [],
    events: {},
    style: {
      width: 100,
      height: 34,
      borderWidth: '',
      borderColor: '',
      borderRadius: '',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '',
      letterSpacing: 0,
      textAlign: '',
      color: '',
      backgroundColor: '',
    },
  },
  {
    component: 'Picture',
    label: '图片',
    icon: 'el-icon-picture',
    propValue: require('@/assets/title.jpg'),
    animations: [],
    events: {},
    style: {
      width: 300,
      height: 200,
      borderRadius: '',
    },
  },
]

list.forEach(item => {
  item.style = { ...item.style, ...commonStyle }
})

export default list
