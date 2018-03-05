<template>
  <div class="flex-container">
    <div id="main">
      <Panel shadow>
        <div slot="title">{{title}}</div>
        <div slot="extra">
          <ul class="filter">
            <li>
              <Dropdown @on-click="handleResultChange">
                <span>{{status}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">All</Dropdown-item>
                  <Dropdown-item v-for="status in Object.keys(JUDGE_STATUS)" :key="status" :name="status">
                    {{JUDGE_STATUS[status].name}}
                  </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </li>

            <li>
              <Dropdown @on-click="handleLangChange">
                <span>{{language}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">All</Dropdown-item>
                  <Dropdown-item v-for="lang in Object.keys(SUBMISSION_LANGUAGE)" :key="lang" :name="lang">
                    {{SUBMISSION_LANGUAGE[lang]}}
                  </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </li>

            <li>
              <i-switch size="large" v-model="formFilter.myself" @on-change="handleQueryChange">
                <span slot="open">Mine</span>
                <span slot="close">All</span>
              </i-switch>
            </li>
            <li>
              <Input v-model="formFilter.username" placeholder="搜索用户" @on-enter="handleQueryChange"/>
            </li>
            <li>
              <Input v-model="problemID" placeholder="题目编号" @on-enter="handleQueryChange"/>
            </li>
            <li>
              <Button type="info" icon="refresh" @click="getSubmissions">刷新</Button>
            </li>
          </ul>
        </div>
        <Table stripe :disabled-hover="true" :columns="columns" :data="submissions" :loading="loadingTable"></Table>
        <Pagination :total="total" :page-size="limit" @on-change="changeRoute" :current.sync="page"></Pagination>
      </Panel>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import { JUDGE_STATUS, USER_TYPE, SUBMISSION_LANGUAGE } from '@/utils/constants'
  import utils from '@/utils/utils'
  import time from '@/utils/time'
  import Pagination from '@/pages/oj/components/Pagination'

  export default {
    name: 'submissionList',
    components: {
      Pagination
    },
    data () {
      return {
        formFilter: {
          myself: false,
          result: '',
          username: '',
          language: ''
        },
        columns: [
          {
            title: '时间',
            align: 'center',
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.create_time))
            }
          },
          {
            title: '提交编号',
            align: 'center',
            render: (h, params) => {
              if (params.row.show_link) {
                return h('span', {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.$router.push('/status/' + params.row.id)
                    }
                  }
                }, params.row.id.slice(0, 12))
              } else {
                return h('span', params.row.id.slice(0, 12))
              }
            }
          },
          {
            title: '判题结果',
            align: 'center',
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: JUDGE_STATUS[params.row.result].color
                }
              }, JUDGE_STATUS[params.row.result].name)
            }
          },
          {
            title: '题目编号',
            align: 'center',
            render: (h, params) => {
              return h('span',
                {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      if (this.routeID) {
                        let pushParams = {problemID: params.row.problem}
                        pushParams[this.routeParam[1]] = this.route
                        this.$router.push(
                          {
                            name: this.toProblemRouteName,
                            params: pushParams
                          })
                      } else {
                        this.$router.push({name: this.toProblemRouteName, params: {problemID: params.row.problem}})
                      }
                    }
                  }
                },
                params.row.problem)
            }
          },
          {
            title: '运行时间',
            align: 'center',
            render: (h, params) => {
              let info
              if (params.row.statistic_info) {
                info = utils.submissionTimeFormat(params.row.statistic_info.time_cost)
              } else {
                info = '--'
              }
              return h('span', info)
            }
          },
          {
            title: '运行内存',
            align: 'center',
            render: (h, params) => {
              let info
              if (params.row.statistic_info) {
                info = utils.submissionMemoryFormat(params.row.statistic_info.memory_cost)
              } else {
                info = '--'
              }
              return h('span', info)
            }
          },
          {
            title: '语言',
            align: 'center',
            key: 'language'
          },
          {
            title: '用户',
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  'display': 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.username}
                      })
                  }
                }
              }, params.row.username)
            }
          }
        ],
        loadingTable: false,
        submissions: [],
        total: 30,
        limit: 12,
        page: 1,
        problemID: '',
        routeName: '',
        JUDGE_STATUS: '',
        rejudge_column: false,
        SUBMISSION_LANGUAGE: '',
        routeParam: [],
        routeID: '',
        func: '',
        toRouteName: '',
        toProblemRouteName: ''
      }
    },
    mounted () {
      this.init()
      this.JUDGE_STATUS = Object.assign({}, JUDGE_STATUS)
      // 去除submitting的状态 和 两个
      delete this.JUDGE_STATUS['9']
      delete this.JUDGE_STATUS['2']
      this.SUBMISSION_LANGUAGE = Object.assign({}, SUBMISSION_LANGUAGE)
    },
    methods: {
      init () {
        // 编号 若不是竞赛测验页面跳转的 则值为空
        this.getRouteID()
        // 当前路由带的参数(问号?后的)
        let query = this.$route.query
        this.problemID = query.problemID
        this.formFilter.myself = query.myself === '1'
        this.formFilter.result = query.result || ''
        this.formFilter.username = query.username || ''
        this.page = parseInt(query.page) || 1
        if (this.page < 1) {
          this.page = 1
        }
        this.routeName = this.$route.name
        this.getSubmissions()
      },
      buildQuery () {
        return {
          myself: this.formFilter.myself === true ? '1' : '0',
          result: this.formFilter.result,
          username: this.formFilter.username,
          page: this.page,
          language: this.formFilter.language
        }
      },
      getSubmissions () {
        // 获取当前的参数
        let params = this.buildQuery()
        // routeID存在则证明是在竞赛或者测验作业界面
        if (this.routeID) {
          params[this.routeParam[1]] = this.routeID
        }
        params.problem_id = this.problemID
        let offset = (this.page - 1) * this.limit
        this.loadingTable = true
        api[this.func](offset, this.limit, params).then(res => {
          let data = res.data.data
          for (let v of data.results) {
            v.loading = false
          }
          this.adjustRejudgeColumn()
          this.loadingTable = false
          this.submissions = data.results
          this.total = data.total
        }).catch(() => {
          this.loadingTable = false
        })
      },
      // 改变route， 通过监听route变化请求数据，这样可以产生route history， 用户返回时就会保存之前的状态
      changeRoute () {
        let query = utils.filterEmptyValue(this.buildQuery())
        if (this.routeID) {
          query[this.routeParam[0]] = this.routeID
        }
        query.problemID = this.problemID
        this.$router.push({
          name: this.toRouteName,
          query: utils.filterEmptyValue(query)
        })
      },
      goRoute (route) {
        this.$router.push(route)
      },
      adjustRejudgeColumn () {
        // 是竞赛 或者 非竞赛且用户不是超级用户 或者xxx 直接return
        if (!this.rejudgeColumnVisible || this.rejudge_column) {
          return
        }
        // 非竞赛且是超级管理员 或者xxx
        const judgeColumn = {
          title: 'Option',
          fixed: 'right',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                loading: params.row.loading
              },
              on: {
                click: () => {
                  this.handleRejudge(params.row.id, params.index)
                }
              }
            }, 'Rejudge')
          }
        }
        this.columns.push(judgeColumn)
        this.rejudge_column = true
      },
      handleResultChange (status) {
        this.page = 1
        this.formFilter.result = status
        this.changeRoute()
      },
      handleLangChange (language) {
        this.page = 1
        this.formFilter.language = language
        this.changeRoute()
      },
      handleQueryChange () {
        this.page = 1
        this.changeRoute()
      },
      handleRejudge (id, index) {
        this.submissions[index].loading = true
        api.submissionRejudge(id).then(res => {
          this.submissions[index].loading = false
          this.$success('Succeeded')
          this.getSubmissions()
        }, () => {
          this.submissions[index].loading = false
        })
      },
      getRouteID () {
        if (this.$route.params.contestID) {
          this.routeParam = ['contestID', 'contest_id']
          this.routeID = this.$route.params.contestID
          this.func = 'getContestSubmissionList'
          this.toRouteName = 'contest-submission-list'
          this.toProblemRouteName = 'contest-problem-details'
        } else if (this.$route.params.testID) {
          this.routeParam = ['testID', 'test_id']
          this.routeID = this.$route.params.testID
          this.func = 'getTestSubmissionList'
          this.toRouteName = 'test-submission-list'
          this.toProblemRouteName = 'test-problem-details'
        } else if (this.$route.params.homeworkID) {
          this.routeParam = ['homeworkID', 'homework_id']
          this.routeID = this.$route.params.homeworkID
          this.func = 'getHomeworkSubmissionList'
          this.toRouteName = 'homework-submission-list'
          this.toProblemRouteName = 'homework-problem-details'
        } else {
          this.routeParam = []
          this.routeID = ''
          this.func = 'getSubmissionList'
          this.toRouteName = 'submission-list'
          this.toProblemRouteName = 'problem-details'
        }
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user']),
      title () {
        if (!this.routeID) {
          return '提交状态'
        } else if (this.problemID) {
          return '题目提交情况'
        } else if (this.routeParam[0] === 'contestID') {
          return '竞赛提交状态'
        } else if (this.routeParam[0] === 'testID') {
          return '训练提交状态'
        } else if (this.routeParam[0] === 'homeworkID') {
          return '作业提交状态'
        }
      },
      status () {
        return this.formFilter.result === '' ? '状态' : JUDGE_STATUS[this.formFilter.result].name
      },
      language () {
        return this.formFilter.language === '' ? '语言' : SUBMISSION_LANGUAGE[this.formFilter.language]
      },
      rejudgeColumnVisible () {
        return (!this.routeID) && this.user.admin_type === USER_TYPE.SUPER_ADMIN
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      },
      'rejudgeColumnVisible' () {
        this.adjustRejudgeColumn()
      },
      'isAuthenticated' () {
        this.init()
      }
    }
  }
</script>

<style scoped lang="less">
  .ivu-btn-text {
    color: #57a3f3;
  }

  .flex-container {
    #main {
      flex: auto;
      margin-right: 18px;
      .filter {
        margin-right: -10px;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
    }
  }
</style>
