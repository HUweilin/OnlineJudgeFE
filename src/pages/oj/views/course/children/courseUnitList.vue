<template>
  <div class="unit-list">
    <h3 class="unit-title">
      作业
      <span class="count">共{{courseUnits.length}}次</span>
    </h3>
    <Row type="flex" :gutter="10">
      <Col :xs="24" :sm="8" v-if="courseUnits.length" v-for="(unit, index) in courseUnits" :key="index">
        <Card style="margin: 5px 0;" padding="0">
          <div slot="title" class="status">
            <Tag type="dot" :color="COURSE_STATUS_REVERSE[unit.status].color">
              <span>{{COURSE_STATUS_REVERSE[unit.status].name}}</span>
            </Tag>
          </div>
          <div class="container">
            <div class="title" @click="goUnitProblemList(unit)">{{unit.title}}</div>
            <div class="time">{{unit.start_time | localtime('YYYY年M月D日 HH:mm')}} - {{unit.end_time | localtime('YYYY年M月D日 HH:mm')}}</div>
            <div class="desc" v-if="unit.introduction">{{unit.introduction}}</div>
            <div class="desc" v-else>暂无描述信息</div>
          </div>
        </Card>
      </Col>
      <Col :span="24" v-if="!courseUnits.length" class="no-data">
        暂无单元
        <Spin size="large" fix v-if="loading"></Spin>
      </Col>
    </Row>
  </div>
</template>
<script>
  import { mapState, mapGetters } from 'vuex'
  import { COURSE_STATUS_REVERSE } from '@/utils/constants'
  export default {
    data () {
      return {
        courseID: '',
        loading: false,
        COURSE_STATUS_REVERSE: COURSE_STATUS_REVERSE
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.courseID = this.$route.params.courseID
        this.getCourseUnitList()
      },
      // 获取单元列表
      getCourseUnitList () {
        this.loading = true
        this.$store.dispatch('getCourseUnitList').then(res => {
          this.loading = false
        }, res => {
          this.loading = false
        })
      },
      // 跳转单元习题列表
      goUnitProblemList (unit) {
        this.$store.commit('CHANGE_UNIT', {unit: unit})
        this.$router.push({name: 'course-unit-problem-list', params: {unitID: unit.id}})
      }
    },
    computed: {
      ...mapState({
        course: state => state.course.course
      }),
      ...mapGetters(['courseUnits'])
    }
  }
</script>
<style lang="less" scoped>
  .unit-list {
    /deep/ .ivu-card-head {
      border-bottom-width: 1px;
      background-color: #f6f6f8;
    }
    .unit-title {
      text-align: center;
      .count {
        display: inline-block;
        color: #fff;
        font-size: 12px;
        padding: 3px 7px;
        margin-left: 5px;
        border-radius: 3px 0 0 3px;
        background-color: rgb(64, 158, 255);
      }
    }
    .status {
      font-size: 12px;
    }
    .container {
      display: inline-block;
      width: 100%;
      .title {
        display: inline-block;
      	color: rgb(64, 158, 255);
        font-size: 18px;
        margin: 5px 0 5px 5px;
        cursor: pointer;
        &:hover {
          color: #000;
        }
      }
      .time {
        font-size: 12px;
      }
      .desc {
      	font-size: 12px;
      	color: #808080;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin: 7px 0;
      }
    }
    .no-data {
      height: 40px;
      line-height: 40px;
      text-align: center;
      position: relative;
    }
  }
</style>