<template>
	<div class="test">
		以下是问题内容:
		<!-- 在分割出来的填空题段插入输入框 -->
		<div class="problem-container">
			{{problem}}
		</div>
		<Button type="primary" @click="submitAnswer" :disabled="problemSubmitDisabled" long>提交</Button>
	</div>
</template>
<script>
    import { mapGetters } from 'vuex'
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
          answers: []
        }
      },
      mounted () {
      },
      methods: {
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
          } else {}
        }
      },
      computed: {
        ...mapGetters(['problemSubmitDisabled'])
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
</style>