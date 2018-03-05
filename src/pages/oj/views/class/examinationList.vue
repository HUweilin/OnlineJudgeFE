<template>
  <Row type="flex">
    <Col :span="24">
    <Panel id="contest-card" shadow>
      <div slot="title">课堂小练习</div>
      <div slot="extra">
        <ul class="filter">	
          <li>
            <Dropdown @on-click="onStatusChange">
              <span>{{query.status === '' ? '状态' : EXAMINATION_STATUS_REVERSE[query.status].name}}
                <Icon type="arrow-down-b"></Icon>
              </span>
              <Dropdown-menu slot="list">
                <Dropdown-item name="">所有</Dropdown-item>
                <Dropdown-item name="0">进行中</Dropdown-item>
                <Dropdown-item name="1">等待</Dropdown-item>
                <Dropdown-item name="-1">已结束</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>
          </li>
          <li>
            <Input @on-enter="changeRoute" @on-click="changeRoute" v-model="query.keyword"
                   icon="ios-search-strong" placeholder="关键字"/>
          </li>
        </ul>
      </div>
      <Table style="width: 100%; font-size: 16px;"
        :columns="tableColumns"
        :data="testList"
        :loading="loading"
        :no-data-text="暂无竞赛"
        disabled-hover></Table>
    </Panel>
    <Pagination :total="total" :pageSize="limit" @on-change="getExamList" :current.sync="page"></Pagination>
    </Col>
  </Row>

</template>

<script>
  import Pagination from '@/pages/oj/components/Pagination'
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import { mapGetters } from 'vuex'
  import time from '@/utils/time'
  import { EXAMINATION_STATUS_REVERSE, EXAMINATION_TYPE } from '@/utils/constants'
  export default {
    name: 'class-list',
    components: {
      Pagination
    },
    data () {
      return {
        testList: [{id: '1', title: '测试', start_time: '2018-1-2', end_time: '2018-4-1', status: 0, created_by: {username: '2b'}, examination_type: 'Public'}],
        tableColumns: [
          {
            title: '编号',
            key: 'id',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    // 跳转到该测验题目列表
                    this.goTestDetail(params.row)
                  }
                }
              }, params.row.id)
            }
          },
          {
            title: '题目',
            width: '25%',
            align: 'center',
            ellipsis: true,
            render: (h, params) => {
              const display = (params.row.examination_type !== 'Public') ? 'inline-block' : 'none'
              return h('div', {
                on: {
                  click: () => {
                    this.goTestDetail(params.row)
                  }
                },
                style: {
                  cursor: 'pointer'
                }
              }, [
                params.row.title,
                h('Icon', {
                  props: {
                    type: 'ios-locked-outline',
                    size: '20'
                  },
                  style: {
                    'margin-left': '3px',
                    display: display
                  }
                })
              ])
            }
          },
          {
            title: '开始时间',
            align: 'center',
            render: (h, params) => {
              // 可改进?
              return h('span', time.utcToLocal(params.row.start_time, 'YYYY-M-D HH:mm'))
            }
          },
          {
            title: '结束时间',
            align: 'center',
            render: (h, params) => {
              // 可改进?
              return h('span', time.utcToLocal(params.row.end_time, 'YYYY-M-D HH:mm'))
            }
          },
          {
            title: '状态',
            align: 'center',
            render: (h, params) => {
              return h('Tag', {
                props: {
                  type: 'dot',
                  color: `${EXAMINATION_STATUS_REVERSE[params.row.status].color}`
                }
              }, EXAMINATION_STATUS_REVERSE[params.row.status].name)
            }
          },
          {
            title: '创建者',
            align: 'center',
            render: (h, params) => {
              return params.row.created_by.username
            }
          }
        ],
        query: {
          status: '',
          keyword: ''
        },
        EXAMINATION_STATUS_REVERSE: EXAMINATION_STATUS_REVERSE,
        total: 0,
        page: 1,
        limit: 8,
        loading: false
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        let route = this.$route.query
        this.query.status = route.status || ''
        this.query.keyword = route.keyword || ''
        this.page = parseInt(route.page) || 1
        this.getExamList()
      },
      getExamList (page = 1) {
        this.loading = true
        let offset = (page - 1) * this.limit
        let func = this.$route.name === 'testing-list' ? 'getTestList' : 'getHomeworkList'
        api[func](offset, this.limit, this.query).then(res => {
          this.testList = res.data.data.results
          this.total = res.data.data.total
          this.loading = false
        }, res => {
          this.loading = false
        })
      },
      changeRoute () {
        let query = Object.assign({}, this.query)
        query.page = this.page
        this.$router.push({
          name: this.$route.name,
          query: utils.filterEmptyValue(query)
        })
      },
      onStatusChange (status) {
        this.query.status = status
        this.page = 1
        this.changeRoute()
      },
      goTestDetail (test) {
        if (test.test_type !== EXAMINATION_TYPE.PUBLIC && !this.isAuthenticated) {
          this.$error('请先登录')
          this.$store.dispatch('changeModalStatus', {visible: true})
        } else {
          let path = this.$route.name === 'testing-list' ? 'test-details' : 'homework-details'
          let id = this.$route.name === 'testing-list' ? 'testID' : 'homeworkID'
          if (id === 'testID') {
            this.$router.push({name: path, params: {'testID': test.id}})
          } else {
            this.$router.push({name: path, params: {'homeworkID': test.id}})
          }
        }
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user'])
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      }
    }

  }
</script>
<style lang="less" scoped>
</style>
