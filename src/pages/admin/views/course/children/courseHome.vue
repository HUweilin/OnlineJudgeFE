<template>
  <el-row class="course-home" :gutter="5">
    <el-col :span="21">
      <transition name="fadeInUp" mode="out-in">
        <router-view :course="course" @update-course="init"></router-view>
      </transition>
    </el-col>
    <el-col :span="3">
      <el-menu :router="true" :default-active="currentPath">
        <el-menu-item index="" :route="{name: 'course-intro', params: {courseId: course.id}}"><i class="el-icon-fa-dashboard"></i>简介</el-menu-item>
        <el-menu-item index="announcement" :route="{name: 'course-announcement', params: {courseId: course.id}}"><i class="el-icon-fa-bullhorn"></i>公告</el-menu-item>
        <el-menu-item index="member" :route="{name: 'course-member', params: {courseId: course.id}}"><i class="el-icon-fa-group"></i>成员</el-menu-item>
        <el-menu-item index="units" :route="{name: 'course-unit-list', params: {courseId: course.id}}"><i class="el-icon-fa-list-alt"></i>单元</el-menu-item>
        <el-menu-item index="setting" :route="{name: 'course-setting', params: {courseId: course.id}}"><i class="el-icon-setting"></i>设置</el-menu-item>
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
      this.init()
    },
    methods: {
      init () {
        let path = this.$route.path
        let index = path.lastIndexOf('/') + 1
        this.currentPath = path.slice(index)
        let id = this.$route.params.courseId
        api.getCourse(id).then(res => {
          this.course = res.data.data
        })
      }
    }
  }
</script>
<style lang="less" scoped>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(0, 30px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }
</style>