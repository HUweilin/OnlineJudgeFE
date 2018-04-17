<template>
	<div>
    <Panel>
      <div slot="title">题目</div>
      <!-- v-if="!examMenuDisabled"  用来限制地址栏直接访问 -->
      <Table v-if="!examMenuDisabled"
             :columns="TableColumns"
             :data="testPro" 
             :loading="loading"
             @on-row-click="goProblem"
             no-data-text="暂无题目"></Table>
      <modal v-model="showSmallPro" scrollable="true" width="40%">
        <div slot="header">{{smallProblem.test}}</div>
        <component :is="smallProType" v-if="showSmallPro" :problem="smallProblem" @on-close="showSmallPro = false"></component>
        <div slot="footer" style="display: none;"></div>
      </modal>
    </Panel>
  </div>
</template>
<script>
  import {mapState, mapGetters} from 'vuex'
  import {ProblemMixin} from '@oj/components/mixins'
  import Blank from '@oj/views/smallProblems/blank.vue'
  import Single from '@oj/views/smallProblems/singleChoice.vue'
  import Multiple from '@oj/views/smallProblems/multipleChoice.vue'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants'
  export default {
    name: 'exam-problem-list',
    mixins: [ProblemMixin],
    components: {
      Blank,
      Single,
      Multiple
    },
    data () {
      return {
        TableColumns: [
          {
            title: '编号',
            key: '_id',
            sortType: 'asc',
            width: 150
          },
          {
            title: '题目',
            key: 'title'
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
            title: '题目类型',
            render: (h, params) => {
              return h('span', '不知道')
            }
          }
        ],
        loading: false,
        smallProblem: {},
        showSmallPro: false,
        smallProType: ''
      }
    },
    mounted () {
      this.getProblems()
    },
    methods: {
      getProblems () {
        // this.loading = true
        let func = (this.$route.name === 'test-problem-list') ? 'getTestProblems' : 'getHomeworkProblems'
        this.$store.dispatch(func).then(res => {
          if (this.isAuthenticated) {
            this.addStatusColumn(this.TableColumns, res.data.data)
          }
          this.loading = false
        }, res => {
          this.loading = false
        })
      },
      goProblem (problem) {
        // 这里跟之前不同的是编程题和选择填空混在一起 所以需要额外判断
        // 先假设编程题没有type键值对 小题有 就可作出以下判断
        if (problem.type !== '' && problem.type !== undefined) {
          this.smallProblem = problem
          this.smallProType = SMALL_PROBLEM_TYPE[problem.type]
          this.showSmallPro = true
        } else {
          this.$router.push({name: 'test-problem-details', params: {problemID: problem._id}})
        }
      }
    },
    computed: {
      ...mapState({
        problems: state => state.examination.examinationProblems
      }),
      ...mapGetters(['isAuthenticated', 'examMenuDisabled'])
    }
  }
</script>
<style lang="less" scoped></style>