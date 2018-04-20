<template>
  <div class="course-list">
    <Panel title="课程列表">
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="关键词">
        </el-input>
      </div>
      <el-table 
      v-loading="loading" 
      :data="courseList" 
      style="width: 100%" 
      @row-dblclick="goCourse">
        <el-table-column prop="id" label="编号" width="100">
        </el-table-column>
        <el-table-column prop="title" label="课程名称">
        </el-table-column>
        <el-table-column label="开始时间">
          <template slot-scope="scope">{{scope.row.start_time | localtime}}</template>
        </el-table-column>
        <el-table-column label="结束时间">
          <template slot-scope="scope">{{scope.row.end_time | localtime}}</template>
        </el-table-column>
        <el-table-column prop="total_student" label="学生总数"></el-table-column>
        <!-- <el-table-column
          label="当前状态"
          width="130">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '-1' ? 'danger' : scope.row.status === '0' ? 'success' : 'primary'">
              {{ scope.row.status | contestStatus}}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column width="100" label="是否可见">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible" @change="handleVisibleSwitch(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column width="200" label="操作">
          <div slot-scope="scope">
            <icon-btn name="单元" icon="list-alt" @click.native="goCourseUnit(scope.row.id)"></icon-btn>
            <icon-btn name="公告" icon="info-circle" 
            @click.native="goCourseAnnouncement(scope.row.id)"></icon-btn>
            <icon-btn name="设置" icon="gear" @click.native="goCourseSetting(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
  </div>
</template>
<script>
  import api from '../../api.js'
  export default {
    name: 'courseList',
    data () {
      return {
        keyword: '',
        loading: false,
        pageSize: 10,
        currentPage: 1,
        // 总页数
        total: 0,
        // 课程列表
        courseList: []
      }
    },
    mounted () {
      this.getCourseList(this.currentPage)
    },
    methods: {
      getCourseList (page = 1) {
        this.loading = true
        api.getCourseList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.courseList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getCourseList(page)
      },
      // 更改课程可见属性
      handleVisibleSwitch (row) {
        api.editCourse(row)
      },
      // 双击一行跳转到课程简介页面
      goCourse (row, e, column) {
        this.$router.push({name: 'course-intro', params: {courseId: row.id}})
      },
      // 跳转课程单元
      goCourseUnit (id) {
        this.$router.push({name: 'course-unit-list', params: {courseId: id}})
      },
      // 跳转课程公告
      goCourseAnnouncement (id) {
        this.$router.push({name: 'course-announcement', params: {courseId: id}})
      },
      // 跳转课程设置
      goCourseSetting (id) {
        this.$router.push({name: 'course-setting', params: {courseId: id}})
      }
    },
    watch: {
      'keyword' () {
        this.getCourseList(1)
      }
    }
  }
</script>
<style lang="less" scoped></style>