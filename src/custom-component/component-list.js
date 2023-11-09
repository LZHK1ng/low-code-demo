// 公共样式
export const commonStyle = {
  rotate: 0,
  opacity: 1,
}

export const commonAttr = {
  animations: [],
  events: {},
  groupStyle: {}, // 当一个组件为Group的子组件时使用
}

// 编辑器左侧列表组件
const list = [
  {
    component: 'v-text', // 组件名称，提前注册到vue
    label: '文字', // 左侧组件列表显示名字
    propValue: '文字', // 组件使用值
    icon: 'el-icon-edit', // 显示图标
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
    style: {
      width: 300,
      height: 200,
      borderRadius: '',
    },
  },
]

for (let i = 0, len = list.length; i < len; i++) {
  const item = list[i]
  item.style = { ...item.style, ...commonStyle }
  list[i] = { ...commonAttr, ...item }
}

export default list
