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
        <Spin v-if="loadings.tag" fix size="large"></Spin>
      </Panel>
    </Col>
    <Col :sm="19" :xs="24">
      <Panel shadow>
        <div slot="title">小题列表</div>
        <div slot="extra">
          <ul class="filter">
            <li>
              <Input v-model="query.keyword" 
              @on-enter="filterByKeyword" 
              @on-click="filterBykeyword"
              icon="ios-search-strong"
              placeholder="关键词"/>
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
        :columns="problemTableColumns"
        :data="problemList"
        :loading="loadings.table"
        size="small"></Table>
      </Panel>
      <Pagination :total="total" :page-size="limit" @on-change="pushRouter" :current.sync="query.page"></Pagination>
    </Col>
    <modal v-model="smProModal">
      <div slot="header">{{currentProblem.title}}</div>
      <sm-problem v-if="smProModal" :content="currentProblem"></sm-problem>
      <div slot="footer" style="display: none;"></div>
    </modal>
  </Row>
</template>
<script>
  import Pagination from '@oj/components/Pagination'
  import smProblem from '@oj/views/smallProblems/smallProblem.vue'
  import utils from '@/utils/utils'
  import { client } from '@/utils/dom.js'
  import { ProblemMixin } from '@oj/components/mixins'
  import { mapGetters } from 'vuex'

  export default {
    name: 'smallProblemList',
    mixins: [ProblemMixin],
    components: {
      Pagination,
      smProblem
    },
    data () {
      return {
        tagList: [],
        problemTableColumns: [
          {
            title: '#',
            key: '_id',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    // 发送ajax请求获取小题的内容
                    // 并显示弹窗赋值到变量中
                    this.smProModal = true
                    this.currentProblem = {_id: 1, title: '测试', submission_number: '4', accepted_number: '2', tags: [], content: '测试测试 主题内容'}
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, params.row._id)
            }
          },
          {
            title: '题目',
            width: '35%',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'small-problem-details', params: {problemID: params.row._id}})
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, params.row.title)
            }
          },
          {
            title: '提交量',
            key: 'submission_number'
          },
          {
            title: '通过率',
            render: (h, params) => {
              return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
            }
          },
          {
            title: 'Tags',
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
        problemList: [{_id: 1, title: '测试', submission_number: '4', accepted_number: '2', tags: []}],
        query: {
          keyword: '',
          tag: '',
          page: 1
        },
        // 每页题目条数,还有题目总数total
        limit: 20,
        total: 0,
        loadings: {
          table: false,
          tag: true
        },
        // 小题弹窗
        smProModal: false,
        currentProblem: {}
      }
    },
    mounted () {
      this.init()
      this.clientHeight = this.tableHeight()
      this.setTagHeight()
      window.onresize = () => {
        this.clientHeight = this.tableHeight()
        this.setTagHeight()
      }
    },
    methods: {
      init (bool = false) {
        // 1、将地址栏的参数赋值进来，然后获取tag列表,小题列表
        /* 这里获取地址栏的参数,比如你筛选条件后刷新,这时要重新把参数赋值到变量中 此时加载页面会把参数传递给后台
        */
        let query = this.$route.name
        this.query.keyword = query.keyword || ''
        this.query.tag = query.tag || ''
        this.query.page = parseInt(query.page) || 1
        // 第一次加载或者刷新页面时需要请求tag列表
        if (!bool) {
          this.getTagList()
        }
        this.getProblemList()
      },
      pushRouter () {
        this.$router.push({
          name: 'small-problem-list',
          query: utils.filterEmptyValue(this.query)
        })
      },
      getTagList () {
        /* api.getxxx().then(res => {
          this.tagList = res.data.xxx
          this.loadings.tag = false
        }, res => {
          this.loadings.tag = false
        })
        */
      },
      getProblemList () {
        // 偏移量
        // let offset = ( this.query.page - 1 ) * this.limit
        // this.loadings.table = true
        /*  //发送请求
        api.getxxx(offset,this.limit,this,query).then(res => {
          this.loadings.table = false
          //设置总页数
          this.total = res.data.xxx
          this.problemList = res.data.xxx
          // 假如登录了,表格最左侧添加一栏状态 (提交过的显示通过
          // 不通过) isAuthenticated在watch里有监控 登录后会调用init
          // 所以可以在getProblemList判断
          if (this.isAuthenticated) {
            this.addStatusColumn(this.problemTableColumns, res.data.data.xxx)
          }
        }, res => {
          this.loadings.table = false
        })
        */
      },
      onReset () {
        this.$route.push({name: 'small-problem-list'})
      },
      filterByTag (tag) {
        this.query.tag = tag
        // 设置筛选条件后 重新请求数据 page初始为1
        this.query.page = 1
        this.pushRouter()
      },
      filterByKeyword () {
        // 原因同上
        this.query.page = 1
        this.pushRouter()
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
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated'])
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          // 参数为true 则不用重新获取tag列表
          this.init(true)
        }
      },
      'isAuthenticated' (newVal) {
        if (newVal === true) {
          this.init()
        }
      }
    }
  }
</script>
<style scoped lang="less">
  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
  }
</style>