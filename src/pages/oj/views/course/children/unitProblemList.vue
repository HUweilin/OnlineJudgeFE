<template>
  <div>
    <Panel>
      <div slot="title">题目列表<span class="isEnded" v-if="courseProblemSubmitDisabled">已结束</span></div>
      <div slot="extra">
      <Select style="width: 100px;" v-model="showProblemType" @on-change="selectTypeChange">
        <Option value="all" label="所有"></Option>
        <Option value="smallProblem" label="小题"></Option>
        <Option value="programProblem" label="编程题"></Option>
      </Select>
      </div>
      <Table :data="problems" :columns="tableColumns" :loading="loading" no-data-text="暂无题目"></Table>
    </Panel>
    <modal v-model="showSmallProblem" scrollable="true" width="40%">
      <div slot="header">{{smallProblem.title}}</div>
      <component :is="smallProblemComponent" v-if="showSmallProblem" :problem="smallProblem" @succeed="init()"></component>
      <div slot="footer" style="display: none;"></div>
    </modal>
  </div>
</template>
<script>
  import { mapState, mapGetters } from 'vuex'
  import { ProblemMixin } from '@oj/components/mixins'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants.js'
  import { types } from '@/store'
  import Blank from '@oj/views/smallProblems/blank.vue'
  import Single from '@oj/views/smallProblems/singleChoice.vue'
  import Multiple from '@oj/views/smallProblems/multipleChoice.vue'
  export default {
    props: {
      course: {
        type: Object
      }
    },
    mixins: [ProblemMixin],
    components: {
      Blank,
      Single,
      Multiple
    },
    data () {
      return {
        // 展示的题目列表
        problems: [],
        // 展示的习题类型 分为小题、编程题、所有(smallProblem programProblem all)
        showProblemType: 'all',
        tableColumns: [
          {
            title: '序号',
            type: 'index',
            width: '80',
            align: 'center'
          },
          {
            title: '题目',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.getUnitProblem(params.row)
                  }
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
        loading: false,
        // 小题弹窗控件
        showSmallProblem: false,
        // 控制小题的显示组件
        smallProblemComponent: '',
        smallProblem: {}
      }
    },
    mounted () {
      this.courseID = this.$route.params.courseID
      this.unitID = this.$route.params.unitID
      this.init()
    },
    methods: {
      init () {
        this.getCourseUnitProblemList()
      },
      // 获取题目列表
      getCourseUnitProblemList () {
        this.loading = true
        // 获取单元的信息
        this.$store.dispatch('getCourseUnit')
        // 接着获取单元的习题信息
        this.$store.dispatch('getCourseUnitProblemList').then(res => {
          this.loading = false
          // 筛选展示的题目
          this.selectTypeChange(this.showProblemType)
          if (this.isAuthenticated) {
            // 若是登录状态则添加一栏(做题结果)
            let concatArr = this.smallProblems.concat(this.programProblems)
            this.addStatusColumn(this.tableColumns, concatArr)
          }
        }, res => {
          this.loading = false
        })
      },
      getUnitProblem (problem) {
        // 如果type存在则说明是小题 否则是编程题
        if (problem.type) {
          this.smallProblem = problem
          this.smallProblemComponent = SMALL_PROBLEM_TYPE[problem.type].value
          // 显示小题弹窗
          this.showSmallProblem = true
        } else {
          // 这里跳转编程题
          this.$router.push({name: 'course-unit-problem', params: {courseID: this.courseID, unitID: this.unitID, problemID: problem.id}})
        }
      },
      // 显示的题目筛选
      selectTypeChange (type) {
        if (type === 'all') {
          this.problems = this.smallProblems.concat(this.programProblems)
        } else if (type === 'smallProblem') {
          this.problems = this.smallProblems
        } else {
          this.problems = this.programProblems
        }
      }
    },
    computed: {
      ...mapState({
        smallProblems: state => state.course.unit.smallProblems,
        programProblems: state => state.course.unit.programProblems
      }),
      ...mapGetters(['isAuthenticated', 'courseProblemSubmitDisabled'])
    },
    beforeDestory () {
      this.$store.commit(types.CLEAR_COURSE_UNIT)
    }
  }
</script>
<style lang="less" scopeds>
  .isEnded {
    display: inline-block;
    color: red;
    font-size: 12px;
    padding: 0 10px;
    margin-left: 20px;
    background-color: #fff5f7
  }
</style>