<template>
	<div class="test">
		<!-- 在分割出来的填空题段插入输入框 -->
		<div class="problem-container">
			<div class="problem" v-for="(item, index) in problemSplit">
				<span>{{item}}</span>
				<Input v-if="index !== problemSplit.length - 1" v-model="answers[index]" :autofocus="index===0" style="width: 80px;" size="small"/>
			</div>
		</div>
    <!-- 测验或非测验，只要答过题就不显示 -->
		<Button v-if="my_status === SMALL_PROBLEM_STATUS.NOT_ANSWER" :loading="loading" type="primary" @click="submitAnswer" :disabled="problemSubmitDisabled" long>提交</Button>
    <!-- 不是测验且要登录且非未答题状态则显示 -->
		<div v-else-if="isAuthenticated && !isExamination" :class="{'answer-true': my_status === SMALL_PROBLEM_STATUS.RIGHT, 'answer-false': my_status === SMALL_PROBLEM_STATUS.ERROR}">
			正确答案是:<span v-for="ans in modelAnswers">{{ans}};&nbsp;</span>&nbsp;
			<span class="result" v-if="my_status === SMALL_PROBLEM_STATUS.RIGHT">你做对了</span>
			<span class="result" v-else>你做错了</span>
		</div>
    <!-- 测验阶段已经答题则显示 -->
    <div v-if="isAuthenticated && isExamination && my_status !== SMALL_PROBLEM_STATUS.NOT_ANSWER">这道题已经答过了~</div>
	</div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { SMALL_PROBLEM_STATUS } from '@/utils/constants'
    import api from '@oj/api'
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
          loading: false,
          // 用户的答案
          answers: [],
          // 正确答案
          modelAnswers: null,
          // 课堂测验 或 课后作业ID
          examID: '',
          routeName: '',
          SMALL_PROBLEM_STATUS: SMALL_PROBLEM_STATUS
        }
      },
      mounted () {
        this.init()
      },
      methods: {
        init () {
          // 将题目内容传递过来
          // 测试
          // this.problem = {
          //   test: '填空测试2',
          //   _id: 'xxx',
          //   title: '填空题2',
          //   content: '中华人民共和国成立于@@1949@@年@@10@@月@@01@@日@@10:00@@时',
          //   type: '1', // 0为选择 1为填空
          //   model_answers: ['1949', '10', '01', '10:00'],
          //   my_answers: ['aa']
          // }
          this.routeName = this.$route.name
          this.handleProblem(this.problem.content)
          if (this.routeName === 'test-details') {
              // 如果是课堂测验 某个测验里面
            this.examID = this.$route.params.testID
          } else if (this.routeName === 'homework-details') {
              // 若是某个课后作业里面
            this.examID = this.$route.params.homeworkID
          }
          // 若只是在题库中 则不用操作
          // 若登录且已答过题 则将自己的答案补充上去
          if (this.isAuthenticated && (this.my_status === SMALL_PROBLEM_STATUS.RIGHT || this.my_status === SMALL_PROBLEM_STATUS.ERROR)) {
            this.answers = this.problem.my_answers
          }
          // 获取正确答案
          this.modelAnswers = this.problem.modelAnswers
        },
        // 对传入的problem进行处理
        handleProblem (mess = '') {
          // 将问题中连续的@@答案@@替换为@@，再分割出来
          // 后台的数据中已经有答案的字段 不用分离
          // let exp = /@@(.*?)@@/g
          // let arr
          // let result = []
          // while ((arr = exp.exec(mess)) !== null) {
          //   result.push(arr[1])
          // }
          // this.modelAnswers = result

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
              this.$error('提交失败,请重试')
              this.loading = false
            })
          }
        }
      },
      computed: {
        ...mapGetters(['problemSubmitDisabled', 'isAuthenticated', 'examinationStatus']),
        my_status () {
          // 返回的情况为
          let status = this.problem.my_status
          if (status === null || status === undefined) {
            // -1结果为未答题状态
            return SMALL_PROBLEM_STATUS.NOT_ANSWER
          } else {
            // 0 为回答正确 1为回答错误
            return status
          }
        },
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
		.problem {
		display: inline-block;
		margin: 5px 0;
		}
	}
	.test {
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