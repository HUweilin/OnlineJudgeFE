<template>
	<div class="test">
		<div class="problem-container">
			{{problem.content}}
      <div class="option" :class="{selected: answers === index, 'error-select': my_status === SMALL_PROBLEM_STATUS.ERROR}" v-for="(option, index) in problem.options" @click="selectAnswer(index)">
        <span class="option-letter">{{optionsArr[index]}}</span>
        {{option}}
      </div>
		</div>
		<Button v-if="my_status === SMALL_PROBLEM_STATUS.NOT_ANSWER" 
    type="primary" long 
    @click="submitAnswer" 
    :disabled="problemSubmitDisabled" 
    :loading="loading">提交</Button>
    <!-- 不是测验且要登录且非未答题状态则显示 答题后不显示 -->
    <div v-else-if="isAuthenticated && !isExamination" :class="{'answer-true': my_status === SMALL_PROBLEM_STATUS.RIGHT, 'answer-false': my_status === SMALL_PROBLEM_STATUS.ERROR}">
      <span>正确答案是: &nbsp;</span>
      <span class="ans">{{optionsArr[modelAnswers]}}</span>
      <span class="result" v-if="my_status === SMALL_PROBLEM_STATUS.RIGHT">你做对了</span>
      <span class="result" v-else>你做错了</span>
    </div>
	</div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import { SMALL_PROBLEM_STATUS } from '@/utils/constants'
  export default {
    props: {
      problem: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        // 提交的答案
        answers: SMALL_PROBLEM_STATUS.NOT_ANSWER,
        optionsArr: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        loading: false,
        // 正确答案
        modelAnswers: '',
        examID: '',
        // 路由名
        routeName: '',
        SMALL_PROBLEM_STATUS: SMALL_PROBLEM_STATUS,
        my_status: '-1'
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        // 测试
        // this.problem = {
        //   test: '选择测试',
        //   _id: 'id',
        //   title: '单选题',
        //   content: '这是一道选择题，请选择',
        //   options: ['1', 'yes', 'no', '其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错其实都错'],
        //   type: '0', // 0为单选题 1多选题 2为填空题
        //   my_answers: '1',
        //   my_status: '1',
        //   modelAnswers: '0'
        // }
        // 获取当前问题的答题状态
        this.getMy_status()
        // 若登录且已答过题 则将自己的答案补充上去
        if (this.isAuthenticated && (this.my_status === SMALL_PROBLEM_STATUS.RIGHT || this.my_status === SMALL_PROBLEM_STATUS.ERROR)) {
          this.answers = parseInt(this.problem.my_answers)
        }
        // this.answers = this.problem.my_answers
        // 正确答案 赋值
        this.modelAnswers = parseInt(this.problem.modelAnswers)
        this.routeName = this.$route.name
        if (this.routeName === 'test-details') {
            // 如果是课堂测验 某个测验里面
          this.examID = this.$route.params.testID
        } else if (this.routeName === 'homework-details') {
            // 若是某个课后作业里面
          this.examID = this.$route.params.homeworkID
        }
        // 若只是在题库中 则不用操作
      },
      selectAnswer (index) {
        // 若已答题 则无法点击
        if (this.my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER) {
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
            answer: this.answers
          }
          // 判断是否是测验页面并添加测验的id
          if (this.routeName === 'test-details') {
            data.test_id = this.examID
          } else if (this.routeName === 'homework-details') {
            data.homework_id = this.examID
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
      },
      getMy_status () {
        let status = this.problem.my_status
        if (status === null || status === undefined) {
          // -1结果为未答题状态
          this.my_status = SMALL_PROBLEM_STATUS.NOT_ANSWER
        } else {
          // 设0为回答正确 1为回答错误
          this.my_status = status
        }
      }
    },
    computed: {
      ...mapGetters(['problemSubmitDisabled', 'isAuthenticated', 'examinationStatus']),
      // 是否在测验或者作业页面
      isExamination () {
        if (this.examID) {
          return true
        } else {
          return false
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