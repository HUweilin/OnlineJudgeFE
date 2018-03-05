<template>
  <div class="flex-container">
    <div id="test-main">
      <!--children-->
      <transition name="fadeInUp">
        <router-view></router-view>
      </transition>
      <!--children end-->
      <div class="flex-container" v-if="route_name === 'test-details' || route_name === 'homework-details'">
        <template>
          <div id="test-desc">
            <Panel :padding="20" shadow>
              <div slot="title">
                {{examination.title}}
              </div>
              <div slot="extra">
                <Tag type="dot" :color="countdownColor">
                  <span id="countdown">{{examCountdown}}</span>
                </Tag>
              </div>
              <div v-html="examination.description" class="markdown-body"></div>
              <div v-if="passwordVisible" class="test-password">
                <Input v-model="examPassword" type="password"
                       placeholder="竞赛密码" class="test-password-input" 
                       @on-enter="checkPassword"/>
                <Button type="info" @click="checkPassword" :loading="btnLoading">进入</Button>
              </div>
            </Panel>
            <Table :columns="columns" :data="table" disabled-hover style="margin-bottom: 40px;"></Table>
          </div>
        </template>
      </div>

    </div>
    <div v-show="showMenu" id="test-menu">
      <VerticalMenu @on-click="handleRoute">
        <VerticalMenu-item :disabled="examMenuDisabled"
                           :route="jumpProblemList">
          <Icon type="ios-photos"></Icon>
          题目
        </VerticalMenu-item>
        <!-- 暂时直接显示提交状态 -->
        <VerticalMenu-item :disabled="examMenuDisabled"
                           :route="jumpSubmissionList">
          <Icon type="navicon-round"></Icon>
          提交状态
        </VerticalMenu-item>
        <!-- 暂时直接显示排行榜 -->
        <VerticalMenu-item :disabled="examMenuDisabled" :route="jumpRank">
          <Icon type="stats-bars"></Icon>
          排行榜
        </VerticalMenu-item>

        <VerticalMenu-item :route="originRoute">
          <Icon type="home"></Icon>
          主页
        </VerticalMenu-item>

        <VerticalMenu-item v-if="isExamAdmin"
                           :route="{name: 'acm-helper', params: {contestID: contestID}}">
          <Icon type="ios-paw"></Icon>
          帮助
        </VerticalMenu-item>
      </VerticalMenu>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import api from '@oj/api'
  import { mapState, mapGetters } from 'vuex'
  import { types } from '@/store'
  import { EXAMINATION_STATUS_REVERSE, EXAMINATION_STATUS } from '@/utils/constants'
  import time from '@/utils/time'

  export default {
    name: 'testingDetail',
    data () {
      return {
        EXAMINATION_STATUS: EXAMINATION_STATUS,
        route_name: '',
        btnLoading: false,
        examID: '',
        examPassword: '',
        columns: [
          {
            title: '开始时间',
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.start_time))
            }
          },
          {
            title: '结束时间',
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.end_time))
            }
          },
          {
            title: '类型',
            key: 'examination_type'
          },
          {
            title: '创建者',
            render: (h, data) => {
              return h('span', data.row.created_by.username)
            }
          }
        ]
      }
    },
    mounted () {
      this.examID = this.$route.params.testID || this.$route.params.homeworkID
      this.route_name = this.$route.name
      let func = !this.judgeRoute ? 'getTest' : 'getHomework'
      // 里层的请求已经将路由携带的参数传递过去了
      this.$store.dispatch(func).then(res => {
        let data = res.data.data
        let endTime = moment(data.end_time)
        if (endTime.isAfter(moment(data.now))) {
          this.timer = setInterval(() => {
            this.$store.commit(types.EXAM_NOW_ADD_1S)
          }, 1000)
        }
      }, res => {
        // 测试
        // this.timer = setInterval(() => {
        //   this.$store.commit(types.EXAM_NOW_ADD_1S)
        // }, 1000)
      })
    },
    methods: {
      handleRoute (route) {
        this.$router.push(route)
      },
      checkPassword () {
        if (this.examPassword === '') {
          this.$error('密码不能为空!')
          return
        }
        this.btnLoading = true
        let func = this.route_name === 'test-details' ? 'checkTestPassword' : 'checkHomeworkPassword'
        api[func](this.examID, this.examPassword).then((res) => {
          this.$success('正确')
          this.$store.commit(types.CONTEST_ACCESS, {access: true})
          this.btnLoading = false
        }, (res) => {
          this.btnLoading = false
        })
      }
    },
    computed: {
      ...mapState({
        showMenu: state => state.examination.itemVisible.menu,
        examination: state => state.examination.examination,
        table: state => [state.examination.examination]
      }),
      ...mapGetters(['examinationStatus', 'examMenuDisabled', 'passwordVisible', 'examCountdown', 'isExamAdmin']),
      countdownColor () {
        if (this.examinationStatus) {
          return EXAMINATION_STATUS_REVERSE[this.examinationStatus].color
        }
      },
      judgeRoute () {
        if (this.route_name.indexOf('test-') < 0) {
          return true
        } else {
          return false
        }
      },
      originRoute () {
        if (this.judgeRoute) {
          return {name: 'homework-details', params: {homeworkID: this.examID}}
        } else {
          return {name: 'test-details', params: {testID: this.examID}}
        }
      },
      jumpProblemList () {
        if (this.judgeRoute) {
          return {name: 'homework-problem-list', params: {homeworkID: this.examID}}
        } else {
          return {name: 'test-problem-list', params: {testID: this.examID}}
        }
      },
      jumpSubmissionList () {
        if (this.judgeRoute) {
          return {name: 'homework-submission-list'}
        } else {
          return {name: 'test-submission-list'}
        }
      },
      jumpRank () {
        if (this.judgeRoute) {
          return {name: 'homework-rank', params: {homeworkID: this.examID}}
        } else {
          return {name: 'test-rank', params: {testID: this.examID}}
        }
      }
    },
    watch: {
      '$route' (newVal) {
        this.route_name = newVal.name
        this.examID = newVal.params.testID || newVal.params.homeworkID
      }
    },
    beforeDestroy () {
      clearInterval(this.timer)
      this.$store.commit(types.CLEAR_EXAMINATION)
    }
  }
</script>

<style scoped lang="less">
  pre {
    display: inline-block;
  }

  #countdown {
    font-size: 16px;
  }

  .flex-container {
    #test-main {
      flex: 1 1;
      #test-desc {
        flex: auto;
      }
    }
    #test-menu {
      flex: none;
      width: 210px;
      margin-left: 20px;
    }
    .test-password {
      margin-top: 20px;
      margin-bottom: -10px;
      &-input {
        width: 200px;
        margin-right: 10px;
      }
    }
  }
</style>
