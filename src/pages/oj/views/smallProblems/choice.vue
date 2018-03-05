<template>
	<div class="test">
		以下是问题内容:
		<!-- 在分割出来的选择题段插入输入框 -->
		<div class="problem-container">
			{{problem.content}}
      <div class="option" :class="{selected: answers === index, 'error-select': my_status === 1}" v-for="(option, index) in problem.options" @click="selectAnswer(index)">
        <span class="option-letter">{{optionsArr[index]}}</span>
        {{option}}
      </div>
		</div>
		<Button v-if="my_status === -1 " 
    type="primary" long 
    @click="submitAnswer" 
    :disabled="problemSubmitDisabled" 
    :loading="loading">提交</Button>
    <div v-if="my_status !== -1 && isAuthenticated" 
    :class="{'answer-true': my_status === 0, 'answer-false': my_status === 1}">
    <!-- 若是测验但已结束 或者 非测验 则答题后可看到答案 -->
      <span v-if="(isExamination && examinationEnded) || !isExamination">正确答案是: {{optionsArr[modelAnswers]}};&nbsp;</span>&nbsp;
      <span class="result" v-if="my_status === 0">你做对了</span>
      <span class="result" v-else>你做错了</span>
    </div>
	</div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import { EXAMINATION_STATUS } from '@/utils/constants'
  const NOTSELECT = -1
  const TRUESELECT = 0
  const ERRORSELECT = 1
  export default {
    props: {
      problem: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        problemSplit: '',
        answers: -1,
        optionsArr: ['A', 'B', 'C', 'D'],
        loading: false,
        modelAnswers: '',
        testID: '',
        homeworkID: ''
      }
    },
    mounted () {
      // 如果是课堂测验 某个测验里面
      this.testID = this.$route.params.testID
      // 若是某个课后作业里面
      this.homeworkID = this.$route.params.homeworkID
      // 若只是在题库中 则不用操作
      // 这里判断是否答过题 若答过题则将自己的答案补充上去
      if (this.my_status === 0 || this.my_status === 1) {
        this.answers = this.problem.my_answers
      }
    },
    methods: {
      selectAnswer (index) {
        // 若已答题 则无法点击
        if (this.my_status !== -1) {
          return false
        }
        if (this.answers === index) {
          this.answers = -1
        } else {
          this.answers = index
        }
      },
      submitAnswer () {
        if (this.answers === -1) {
          this.$info('还没有填写答案呢')
          return false
        } else {
          this.loading = true
          let data = {
            problem_id: this.problem.id,
            test_id: this.testID,
            homework_id: this.homeworkID,
            answer: this.answers
          }
          api.submitSmallProblem(data).then(res => {
            this.$success('提交成功')
            this.loading = false
            this.$emit('on-close')
          }, res => {
            this.$error('提交失败')
            this.loading = false
          })
        }
      }
    },
    computed: {
      ...mapGetters(['problemSubmitDisabled', 'isAuthenticated', 'examinationStatus']),
      my_status () {
        let status = this.problem.my_status
        if (status === null || status === undefined) {
          // -1结果为未答题状态
          return NOTSELECT
        } else {
          // 正确答案 赋值
          this.modelAnswers = this.problem.modelAnswers
          // 设0为回答正确 1为回答错误
          return status === 0 ? TRUESELECT : ERRORSELECT
        }
      },
      // 是否在测验或者作业页面
      isExamination () {
        if (this.testID || this.homeworkID) {
          return true
        } else {
          return false
        }
      },
      // 测验或者作业是否已结束
      examinationEnded () {
        return this.examinationStatus === EXAMINATION_STATUS.ENDED
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
          background-color: #009966;
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
</style>