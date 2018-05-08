<template>
  <Row type="flex" justify="space-around">
    <Col :sm="4" :xs="0">
      <Panel ref="tagCtrl" :padding="10">
        <div slot="title" class="taglist-title">Tags</div>
        <Button v-for="tag in tagList"
                :key="tag.name"
                @click="filterByTag(tag.name)"
                type="ghost"
                :disabled="query.tag === tag.name"
                shape="circle"
                class="tag-btn">{{tag.name}}
        </Button>
        <!-- <Button long id="pick-one" @click="pickone">
          <Icon type="shuffle"></Icon>
          Pick one
        </Button> -->
      </Panel>
      <Spin v-if="loadings.tag" fix size="large"></Spin>
    </Col>
    <Col :sm="19" :xs="24">
      <Panel shadow>
        <div slot="title" class="hidden-xs">题库列表</div>
        <div slot="extra" class="hidden-xs">
          <ul class="filter">
            <li>
              <Dropdown v-if="routeName === 'problem-list'" @on-click="filterByDifficulty">
                <span>{{query.difficulty === '' ? 'Difficulty' : query.difficulty}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">All</Dropdown-item>
                  <Dropdown-item name="Low">Low</Dropdown-item>
                  <Dropdown-item name="Mid">Mid</Dropdown-item>
                  <Dropdown-item name="High">High</Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
              <Dropdown v-else @on-click="filterByType">
                <span>{{query.type === '' ? '类型' : smallProTypeArr[query.type]}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">所有</Dropdown-item>
                  <Dropdown-item name="Single">单选题</Dropdown-item>
                  <Dropdown-item name="Multiple">多选题</Dropdown-item>
                  <Dropdown-item name="Blank">填空题</Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </li>
            <li>
              <Input v-model="query.keyword"
                     @on-enter="filterByKeyword"
                     @on-click="filterByKeyword"
                     placeholder="关键词"
                     icon="ios-search-strong"/>
            </li>
            <li>
              <Button type="info" @click="onReset">
                <Icon type="refresh"></Icon>
                重置
              </Button>
            </li>
          </ul>
        </div>
        <Table ref="table" style="width: 100%; font-size: 16px;"
               v-if="!mobileFlag"
               :columns="problemTableColumns"
               :height="clientHeight"
               :data="problemList"
               :loading="loadings.table"
               size="small"
               disabled-hover></Table>
        <Table ref="table" style="width: 100%; font-size: 16px;"
          v-else
          :columns="mobileTableColumns"
          :height="clientHeight"
          :data="problemList"
          :loading="loadings.table"
          size="small"
          disabled-hover></Table>
      </Panel>
      <Pagination :total="total" :page-size="limit" @on-change="pushRouter" :current.sync="query.page"></Pagination>
    </Col>
    <modal v-model="showSmallPro" scrollable="true" width="40%">
      <div slot="header">{{smallProblem.title}}</div>
      <component :is="smallProType" v-if="showSmallPro" :problem="smallProblem" @succeed="init('true')"></component>
      <div slot="footer" style="display: none;"></div>
    </modal>
  </Row>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import { client } from '@/utils/dom.js'
  import { ProblemMixin } from '@oj/components/mixins'
  import Pagination from '@oj/components/Pagination'
  import Blank from '@oj/views/smallProblems/blank.vue'
  import Single from '@oj/views/smallProblems/singleChoice.vue'
  import Multiple from '@oj/views/smallProblems/multipleChoice.vue'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants'
  export default {
    name: 'ProblemList',
    mixins: [ProblemMixin],
    components: {
      Pagination,
      Blank,
      Single,
      Multiple
    },
    data () {
      return {
        tagList: [],
        problemTableColumns: [
          {
            width: '80',
            title: '编号',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    if (this.routeName === 'problem-list') {
                      this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                    } else if (this.routeName === 'small-problem-list') {
                      this.openSmallProModal(params.row)
                    }
                  }
                },
                style: {
                  padding: '2px 0',
                  'box-shadow': 'none !important'
                }
              }, params.row._id)
            }
          },
          {
            title: '题目',
            width: '35%',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    if (this.routeName === 'problem-list') {
                      this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                    } else if (this.routeName === 'small-problem-list') {
                      this.openSmallProModal(params.row)
                    }
                  }
                },
                style: {
                  padding: '2px 0',
                  'box-shadow': 'none !important'
                }
              }, params.row.title)
            }
          },
          {
            title: '类型',
            align: 'center',
            render: (h, params) => {
              let type = params.row.type
              if (type) {
                type = SMALL_PROBLEM_TYPE[type].name
              } else {
                type = '编程题'
              }
              return h('span', type)
            }
          },
          {
            title: '提交量',
            align: 'center',
            key: 'submission_number'
          },
          {
            title: '通过率',
            align: 'center',
            render: (h, params) => {
              return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
            }
          },
          {
            title: '标签',
            align: 'center',
            width: '200px',
            render: (h, params) => {
              let tags = []
              params.row.tags.forEach(tag => {
                tags.push(h('Tag', {}, tag))
              })
              return h('div', {
                style: {
                  margin: '8px 0'
                }
              }, tags)
            }
          }
        ],
        mobileTableColumns: [
          {
            title: '题目',
            width: '35%',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    if (this.routeName === 'problem-list') {
                      this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                    } else if (this.routeName === 'small-problem-list') {
                      this.openSmallProModal(params.row)
                    }
                  }
                },
                style: {
                  padding: '2px 0',
                  'box-shadow': 'none !important'
                }
              }, params.row.title)
            }
          },
          {
            title: '类型',
            align: 'center',
            render: (h, params) => {
              let type = params.row.type
              if (type) {
                type = SMALL_PROBLEM_TYPE[type].name
              } else {
                type = '编程题'
              }
              return h('span', type)
            }
          }
        ],
        problemList: [],
        limit: 20,
        total: 0,
        loadings: {
          table: true,
          tag: true
        },
        // 当前跳转的主路由的name
        routeName: '',
        query: {
          keyword: '',
          difficulty: '',
          // 小题类型
          type: '',
          tag: '',
          page: 1
        },
        clientHeight: 0,
        smallProblem: {},
        showSmallPro: false,
        // 小题的类型
        smallProType: '',
        smallProTypeArr: {
          'Single': '单选题',
          'Multiple': '多选题',
          'Blank': '填空题'
        },
        // 判断PC或mobile
        mobileFlag: false
      }
    },
    mounted () {
      this.init()
      // 自适应题目列表的高度
      this.clientHeight = this.tableHeight()
      this.setTagHeight()
      window.onresize = () => {
        this.clientHeight = this.tableHeight()
        this.setTagHeight()
      }
    },
    methods: {
      init (simulate = false) {
        this.routeName = this.$route.name
        let query = this.$route.query
        this.query.difficulty = query.difficulty || ''
        this.query.keyword = query.keyword || ''
        this.query.tag = query.tag || ''
        this.query.page = parseInt(query.page) || 1
        this.mobileFlag = this._isMobile()
        if (this.query.page < 1) {
          this.query.page = 1
        }
        if (!simulate) {
          this.getTagList()
        }
        this.getProblemList()
      },
      pushRouter () {
        this.$router.push({
          name: this.routeName,
          query: utils.filterEmptyValue(this.query)
        })
      },
      getProblemList () {
        let offset = (this.query.page - 1) * this.limit
        this.loadings.table = true
        let func = this.routeName === 'problem-list' ? 'getProblemList' : 'getSmallProList'
        api[func](offset, this.limit, this.query).then(res => {
          this.loadings.table = false
          this.total = res.data.data.total
          this.problemList = res.data.data.results
          if (this.isAuthenticated) {
            // 若是登录状态则添加一栏(做题结果)
            if (!this.mobileFlag) {
              this.addStatusColumn(this.problemTableColumns, res.data.data.results)
            } else {
              this.addStatusColumn(this.mobileTableColumns, res.data.data.results)
            }
          }
        }, res => {
          this.loadings.table = false
        })
      },
      getTagList () {
        let func = (this.routeName === 'problem-list') ? 'getProblemTagList' : 'getSmallProblemTagList'
        // let func = 'getProblemTagList'
        api[func]().then(res => {
          this.tagList = res.data.data
          this.loadings.tag = false
        }, res => {
          this.loadings.tag = false
        })
      },
      filterByTag (tagName) {
        this.query.tag = tagName
        this.query.page = 1
        this.pushRouter()
      },
      filterByDifficulty (difficulty) {
        this.query.difficulty = difficulty
        this.query.page = 1
        this.pushRouter()
      },
      filterByType (type) {
        this.query.type = type
        this.query.page = 1
        this.pushRouter()
      },
      filterByKeyword () {
        this.query.page = 1
        this.pushRouter()
      },
      onReset () {
        this.$router.push({name: this.routeName})
      },
      // 根据屏幕高度设置表格高度
      tableHeight () {
        let table = this.$refs.table.$el
        let parent = table.offsetParent
        let distance = table.offsetTop
        while (parent !== null) {
          distance += parent.offsetTop
          parent = parent.offsetParent
        }
        let winHei = client().height
        // 82、66为分页控件和底部footer的高(包括margin)
        let height = winHei - distance - 82 - 66
        if (height <= 0) {
          height = 100
        }
        return height
      },
      setTagHeight () {
        let tagHei = this.$refs.tagCtrl.$el
        let parent = tagHei.offsetParent
        let distance = tagHei.offsetTop
        let winHei = client().height
        // 求得距离顶部的距离
        while (parent !== null) {
          distance += parent.offsetTop
          parent = parent.offsetParent
        }
        // 82为底部footer的高(包括margin)
        let height = winHei - distance - 82
        if (height <= 70) {
          height = 100
        }
        this.$refs.tagCtrl.$el.style.height = height + 'px'
      },
      // 判断PC还是mobile
      _isMobile () {
        let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        return flag
      },
      // 打开小题弹窗
      openSmallProModal (pro) {
        // 小题信息已全部获取 不需要再发送请求
        this.smallProblem = pro
        // Single 为单选 Multiple 为多选 Blank 为填空
        this.smallProType = SMALL_PROBLEM_TYPE[pro.type].value
        this.showSmallPro = true
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated'])
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          // 小题和编程题复用该组件 所以需要判断参数的值
          if (newVal.path === oldVal.path) {
            this.init(true)
          } else {
            // 若path不同 说明切换成编程题或小题的路由，
            // 需要重置加载列表和标签
            this.tagList = []
            this.problemList = []
            this.init()
          }
        }
      },
      'isAuthenticated' (newVal) {
        if (newVal === true) {
          this.init()
        }
      },
      'showSmallPro' (val) {
        if (val === false) {
          // 弹窗类型 小题均设为空
          this.smallProType = ''
          this.smallProblem = {}
        }
      }
    }
  }
</script>

<style scoped lang="less">
  // 缩小屏幕会出现横向滚动条,设置100%让其与父级保持同一宽度
  // 因为给Row设置了gutter导致
  .ivu-row-flex {
    width: 100%;
    .ivu-col-span-sm-4 {
      .ivu-card {
        overflow-y: auto;
      }
    }
  }
  .taglist-title {
    margin-left: -10px;
    margin-bottom: -10px;
  }

  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
  }

  #pick-one {
    margin-top: 10px;
  }
</style>
