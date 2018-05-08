<template>
  <Row type="flex">
    <Col :span="24">
      <Panel>
        <div slot="title" style="font-weight: bold;">
          {{course.title}}
          <span class="created-user hidden-xs"> — {{course.created_by.username}}</span>
        </div>
        <div slot="extra">
          <Tag type="dot" :color="countdownColor">
            <span id="countdown">{{countDown}}</span>
          </Tag>
          <Icon type="person-stalker" color="#409EFF" size="20" class="hidden-xs"></Icon>
          <span class="num hidden-xs">{{course.total_student}}人加入学习</span>
          <Button type="error" size="small" @click.stop="exitCourse">退出课程</Button>
        </div>
        <div class="course-menu">
          <Menu mode="horizontal" :active-name="routeName" @on-select="handleRoute">
            <!-- 这里的name是路由名称name 不是path -->
            <Menu-item name="course-details">
              简介
            </Menu-item>
            <Menu-item name="course-announcement-list">
              公告
            </Menu-item>
            <Menu-item name="course-unit-list">
              单元
            </Menu-item>
            <Menu-item name="course-unit-problem-list" v-show="unit.title">
              {{unit.title}}
            </Menu-item>
          </Menu>
        </div>
        <div class="course-container">
          <!-- 子页面 B -->
          <transition name="fade" mode="out-in">
            <router-view></router-view>
            <div class="course-intro" v-if="routeName === 'course-details'">
              <img class="course-img hidden-xs" :src="course.picture" :alt="course.title">
              <h4 class="title">课程简介</h4>
              <div class="info">
                <div class="title">{{course.title}}</div>
                <div class="data-item">
                  <span class="icon"><Icon type="person"></Icon>&nbsp;教师</span>
                  <span class="data" v-if="course.created_by">{{course.created_by.username}}</span>
                </div>
                <div class="data-item">
                  <span class="icon"><Icon type="calendar"></Icon>&nbsp;开始</span>
                  <span class="data">{{course.start_time | localtime}}</span>
                </div>
                <div class="data-item">
                  <span class="icon"><Icon type="calendar"></Icon>&nbsp;结束</span>
                  <span class="data">{{course.end_time | localtime}}</span>
                </div>
                <div class="data-item">
                  <span class="icon"><Icon type="person-stalker"></Icon>&nbsp;学生数</span>
                  <span class="data">{{course.total_student}}</span>
                </div>
              </div>
              <h4 class="title">课程概述</h4>
              <div class="info">
                <div class="title">{{course.introduction}}</div>
              </div>
            </div>
          </transition>

          <!-- 子页面 E -->
        </div>
      </Panel>
    </Col>
  </Row>
</template>
<script>
  import moment from 'moment'
  import api from '@oj/api'
  import { types } from '@/store'
  import { mapState, mapGetters } from 'vuex'
  import { COURSE_STATUS_REVERSE } from '@/utils/constants'
  import utils from '@/utils/utils.js'
  export default {
    data () {
      return {
        routeName: ''
      }
    },
    mounted () {
      this.routeName = this.$route.name
      this.courseID = this.$route.params.courseID
      // 里层的请求已经将路由携带的参数(课程ID)传递过去了
      this.$store.dispatch('getCourse').then(res => {
        let endTime = moment(res.data.data.end_time)
        // 如果结束时间未到 则每秒加1 好计算剩余时间
        let now = moment()
        if (endTime.isAfter(now)) {
          this.timer = setInterval(() => {
            this.$store.commit(types.COURSE_NOW_ADD_1S)
          }, 1000)
        }
      })
    },
    methods: {
      // 路由跳转
      handleRoute (route) {
        let params = utils.filterEmptyValue({courseID: this.courseID, unitID: this.unit.id})
        this.$router.push({name: route, params: params})
      },
      // 退出课程
      exitCourse () {
        this.$Modal.confirm({
          content: '是否确认退出课程' + this.course.title + '，请谨慎操作',
          onOk: () => {
            // 发送请求 退出课程
            api.exitCourse(this.course.id).then(res => {
              this.$success('已退出课程')
              this.$router.push({name: 'course-list'})
            })
          }
        })
      }
    },
    computed: {
      ...mapState({
        course: state => state.course.course,
        unit: state => state.course.unit
      }),
      ...mapGetters(['courseStatus', 'countDown']),
      countdownColor () {
        if (this.courseStatus) {
          // 使用竞赛的状态color
          return COURSE_STATUS_REVERSE[this.courseStatus].color
        }
      }
    },
    watch: {
      '$route' (newVal) {
        this.routeName = newVal.name
        this.courseID = newVal.params.courseID
      }
    },
    beforeDestroy () {
      clearInterval(this.timer)
      // 清除课程 对应的单元也清除了
      this.$store.commit(types.CLEAR_COURSE)
    }
  }
</script>
<style lang="less" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  .created-user {
    font-size: 14px;
    font-weight: normal;
  }
  .num {
    font-size: 12px;
    margin-left: 5px;
    margin-right: 5px;
  }
  .course-intro {
    position: relative;
    .course-img {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 200px;
      height: 150px;
    }
    > .title {
      font-weight: bold;
      padding: 20px 0;
      margin: 0 10px;
      border-bottom: 1px solid #eee;
    }
    .info {
      padding: 10px;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      .title {
        margin: 10px 0;
        font-size: 16px;
      }
      .data-item {
        display: inline-block;
      	font-size: 12px;
        color: #4a4a4a;
        margin: 0 15px 5px 0;
        .icon {
          display: inline-block;
          padding: 3px 9px;
          background-color: #f5f5f5;
          border-radius: 3px;
          margin-right: 5px;
        }
        .data {
          color: #0a0a0a;
        }
      }
    }
  }
</style>