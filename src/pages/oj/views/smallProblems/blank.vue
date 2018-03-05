<template>
	<div class="test">
		以下是问题内容:
		<!-- 在分割出来的填空题段插入输入框 -->
		<div class="problem-container">
			<div class="problem" v-for="(item, index) in problemSplit">
				<span>{{item}}</span>
				<Input v-if="index !== problemSplit.length - 1" v-model="answers[index]" :autofocus="index===0" style="width: 80px;" size="small"/>
			</div>
		</div>
		<Button v-if="my_status === -1" :loading="loading" type="primary" @click="submitAnswer" :disabled="problemSubmitDisabled" long>提交</Button>
		<div v-if="my_status !== -1 && isAuthenticated" :class="{'answer-true': my_status === 0, 'answer-false': my_status === 1}">
			正确答案是:<span v-if="(isExamination && examinationEnded) || !isExamination" v-for="ans in modelAnswers">{{ans}};&nbsp;</span>&nbsp;
			<span class="result" v-if="my_status === 0">你做对了</span>
			<span class="result" v-else>你做错了</span>
		</div>
	</div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { EXAMINATION_STATUS } from '@/utils/constants'
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
          answers: [],
          modelAnswers: [],
          // 课堂测验
          testID: '',
          // 课后作业ID
          homeworkID: ''
        }
      },
      mounted () {
        this.replaceUnderline(this.problem.content)
        if (this.$route.name === 'test-details') {
            // 如果是课堂测验 某个测验里面
          this.testID = this.$route.params.testID
        } else if (this.$route.name === 'homework-details') {
            // 若是某个课后作业里面
          this.homeworkID = this.$route.params.homeworkID
        }
        // 若只是在题库中 则不用操作
        // 这里判断是否答过题 若答过题则将自己的答案补充上去
        if (this.my_status === 0 || this.my_status === 1) {
          this.answers = this.problem.my_answers
        }
      },
      methods: {
        replaceUnderline (mess) {
          // 将问题中连续的_下划线替换为一个下划线，再分割出来
          // 并记录数组的长度 赋值给存放答案的变量
          let contentArr = mess.replace(/_+/g, '_').split('_')
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
            return -1
          } else {
            // 正确答案 赋值
            this.modelAnswers = this.problem.modelAnswers
            // 0 为回答正确 1为回答错误
            return status === 0 ? 0 : 1
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