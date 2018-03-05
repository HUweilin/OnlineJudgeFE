<template>
  <Panel shadow>
    <div slot="title">{{ examination.title }}</div>
    <Table :columns="columns" :data="dataRank" disabled-hover></Table>
    <Pagination :total="total"
                :page-size.sync="limit"
                :current.sync="page"
                @on-change="getExamRankData"
                @on-page-size-change="getExamRankData"
                show-sizer></Pagination>
  </Panel>
</template>
<script>
  import Pagination from '@oj/components/Pagination'
  import api from '@oj/api'
  import { mapActions, mapState } from 'vuex'
  export default {
    name: 'exam-rank',
    components: {
      Pagination
    },
    data () {
      return {
        total: 0,
        limit: 10,
        page: 1,
        examID: '',
        routeParamName: '',
        func: '',
        dataRank: [],
        columns: [
          {
            title: '排名',
            align: 'center',
            width: 60,
            render: (h, params) => {
              return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
            }
          },
          {
            title: '用户',
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  display: 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.user.username}
                      })
                  }
                }
              }, params.row.user.username)
            }
          },
          // 有编程题和非编程题 字段怎么选择
          {
            title: '通过率',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', {}, [
                h('span', {}, params.row.accepted_number + ' / '),
                h('a', {
                  on: {
                    click: () => {
                      this.$router.push({
                        name: 'contest-submission-list',
                        query: {username: params.row.user.username}
                      })
                    }
                  }
                }, params.row.submission_number)
              ])
            }
          },
          {
            title: 'TotalTime',
            align: 'center',
            render: (h, params) => {
              return h('span', this.parseTotalTime(params.row.total_time))
            }
          }
        ]
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      ...mapActions(['getTestProblems', 'getHomeworkProblems']),
      init () {
        this.setExamData()
        this.getExamRankData()
        if (this.examinationProblems.length === 0) {
          let fun = this.routeParamName === 'test_id' ? 'getTestProblems' : 'getHomeworkProblems'
          this[fun]().then((res) => {
            // 不适合添加成列 题目不会少
            this.addTableColumns(res.data.data)
          })
        } else {
          this.addTableColumns(this.examinationProblems)
        }
      },
      getExamRankData (page = 1) {
        let offset = (page - 1) * this.limit
        let params = {
          offset,
          limit: this.limit
        }
        // 测验的id
        params[this.routeParamName] = this.examID
        api[this.func].then(res => {
          this.total = res.data.data.total
          this.applyToTable(res.data.data.results)
        })
      },
      applyToTable () {
        // 对传送过来的答题情况进行处理 由于有编程题和非编程题 要分开讨论
      },
      addTableColumns () {},
      // 由于共用组件 所以要判断路由的参数是testID或者homeworkID
      setExamData () {
        if (this.$route.params.testID !== '' || this.$route.params.testID !== undefined) {
          this.routeParamName = 'test_id'
          this.examID = this.$route.params.testID
          this.func = 'getTestRank'
        } else if (this.$route.params.homeworkID !== '' || this.$route.params.homeworkID !== undefined) {
          this.routeParamName = 'homework_id'
          this.examID = this.$route.params.homeworkID
          this.func = 'getHomeworkRank'
        }
      }
    },
    computed: {
      ...mapState({
        'examination': state => state.examination.examination,
        'examinationProblems': state => state.examination.examinationProblems
      })
    }
  }
</script>
<style lang="less" scoped></style>