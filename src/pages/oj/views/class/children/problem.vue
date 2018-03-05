<template>
  <Row type="flex" justify="space-between" class="problem-wrapper">
    <Col :xs="24" :sm="19">
      <div id="problem-main">
        <!--problem main-->
        <Panel :padding="40" shadow>
          <div slot="title" style="font-size: 16px;">
            <div class="info">
              <span class="single-info">{{problem.title}}</span>
              <span class="single-info">ID:&nbsp;{{problem._id}}</span>
              <Poptip class="single-info" trigger="hover" placement="top" v-if="problem.tags.length">
                <a>标签</a>
                <div slot="content">
                  <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
                </div>
              </Poptip>
            <div class="single-info"><Button type="primary" @click="codeVisible=!codeVisible" icon="compose" :disabled="examProblemSubmitDisabled">提交</Button></div>
            </div>
            <div class="info">
              <span class="single-info">时间限制(ms):&nbsp;{{problem.time_limit}}</span>
              <span class="single-info">空间限制(kb):&nbsp;{{problem.memory_limit}}</span>
              <span class="single-info" style="text-align: left;">提交数:&nbsp;{{problem.submission_number || 0}}&nbsp;&nbsp;通过数:&nbsp;{{problem.accepted_number || 0}}</span>
            </div>
          </div>
          <div id="problem-content" ref="problemContent" class="markdown-body">
            <p class="title">题目描述</p>
            <p class="content" v-html=problem.description></p>

            <p class="title">输入描述</p>
            <p class="content" v-html=problem.input_description></p>

            <p class="title">输出描述</p>
            <p class="content" v-html=problem.output_description></p>

            <div v-for="sample, index in problem.samples">
              <div class="flex-container sample">
                <div class="sample-input">
                  <p class="title">输入样例 {{index + 1}}
                    <a class="copy"
                       v-clipboard:copy="sample.input"
                       v-clipboard:success="onCopy"
                       v-clipboard:error="onCopyError">
                      <Icon type="clipboard"></Icon>
                    </a>
                  </p>
                  <pre>{{sample.input}}</pre>
                </div>
                <div class="sample-output">
                  <p class="title">输出样例 {{index + 1}}</p>
                  <pre>{{sample.output}}</pre>
                </div>
              </div>
            </div>

            <div v-if="problem.hint">
              <p class="title">提示</p>
              <Card dis-hover>
                <div class="content" v-html=problem.hint></div>
              </Card>
            </div>

            <div v-if="problem.source">
              <p class="title">来自</p>
              <p class="content">{{problem.source}}</p>
            </div>
          </div>
        </Panel>
        <!--problem main end-->
      </div>
    </Col>

    <Col :xs="24" :sm="4">
      <div id="right-column">
        <VerticalMenu @on-click="handleRoute">
            <VerticalMenu-item :route="getMenuRoute('problem')">
              <Icon type="ios-photos"></Icon>
              题目
            </VerticalMenu-item>

          <VerticalMenu-item :route="getMenuRoute('submission')">
            <Icon type="navicon-round"></Icon>
            提交情况
          </VerticalMenu-item>

            <VerticalMenu-item :route="getMenuRoute('rank')">
              <Icon type="stats-bars"></Icon>
              排行榜
            </VerticalMenu-item>
            <VerticalMenu-item :route="getMenuRoute('details')">
              <Icon type="home"></Icon>
              主页
            </VerticalMenu-item>
        </VerticalMenu>
      </div>
    </Col>
    <!-- 提交代码弹窗 B -->
    <Modal v-model="codeVisible" transfer="false" width="1000px">
        <CodeMirror :value.sync="code" @changeLang="onChangeLang" :languages="problem.languages" :language="language" 
        v-if="codeVisible"></CodeMirror>
        <Row type="flex" justify="space-between">
          <Col :span="10">
            <div class="status" v-if="statusVisible">
                <span>状态:</span>
                <Tag type="dot" :color="submissionStatus.color" @click.native="handleRoute('/status/'+submissionId)">
                  {{submissionStatus.text}}
                </Tag>
                <!-- <Alert type="success" show-icon>提交成功</Alert> -->
            </div>
            <div v-else-if="problem.my_status === 0">
              <Alert type="success" show-icon>已解决</Alert>
            </div>
            <div v-else-if="submissionExists">
              <Alert type="success" show-icon>已提交,未解决</Alert>
            </div>
            <div v-if="examEnded">
              <Alert type="warning" show-icon>竞赛已结束</Alert>
            </div>
          </Col>

          <Col :span="12">
            <template v-if="captchaRequired">
              <div class="captcha-container">
                <Tooltip v-if="captchaRequired" content="点击刷新" placement="top">
                  <img :src="captchaSrc" @click="getCaptchaSrc"/>
                </Tooltip>
                <Input v-model="captchaCode" class="captcha-code"/>
              </div>
            </template>
            <Button type="warning" icon="edit" :loading="submitting" @click="submitCode" :disabled="examProblemSubmitDisabled"
                    class="fl-right">
              <span v-if="!submitting">提交</span>
              <span v-else>提交中</span>
            </Button>
          </Col>
        </Row>
      <div slot="footer" style="display: none;"></div>
    </Modal>
    <!-- 提交代码弹窗 E -->
  </Row>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { types } from '@/store'
  import CodeMirror from '@oj/components/CodeMirror.vue'
  import storage from '@/utils/storage'
  import { client } from '@/utils/dom.js'
  import { FormMixin } from '@oj/components/mixins'
  import { JUDGE_STATUS, EXAMINATION_STATUS, buildTestProblemCodeKey, buildHomeworkProblemCodeKey } from '@/utils/constants'
  import api from '@oj/api'

  export default {
    name: 'Problem',
    components: {
      CodeMirror
    },
    mixins: [FormMixin],
    data () {
      return {
        statusVisible: false,
        captchaRequired: false,
        // 代码弹窗变量
        codeVisible: false,
        submissionExists: false,
        captchaCode: '',
        captchaSrc: '',
        examID: '',
        problemID: '',
        submitting: false,
        code: '',
        language: 'C++',
        submissionId: '',
        result: {
          result: 9
        },
        problem: {
          title: '',
          description: '',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          created_by: {
            username: ''
          },
          tags: []
        },
        func: '',
        routeParam: ''
      }
    },
    beforeRouteEnter (to, from, next) {
      let id, problemCode
      if (to.params.testID) {
        id = to.params.testID
        problemCode = storage.get(buildTestProblemCodeKey(to.params.problemID, id))
      } else if (to.params.homeworkID) {
        id = to.params.homeworkID
        problemCode = storage.get(buildHomeworkProblemCodeKey(to.params.problemID, id))
      }
      if (problemCode) {
        next(vm => {
          vm.language = problemCode.language
          vm.code = problemCode.code
        })
      } else {
        next()
      }
    },
    mounted () {
      // 要隐藏原本界面的菜单栏
      this.$store.commit(types.CHANGE_EXAMINATION_ITEM_VISIBLE, {menu: false})
      this.init()
      // 固定题目内容 暂时没想到好的方法
      setTimeout(() => {
        this.proInfoHeight()
      }, 1500)
    },
    methods: {
      init () {
        this.$Loading.start()
        // 获取路由中的params 赋值到变量中
        this.setExamData()
        api[this.func](this.problemID, this.examID).then(res => {
          this.$Loading.finish()
          this.$nextTick(() => {
            if (window.MathJax) {
              window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'problem-content'])
            }
          })
          let problem = res.data.data
          // 什么作用?
          api.submissionExists(problem.id).then(res => {
            this.submissionExists = res.data.data
          })
          problem.languages = problem.languages.sort()
          this.problem = problem

          // 在beforeRouteEnter中修改了, 说明本地有code， 无需加载template
          if (this.language !== 'C++' || this.code !== '' || this.problem.languages.indexOf(this.language) !== -1) {
            return
          }
          this.language = this.problem.languages[0]
          let template = this.problem.template
          if (template && template[this.language]) {
            this.code = template[this.language]
          }
        }, () => {
          this.$Loading.error()
        })
      },
      handleRoute (route) {
        this.$router.push(route)
      },
      onChangeLang (newLang) {
        if (this.problem.template[newLang]) {
          if (this.code.trim() === '') {
            this.code = this.problem.template[newLang]
          } else {
            this.$Modal.confirm({
              content: 'The problem has template for ' + newLang + ', Do you want to replace your code with template?',
              onOk: () => {
                this.code = this.problem.template[newLang]
              }
            })
          }
        }
        this.language = newLang
      },
      checkSubmissionStatus () {
        this.refreshStatus = setInterval(() => {
          let id = this.submissionId
          api.getSubmission(id).then(res => {
            this.result = res.data.data
            if (Object.keys(res.data.data.statistic_info).length !== 0) {
              this.submitting = false
              clearInterval(this.refreshStatus)
              this.init()
            }
          }, res => {
            this.submitting = false
            clearInterval(this.refreshStatus)
          })
        }, 2000)
      },
      submitCode () {
        if (this.code.trim() === '') {
          this.$error('代码不能为空!')
          return
        }
        this.submissionId = ''
        this.result = {result: 9}
        this.submitting = true
        let data
        if (this.routeParam === 'testID') {
          data = {
            problem_id: this.problem.id,
            language: this.language,
            code: this.code,
            test_id: this.examID
          }
        } else if (this.routeParam === 'homeworkID') {
          data = {
            problem_id: this.problem.id,
            language: this.language,
            code: this.code,
            homework_id: this.examID
          }
        }
        if (this.captchaRequired) {
          data.captcha = this.captchaCode
        }
        const submitFunc = (data, detailsVisible) => {
          this.statusVisible = true
          api.submitCode(data).then(res => {
            this.submissionId = res.data.data && res.data.data.submission_id
            // 定时检查状态
            this.submitting = false
            this.submissionExists = true
            if (!detailsVisible) {
              this.$Modal.success({
                title: 'Success',
                content: '提交代码成功'
              })
              return
            }
            this.checkSubmissionStatus()
          }, res => {
            this.getCaptchaSrc()
            if (res.data.data.startsWith('Captcha is required')) {
              this.captchaRequired = true
            }
            this.submitting = false
            this.statusVisible = false
          })
        }
        // 以下省略一个判断 不清楚是否有误 需要跟后台联调
        if (this.submissionExists) {
          this.$Modal.confirm({
            title: '',
            content: '<h3>你已经提交过该问题，是否覆盖？<h3>',
            onOk: () => {
              // 暂时解决对话框与后面提示对话框冲突的问题(否则一闪而过）
              setTimeout(() => {
                submitFunc(data, false)
              }, 1000)
            },
            onCancel: () => {
              this.submitting = false
            }
          })
        } else {
          submitFunc(data, false)
        }
      },
      onCopy (event) {
        this.$success('拷贝成功')
      },
      onCopyError (e) {
        this.$error('拷贝失败')
      },
      proInfoHeight () {
        let content = this.$refs.problemContent
        let parent = content.offsetParent
        let distance = content.offsetTop
        let winHei = client().height
        while (parent !== null) {
          // console.log(parent, distance)
          distance += parent.offsetTop
          parent = parent.offsetParent
        }
        // 66为底部footer的高(包括margin) 40 为panel组件下padding
        let height = winHei - distance - 66 - 40
        if (height <= 0) {
          height = 100
        }
        // console.log('屏幕:', winHei, '距顶:', distance)
        content.style.height = height + 'px'
      },
      // 根据路由中的params进行赋值
      setExamData () {
        this.problemID = this.$route.params.problemID
        if (this.$route.params.testID !== '' || this.$route.params.testID !== undefined) {
          this.routeParam = 'testID'
          this.examID = this.$route.params.testID
          this.func = 'getTestProblem'
        } else if (this.$route.params.homeworkID !== '' || this.$route.params.homeworkID !== undefined) {
          this.routeParam = 'homeworkID'
          this.examID = this.$route.params.homeworkID
          this.func = 'getHomeworkProblem'
        } else {
          this.routeParam = ''
          this.examID = ''
          this.func = ''
        }
      },
      // 菜单栏跳转的路由
      getMenuRoute (field) {
        let url
        let route = {params: {}}
        route.params[this.routeParam] = this.examID
        if (this.routeParam === 'testID') {
          url = 'test-'
        } else if (this.routeParam === 'homeworkID') {
          url = 'homework-'
        }
        url += field
        if (field !== 'rank') {
          url += '-list'
          if (field === 'submission') {
            route.query = {problemID: this.problemID}
          }
        }
        route.name = url
        return route
      }
    },
    computed: {
      ...mapGetters(['examProblemSubmitDisabled', 'examinationStatus']),
      examEnded () {
        return this.examinationStatus === EXAMINATION_STATUS.ENDED
      },
      submissionStatus () {
        return {
          text: JUDGE_STATUS[this.result.result]['name'],
          color: JUDGE_STATUS[this.result.result]['color']
        }
      },
      submissionRoute () {
        if (this.contestID) {
          return {name: 'contest-submission-list', query: {problemID: this.problemID}}
        } else {
          return {name: 'submission-list', query: {problemID: this.problemID}}
        }
      }
    },
    // 切换路由 离开之前调用
    beforeRouteLeave (to, from, next) {
      // 防止切换组件后仍然不断请求
      clearInterval(this.refreshStatus)

      this.$store.commit(types.CHANGE_EXAMINATION_ITEM_VISIBLE, {menu: true})
      if (from.params.testID) {
        storage.set(buildTestProblemCodeKey(this.problem._id, from.params.testID), {
          code: this.code,
          language: this.language
        })
      } else if (from.params.testID) {
        storage.set(buildHomeworkProblemCodeKey(this.problem._id, from.params.homeworkID), {
          code: this.code,
          language: this.language
        })
      }
      next()
    },
    watch: {
      '$route' () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .card-title {
    margin-left: 8px;
  }

  .problem-wrapper {
    #problem-main {
      .panel-title {
        .info {
          display: flex;
          margin-bottom: 5px;
          .single-info {
            flex: auto;
            &:last-child {
              text-align: right;
            }
          }
        }
      }
      & /deep/ .ivu-card-body {
        padding-top: 0 !important;
        padding-right: 5px !important;
      }
    }
  }

  #problem-content {
    overflow: auto;
    margin-top: 15px;
    .title {
      font-size: 20px;
      font-weight: 400;
      margin: 25px 0 8px 0;
      color: #3091f2;
      .copy {
        padding-left: 8px;
      }
    }
    p.content {
      margin-left: 25px;
      margin-right: 20px;
      font-size: 15px
    }
    .sample {
      align-items: stretch;
      &-input, &-output {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        margin-right: 5%;
      }
      pre {
        flex: 1 1 auto;
        align-self: stretch;
        border-style: solid;
        background: transparent;
      }
    }
  }

  #submit-code {
    margin-top: 20px;
    // margin-bottom: 20px;
    .status {
      float: left;
      span {
        margin-right: 10px;
        margin-left: 10px;
      }
    }
    .captcha-container {
      display: inline-block;
      .captcha-code {
        width: auto;
        margin-top: -20px;
        margin-left: 20px;
      }
    }
  }


  .fl-right {
    float: right;
  }

  #pieChart {
    .echarts {
      height: 250px;
      width: 210px;
    }
    #detail {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }

  #pieChart-detail {
    margin-top: 20px;
    width: 500px;
    height: 480px;
  }
</style>

