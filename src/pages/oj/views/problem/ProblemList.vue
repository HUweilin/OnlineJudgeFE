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
        <Button long id="pick-one" @click="pickone">
          <Icon type="shuffle"></Icon>
          Pick one
        </Button>
      </Panel>
      <Spin v-if="loadings.tag" fix size="large"></Spin>
    </Col>
    <Col :sm="19" :xs="24">
      <Panel shadow>
        <div slot="title">编程题列表</div>
        <div slot="extra">
          <ul class="filter">
            <li>
              <Dropdown @on-click="filterByDifficulty">
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
            </li>
            <!-- <li>
              <i-switch size="large" @on-change="handleTagsVisible">
                <span slot="open">Tags</span>
                <span slot="close">Tags</span>
              </i-switch>
            </li> -->
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
               :columns="problemTableColumns"
               :height="clientHeight"
               :data="problemList"
               :loading="loadings.table"
               size="small"
               disabled-hover></Table>
      </Panel>
      <Pagination :total="total" :page-size="limit" @on-change="pushRouter" :current.sync="query.page"></Pagination>
    </Col>

    
  </Row>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import { client } from '@/utils/dom.js'
  import { ProblemMixin } from '@oj/components/mixins'
  import Pagination from '@oj/components/Pagination'
  
  export default {
    name: 'ProblemList',
    mixins: [ProblemMixin],
    components: {
      Pagination
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
                    this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
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
                    this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, params.row.title)
            }
          },
          {
            title: '难度',
            render: (h, params) => {
              let t = params.row.difficulty
              let color = 'blue'
              if (t === 'Low') color = 'green'
              else if (t === 'High') color = 'yellow'
              return h('Tag', {
                props: {
                  color: color
                }
              }, params.row.difficulty)
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
        problemList: [],
        limit: 20,
        total: 0,
        loadings: {
          table: true,
          tag: true
        },
        routeName: '',
        query: {
          keyword: '',
          difficulty: '',
          tag: '',
          page: 1
        },
        clientHeight: 0
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
      init (simulate = false) {
        this.routeName = this.$route.name
        let query = this.$route.query
        this.query.difficulty = query.difficulty || ''
        this.query.keyword = query.keyword || ''
        this.query.tag = query.tag || ''
        this.query.page = parseInt(query.page) || 1
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
          name: 'problem-list',
          query: utils.filterEmptyValue(this.query)
        })
      },
      getProblemList () {
        let offset = (this.query.page - 1) * this.limit
        this.loadings.table = true
        api.getProblemList(offset, this.limit, this.query).then(res => {
          this.loadings.table = false
          this.total = res.data.data.total
          this.problemList = res.data.data.results
          if (this.isAuthenticated) {
            this.addStatusColumn(this.problemTableColumns, res.data.data.results)
          }
        }, res => {
          this.loadings.table = false
        })
      },
      getTagList () {
        api.getProblemTagList().then(res => {
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
      filterByKeyword () {
        this.query.page = 1
        this.pushRouter()
      },
      onReset () {
        this.$router.push({name: 'problem-list'})
      },
      pickone () {
        api.pickone().then(res => {
          this.$success('Good Luck')
          this.$router.push({name: 'problem-details', params: {problemID: res.data.data}})
        })
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
