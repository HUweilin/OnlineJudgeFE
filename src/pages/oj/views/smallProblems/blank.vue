<template>
	<div id="pro-wrapper">
		<!-- 在分割出来的填空题段插入输入框 -->
		<div class="problem-container">
			<div class="problem" v-for="(item, index) in problemSplit">
				<div style="display: inline-block;" v-html="item"></div>
        <!-- <span>{{item}}</span> -->
				<Input v-if="index !== problemSplit.length - 1" v-model="answers[index]" :autofocus="index===0" style="width: 80px; display: inline-block;" size="small" :disabled="my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER || courseProblemSubmitDisabled" />
			</div>
		</div>
    <!-- 只要答过题就不显示 未答题则显示 -->
		<Button v-if="my_status === SMALL_PROBLEM_STATUS.NOT_ANSWER" :loading="loading" type="primary" @click="submitAnswer" :disabled="courseProblemSubmitDisabled" long>提交</Button>
    <!-- 已登录且非未答题状态则显示 -->
		<div v-else-if="isAuthenticated" :class="{'answer-true': my_status === SMALL_PROBLEM_STATUS.RIGHT, 'answer-false': my_status === SMALL_PROBLEM_STATUS.ERROR}">
			正确答案是:<span v-for="ans in modelAnswers">{{ans}};&nbsp;</span>&nbsp;
			<span class="result" v-if="my_status === SMALL_PROBLEM_STATUS.RIGHT">你做对了</span>
			<span class="result" v-else>你做错了</span>
		</div>
    <!-- 测验阶段已经答题则显示 -->
    <div v-if="isAuthenticated && my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER">这道题已经答过了~</div>
	</div>
</template>
<script>
  import { SMALL_PROBLEM_STATUS } from '@/utils/constants'
  import smallProblemMixin from './smallProblem.js'
  import api from '@oj/api'
  export default {
    props: {
      problem: {
        type: Object,
        required: true
      }
    },
    mixins: [smallProblemMixin],
    data () {
      return {
        problemSplit: '',
        // 用户的答案
        answers: [],
        // 正确答案
        modelAnswers: ''
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.setSomeParams()
        this.handleProblem(this.problem.description)
        // 若只是在题库中 则不用操作
        // 若登录且已答过题 则将自己的答案补充上去
        if (this.isAuthenticated && (this.my_status === SMALL_PROBLEM_STATUS.RIGHT || this.my_status === SMALL_PROBLEM_STATUS.ERROR)) {
          this.answers = this.problem.my_answer
        }
        // 获取正确答案
        this.modelAnswers = this.problem.answer
        this.$nextTick(() => {
          if (window.MathJax) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'pro-wrapper'])
          }
        })
      },
      // 对传入的problem进行处理
      handleProblem (mess) {
        // 将问题中连续的@@答案@@替换为@@，再分割出来
        // 后台的数据中已经有答案的字段 不用分离
        let contentArr = mess.replace(/@@(.*?)@@/g, '@@').split('@@')
        this.problemSplit = contentArr
        this.answers.length = contentArr.length - 1
      },
      submitAnswer () {
        let bool = false
        for (var i = 0; i < this.answers.length; i++) {
          let ans = this.answers[i]
          if (ans !== '' && ans !== undefined) {
            if (ans.trim() !== '') {
              bool = true
              break
            }
          }
        }
        if (!bool) {
          this.$info('还没有填写答案呢')
          return false
        } else {
          this.loading = true
          let data = {
            id: this.problem.id,
            my_answer: this.answers
          }
          let funcName = this.courseID ? 'submitUnitSmallProblem' : 'submitSmallProblem'
          if (funcName === 'submitUnitSmallProblem') {
            data.course_id = this.courseID
            data.task_id = this.unitID
          }
          api[funcName](data).then(res => {
            this.$success('提交成功')
            this.loading = false
            this.my_status = res.data.data.my_status
            this.$emit('succeed')
          }, res => {
            this.$error('提交失败,请重试')
            this.loading = false
          })
        }
      }
    },
    watch: {
      'problem.my_status' (val) {
        this.my_status = val
      }
    }
  }
</script>
<style lang="less" scoped>
	.problem-container {
		margin-bottom: 10px;
		.problem {
		  display: inline-block;
		  margin: 5px 0;
		}
	}
	#pro-wrapper {
		.answer-true, .answer-false {
			padding: 5px;
			font-size: 16px;
			span {
				font-size: 18px;
				font-weight: bold;
			}
			.result {
				font-size: 10px;
				font-weight: normal;
			}
		}
		.answer-true {
			background-color: #339933;
			color: #fff;
		}
		.answer-false {
			background-color: #f99090;
			color: #f00;
		}
	}
</style>