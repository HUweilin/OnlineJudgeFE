<template>
  <Row type="flex">
    <Col :span="24">
    <Panel id="contest-card" shadow>
      <div slot="title">{{query.rule_type === '' ? '所有' : query.rule_type}} 竞赛</div>
      <div slot="extra">
        <ul class="filter">
          <li>
            <Dropdown @on-click="onRuleChange">
              <span>{{query.rule_type === '' ? '类别' : query.rule_type}}
                <Icon type="arrow-down-b"></Icon>
              </span>
              <Dropdown-menu slot="list">
                <Dropdown-item name="">所有</Dropdown-item>
                <Dropdown-item name="OI">OI</Dropdown-item>
                <Dropdown-item name="ACM">ACM</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>
          </li>
          <li>
            <Dropdown @on-click="onStatusChange">
              <span>{{query.status === '' ? '状态' : CONTEST_STATUS_REVERSE[query.status].name}}
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
            <Input id="keyword" @on-enter="changeRoute" @on-click="changeRoute" v-model="query.keyword"
                   icon="ios-search-strong" placeholder="关键字"/>
          </li>
        </ul>
      </div>
      <Table style="width: 100%; font-size: 16px;"
        :columns="tableColumns"
        :data="contests"
        :loading="loading"
        :no-data-text="暂无竞赛"
        disabled-hover></Table>
    </Panel>
    <Pagination :total="total" :pageSize="limit" @on-change="getContestList" :current.sync="page"></Pagination>
    </Col>
  </Row>

</template>

<script>
  import api from '@oj/api'
  import { mapGetters } from 'vuex'
  import utils from '@/utils/utils'
  import Pagination from '@/pages/oj/components/Pagination'
  import time from '@/utils/time'
  import { CONTEST_STATUS_REVERSE, CONTEST_TYPE } from '@/utils/constants'

  const limit = 8

  export default {
    name: 'contest-list',
    components: {
      Pagination
    },
    data () {
      return {
        page: 1,
        query: {
          status: '',
          keyword: '',
          rule_type: ''
        },
        limit: limit,
        total: 0,
        rows: '',
        contests: [],
        CONTEST_STATUS_REVERSE: CONTEST_STATUS_REVERSE,
//      for password modal use
        cur_contest_id: '',
        loading: true,
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
                    // this.$router.push({name: 'contest-details', params: {}})
                    this.goContest(params.row)
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
              const display = (params.row.contest_type !== 'Public') ? 'inline-block' : 'none'
              return h('div', {
                on: {
                  click: () => {
                    this.goContest(params.row)
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
                  color: `${CONTEST_STATUS_REVERSE[params.row.status].color}`
                }
              }, CONTEST_STATUS_REVERSE[params.row.status].name)
            }
          },
          {
            title: '类型',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  size: 'small',
                  shape: 'circle'
                },
                on: {
                  click: () => {
                    this.onRuleChange(params.row.rule_type)
                  }
                }
              }, params.row.rule_type)
            }
          },
          {
            title: '创建者',
            align: 'center',
            render: (h, params) => {
              return params.row.created_by.username
            }
          }
        ]
      }
    },
    beforeRouteEnter (to, from, next) {
      api.getContestList(0, limit).then((res) => {
        next((vm) => {
          vm.contests = res.data.data.results
          vm.total = res.data.data.total
          vm.loading = false
          // console.log(vm.contests)
        })
      }, (res) => {
        next((vm) => {
          vm.loading = false
        })
      })
    },
    methods: {
      init () {
        let route = this.$route.query
        this.query.status = route.status || ''
        this.query.rule_type = route.rule_type || ''
        this.query.keyword = route.keyword || ''
        this.page = parseInt(route.page) || 1
        this.getContestList()
      },
      getContestList (page = 1) {
        let offset = (page - 1) * this.limit
        api.getContestList(offset, this.limit, this.query).then((res) => {
          this.contests = res.data.data.results
          this.total = res.data.data.total
          this.loading = false
        })
      },
      changeRoute () {
        let query = Object.assign({}, this.query)
        query.page = this.page
        this.$router.push({
          name: 'contest-list',
          query: utils.filterEmptyValue(query)
        })
      },
      onRuleChange (rule) {
        this.query.rule_type = rule
        this.page = 1
        this.changeRoute()
      },
      onStatusChange (status) {
        this.query.status = status
        this.page = 1
        this.changeRoute()
      },
      goContest (contest) {
        this.cur_contest_id = contest.id
        // 如果不是公共类型且处于未登录状态进入语句
        if (contest.contest_type !== CONTEST_TYPE.PUBLIC && !this.isAuthenticated) {
          this.$error('请先登录')
          this.$store.dispatch('changeModalStatus', {visible: true})
        } else {
          this.$router.push({name: 'contest-details', params: {contestID: contest.id}})
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
  #contest-card {
    #keyword {
      width: 80%;
      margin-right: 30px;
    }
    #no-contest {
      text-align: center;
      font-size: 16px;
      padding: 20px;
    }
    #contest-list {
      > li {
        padding: 20px;
        border-bottom: 1px solid rgba(187, 187, 187, 0.5);

        .trophy {
          height: 40px;
          margin-left: 10px;
          margin-right: -20px;
        }
        .contest-main {
          .title {
            font-size: 18px;
            a.entry {
              color: #495060;
              &:hover {
                color: #2d8cf0;
                border-bottom: 1px solid #2d8cf0;
              }
            }
          }
          li {
            display: inline-block;
            padding: 10px 0 0 10px;
            &:first-child {
              padding: 10px 0 0 0;
            }
          }
        }
      }
    }
    & /deep/ .ivu-btn:focus , .ivu-btn-text:focus {
      box-shadow: none;
    }
  }
</style>
