<template>
	<div id="pro-wrapper">
    <!-- 不用v-if判断 值未传入时就渲染好 无法显示problem的值 -->
		<div class="problem-container" v-if="problem.options">
			<div v-html="problem.description"></div>
      <CheckboxGroup v-model="answers" size="large">
        <Checkbox style="display: block;" :label="optionsArr[index]" v-if="problem.options" v-for="(option, index) in problem.options" :key="index" :disabled="my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER || courseProblemSubmitDisabled">
          <span class="option-letter">{{optionsArr[index]}}</span>&nbsp;
          <span>{{option}}</span>
        </Checkbox>
    </CheckboxGroup>
		</div>
		<Button v-if="my_status === SMALL_PROBLEM_STATUS.NOT_ANSWER" type="primary" long @click="submitAnswer" 
    :disabled="courseProblemSubmitDisabled" 
    :loading="loading">提交</Button>
    <!--  登录 且 非未答题状态则显示 答题后(非测验)不显示 -->
    <div v-else-if="isAuthenticated" :class="{'answer-true': my_status === SMALL_PROBLEM_STATUS.RIGHT, 'answer-false': my_status === SMALL_PROBLEM_STATUS.ERROR}">
      <span>正确答案是:&nbsp;</span>
      <span class="ans" v-for="(ans, index) in modelAnswers" :key="index">{{ans}}&nbsp;</span>
      <span class="result" v-if="my_status === SMALL_PROBLEM_STATUS.RIGHT">你做对了</span>
      <span class="result" v-else>你做错了</span>
    </div>
	</div>
</template>
<script>
  import api from '@oj/api'
  import { SMALL_PROBLEM_STATUS } from '@/utils/constants'
  import smallProblemMixin from './smallProblem.js'
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
        // 用户提交的答案
        answers: [],
        // 正确答案
        modelAnswers: []
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.setSomeParams()
        // 若登录且已答过题 则将自己的答案补充上去
        if (this.isAuthenticated && (this.my_status === SMALL_PROBLEM_STATUS.RIGHT || this.my_status === SMALL_PROBLEM_STATUS.ERROR)) {
          this.answers = this.problem.my_answer
        }
        // 正确答案 赋值
        this.modelAnswers = this.problem.answer
        this.$nextTick(() => {
          if (window.MathJax) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'pro-wrapper'])
          }
        })
      },
      // 提交代码
      submitAnswer () {
        if (!this.answers.length) {
          this.$info('还没有填写答案哦')
          return false
        } else {
          this.loading = true
          let data = {
            id: this.problem.id,
            // 答案按字母顺序排列
            my_answer: this.answers.sort()
          }
          let funcName = this.courseID ? 'submitUnitSmallProblem' : 'submitSmallProblem'
          if (funcName === 'submitUnitSmallProblem') {
            data.course_id = this.courseID
            data.task_id = this.unitID
          }
          api[funcName](data).then(res => {
            this.$success('提交成功')
            this.loading = false
            // 将答题结果赋值给my_status
            this.my_status = res.data.data.my_status
            this.$emit('succeed')
          }, res => {
            this.$error('提交失败,请重试')
            this.loading = false
          })
        }
      }
    }
  }
</script>
<style lang="less" scoped>
	.problem-container {
		margin-bottom: 10px;
    .option-letter {
      font-size: 18px;
      font-weight: normal;
    }
	}
  .answer-true, .answer-false {
    padding: 5px;
    font-size: 16px;
    border-radius: 10px;
    .ans {
    font-size: 18px;
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
</style>