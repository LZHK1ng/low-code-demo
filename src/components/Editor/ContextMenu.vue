<template>
  <div
    class="contextmenu"
    v-show="menuShow"
    :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
  >
    <ul>
      <li v-show="curComponent" @click="copy">复制</li>
      <li @click="paste">粘贴</li>
      <li v-show="curComponent" @click="cut">剪切</li>
      <li v-show="curComponent" @click="deleteComponent">删除</li>
      <li v-show="curComponent" @click="topComponent">置顶</li>
      <li v-show="curComponent" @click="bottomComponent">置底</li>
      <li v-show="curComponent" @click="upComponent">上移</li>
      <li v-show="curComponent" @click="downComponent">下移</li>
    </ul>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      copyData: null,
    }
  },
  computed: {
    ...mapState({
      menuTop: state => state.menuTop,
      menuLeft: state => state.menuLeft,
      menuShow: state => state.menuShow,
      curComponent: state => state.curComponent
    })
  },
  methods: {
    cut() {
      this.$store.commit('cut')
    },
    copy() {
      this.$store.commit('copy')
    },
    paste() {
      this.$store.commit('paste', true)
    },
    deleteComponent() {
      this.$store.commit('deleteComponent')
      this.$store.commit('recordSnapshot')
    },
    upComponent() {
      this.$store.commit('upComponent')
      this.$store.commit('recordSnapshot')
    },
    downComponent() {
      this.$store.commit('downComponent')
      this.$store.commit('recordSnapshot')
    },
    topComponent() {
      this.$store.commit('topComponent')
      this.$store.commit('recordSnapshot')
    },
    bottomComponent() {
      this.$store.commit('bottomComponent')
      this.$store.commit('recordSnapshot')
    }
  }
}

</script>
<style lang="scss" scoped>
.contextmenu {
  position: absolute;
  z-index: 1000;

  ul {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    margin: 5px 0;
    padding: 6px 0;

    li {
      font-size: 14px;
      padding: 0 20px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #606266;
      height: 34px;
      line-height: 34px;
      cursor: pointer;
      box-sizing: border-box;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
