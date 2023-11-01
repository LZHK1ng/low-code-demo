<template>
  <div class="attr-list">
    <el-form>
      <el-form-item
        v-for="(key, index) in styleKeys"
        :key="index"
        :label="map[key]"
      >
        <el-color-picker
          v-if="key == 'borderColor'"
          v-model="curComponent.style[key]"
        ></el-color-picker>
        <el-color-picker
          v-else-if="key == 'color'"
          v-model="curComponent.style[key]"
        ></el-color-picker>
        <el-color-picker
          v-else-if="key == 'backgroundColor'"
          v-model="curComponent.style[key]"
        ></el-color-picker>
        <el-select
          v-else-if="key == 'textAlign'"
          v-model="curComponent.style[key]"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-input type="number" v-else v-model="curComponent.style[key]" />
      </el-form-item>
      <el-form-item
        label="内容"
        v-if="curComponent && !excludes.includes(curComponent.component)"
      >
        <el-input type="textarea" v-model="curComponent.propValue"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      excludes: ['Picture'], // 不显示内容的组件
      map: {
        left: 'x 坐标',
        top: 'y 坐标',
        height: '高',
        width: '宽',
        color: '颜色',
        backgroundColor: '背景色',
        borderWidth: '边框宽度',
        borderColor: '边框颜色',
        borderRadius: '边框半径',
        fontSize: '字体大小',
        fontWeight: '字体粗细',
        lineHeight: '行高',
        letterSpacing: '字间距',
        textAlign: '对齐方式',
        opacity: '透明度',
        rotate: '旋转角度',
      },
      options: [
        {
          label: '左对齐',
          value: 'left'
        },
        {
          label: '居中',
          value: 'center'
        },
        {
          label: '右对齐',
          value: 'right'
        },
      ]
    }
  },
  computed: {
    ...mapState({
      curComponent: state => state.curComponent
    }),
    styleKeys() {
      // console.log(this.curComponent ? Object.keys(this.curComponent.style) : [])
      return this.curComponent ? Object.keys(this.curComponent.style) : []
    }
  }
}
</script>
<style lang="scss" scoped>
.attr-list {
  overflow: auto;
  padding: 20px;
  padding-top: 0;
  height: 100%;
}
</style>
