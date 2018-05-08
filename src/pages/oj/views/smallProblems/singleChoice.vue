<template>
	<div id="pro-wrapper">
		<div class="problem-container">
			<div v-html="problem.description"></div>
      <div class="option" 
      :class="{selected: answers === optionsArr[index], 'error-select': my_status === SMALL_PROBLEM_STATUS.ERROR}" 
      v-for="(option, index) in problem.options" 
      @click="selectAnswer(optionsArr[index])">
        <span class="option-letter">{{optionsArr[index]}}</span>
        {{option}}
      </div>
		</div>
		<Button v-if="my_status === SMALL_PROBLEM_STATUS.NOT_ANSWER" type="primary" long @click="submitAnswer" 
    :disabled="courseProblemSubmitDisabled" 
    :loading="loading">提交</Button>
    <!-- 已登录且非未答题状态则显示 答题后不显示 -->
    <div v-else-if="isAuthenticated" :class="{'answer-true': my_status === SMALL_PROBLEM_STATUS.RIGHT, 'answer-false': my_status === SMALL_PROBLEM_STATUS.ERROR}">
      <span>正确答案是: &nbsp;</span>
      <span class="ans">{{modelAnswers}}</span>
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
        // 提交的答案
        answers: SMALL_PROBLEM_STATUS.NOT_ANSWER,
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
        // 若登录且已答过题 则将自己的答案补充上去 答案的类型为数组
        if (this.isAuthenticated && (this.my_status === SMALL_PROBLEM_STATUS.RIGHT || this.my_status === SMALL_PROBLEM_STATUS.ERROR)) {
          // 由于返回的答案类型是数组 所以需要进行取值
          this.answers = this.problem.my_answer[0]
        }
        // 正确答案 赋值
        this.modelAnswers = this.problem.answer[0]
        this.$nextTick(() => {
          if (window.MathJax) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'pro-wrapper'])
          }
        })
      },
      selectAnswer (letter) {
        // 若已答题 则无法点击
        if (this.my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER || this.courseProblemSubmitDisabled) {
          return false
        }
        if (this.answers === letter) {
          this.answers = '-1'
        } else {
          this.answers = letter
        }
      },
      submitAnswer () {
        if (this.answers === '-1') {
          this.$info('还没有填写答案呢')
          return false
        } else {
          this.loading = true
          let ans = []
          ans.push(this.answers)
          let data = {
            id: this.problem.id,
            my_answer: ans
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
          }).catch((err) => {
            console.log(err)
          })
        }
      }
    }
  }
</script>
<style lang="less" scoped>
	.problem-container {
		margin-bottom: 10px;
    .option {
      position: relative;
      padding: 5px 5px 5px 40px;
      font-size: 14px;
      border-radius: 10px;
      margin-bottom: 5px;
      cursor: pointer;
      &:hover {
        background-color: #ddd;
      }
      &.selected {
        background-color: #DDDDDD;
        &.error-select {
          background-color: #FF9999;
          .option-letter {
            background-color: red;
          }
        }
        .option-letter {
          background-color: #2d8cf0;
        }
      }
      .option-letter {
        position: absolute;
        left: 5px;
        top: 0;
        display: inline-block;
        width: 30px;
        height: 30px;
        line-height: 30px;
        font-size: 18px;
        text-align: center;
        background-color: #eee;
        border-radius: 50%;
      }
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