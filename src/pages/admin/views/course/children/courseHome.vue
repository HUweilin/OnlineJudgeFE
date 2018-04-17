<template>
  <el-row class="course-home" :gutter="10">
    <el-col :span="21">
      <router-view :course="course"></router-view>
    </el-col>
    <el-col :span="3">
      <el-menu :router="true" :default-active="currentPath">
        <el-menu-item index="intro"><i class="el-icon-fa-dashboard"></i>简介</el-menu-item>
        <el-menu-item index="announcement"><i class="el-icon-fa-bullhorn"></i>公告</el-menu-item>
        <el-menu-item index="member"><i class="el-icon-fa-group"></i>成员</el-menu-item>
        <el-menu-item index="units"><i class="el-icon-fa-list-alt"></i>单元</el-menu-item>
        <el-menu-item index="setting"><i class="el-icon-setting"></i>设置</el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>
<script>
  import api from '../../../api.js'
  export default {
    data () {
      return {
        course: {},
        currentPath: ''
      }
    },
    mounted () {
      let path = this.$route.path
      let index = path.lastIndexOf('/') + 1
      this.currentPath = path.slice(index)
      let id = this.$route.params.courseId
      api.getCourse(id).then(res => {
        this.course = res.data.data
      })
    }
  }
</script>
<style lang="less" scoped></style>