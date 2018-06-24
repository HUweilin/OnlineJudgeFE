<template>
  <Row type="flex" justify="space-between" class="problem-wrapper">
    <Col :xs="24" :sm="colNum">
      <div id="problem-main">
        <!--problem main-->
        <Panel :padding="40" shadow>
          <div slot="title" style="font-size: 16px;">
            <div class="info">
              <span class="single-info">题目: {{problem.title}}</span>
              <span class="single-info">ID:&nbsp;{{problem._id}}</span>
              <Poptip class="single-info" trigger="hover" placement="top" v-if="problem.tags.length">
                <a>标签</a>
                <div slot="content">
                  <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
                </div>
              </Poptip>
              <div class="single-info btn"><Button type="primary" @click="codeVisible=!codeVisible" icon="compose" :disabled="problemSubmitDisabled || courseProblemSubmitDisabled">提交</Button></div>
            </div>
            <div class="info">
              <span class="single-info">时间限制(ms):&nbsp;{{problem.time_limit}}</span>
              <span class="single-info">空间限制(kb):&nbsp;{{problem.memory_limit}}</span>
              <span class="single-info" v-if="!courseID">提交数:&nbsp;{{problem.submission_number}}</span>
              <span class="single-info" v-if="!courseID">通过数:&nbsp;{{problem.accepted_number}}</span>
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

    <Col :xs="24" :sm="4" v-if="!courseID">
      <div id="right-column">
        <VerticalMenu @on-click="handleRoute">
        <!-- 如果非竞赛跳转过来 则不显示题目和竞赛公告 -->
          <template v-if="this.contestID">
            <VerticalMenu-item :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
              <Icon type="ios-photos"></Icon>
              题目
            </VerticalMenu-item>

            <VerticalMenu-item :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
              <Icon type="chatbubble-working"></Icon>
              竞赛公告
            </VerticalMenu-item>
          </template>
          <!-- 1、如果不是竞赛 或者 是比赛类型为ACM或比赛状态为ENDED(-1) 2、是管理员 -->
          <VerticalMenu-item v-if="!contestID || OIContestRealTimePermission" :route="submissionRoute">
            <Icon type="navicon-round"></Icon>
            提交情况
          </VerticalMenu-item>

          <template v-if="this.contestID">
            <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission"
                               :route="{name: 'contest-rank', params: {contestID: contestID}}">
              <Icon type="stats-bars"></Icon>
              排行榜
            </VerticalMenu-item>
            <VerticalMenu-item :route="{name: 'contest-details', params: {contestID: contestID}}">
              <Icon type="home"></Icon>
              竞赛主页
            </VerticalMenu-item>
          </template>
        </VerticalMenu>

        <Card style="margin-top: 5px;" id="pieChart" :padding="0" v-if="!this.contestID || OIContestRealTimePermission">
          <div slot="title">
            <Icon type="ios-analytics"></Icon>
            <span class="card-title">统计</span>
            <Button type="ghost" size="small" id="detail" @click="graphVisible = !graphVisible">详情</Button>
          </div>
        </Card>
      </div>
    </Col>
    <!-- 通过比例弹窗 -->
    <Modal v-model="graphVisible">
      <div id="pieChart-detail">
        <ECharts :options="largePie" :initOptions="largePieInitOpts"></ECharts>
      </div>
      <div slot="footer">
        <Button type="ghost" @click="graphVisible=false">关闭</Button>
      </div>
    </Modal>
    <!-- 提交代码弹窗 B -->
    <Modal v-model="codeVisible" transfer="false" width="1000px">
        <CodeMirror :value.sync="code" @changeLang="onChangeLang" :languages="problem.languages" :language="language" 
        v-if="codeVisible"></CodeMirror>
        <Row type="flex" justify="space-between">
          <Col :span="10">
            <!-- 显示当前提交的状态 -->
            <div class="status" v-if="statusVisible">
              <!-- 不是竞赛 或者是竞赛且oi实时显示 -->
              <template v-if="!this.contestID || (this.contestID && OIContestRealTimePermission)">
                <span>状态:</span>
                <Tag type="dot" :color="submissionStatus.color" @click.native="handleRoute('/status/'+submissionId)">
                  {{submissionStatus.text}}
                </Tag>
              </template>
              <template v-else-if="this.contestID && !OIContestRealTimePermission">
                <Alert type="success" show-icon>提交成功</Alert>
              </template>
            </div>
            <div v-else-if="problem.my_status === 0">
              <Alert type="success" show-icon>已解决</Alert>
            </div>
            <div v-else-if="this.contestID && !OIContestRealTimePermission && submissionExists">
              <Alert type="success" show-icon>已提交,未解决</Alert>
            </div>
            <div v-if="contestEnded">
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
            <Button type="warning" icon="edit" :loading="submitting" @click="submitCode" :disabled="problemSubmitDisabled || courseProblemSubmitDisabled"
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
  import { types } from '../../../../store'
  import CodeMirror from '@oj/components/CodeMirror.vue'
  import storage from '@/utils/storage'
  import { client } from '@/utils/dom.js'
  import { FormMixin } from '@oj/components/mixins'
  import { JUDGE_STATUS, CONTEST_STATUS, buildProblemCodeKey, buildCourseProblemCodeKey } from '@/utils/constants'
  import api from '@oj/api'
  import { pie, largePie } from './chartData'
  import utils from '@/utils/utils.js'

  // 只显示这些状态的图形占用
  const filtedStatus = ['-1', '-2', '0', '1', '2', '3', '4', '8']

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
        graphVisible: false,
        // 代码弹窗变量
        codeVisible: false,
        submissionExists: false,
        captchaCode: '',
        captchaSrc: '',
        contestID: '',
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
        pie: pie,
        largePie: largePie,
        // echarts 无法获取隐藏dom的大小，需手动指定
        largePieInitOpts: {
          width: '500',
          height: '480'
        },
        // 路由名称
        routeName: '',
        // 课程id和单元id
        courseID: '',
        unitID: '',
        // 所占宽度，课程界面不需要右侧导航栏 所以这时问题占整行
        colNum: 19
      }
    },
    beforeRouteEnter (to, from, next) {
      let problemCode
      // 判断是竞赛的路由还是课程的路由，或者题库的路由
      if (to.params.courseID) {
        problemCode = storage.get(buildCourseProblemCodeKey(to.params.problemID, to.params.courseID, to.params.unitID))
      } else {
        problemCode = storage.get(buildProblemCodeKey(to.params.problemID, to.params.contestID))
      }
      // 判断是否有存储该题的答题信息
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
      // 竞赛界面右侧有菜单栏 若进入竞赛某个题目界面会复用problem
      // 所以要隐藏竞赛界面的菜单栏
      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: false})
      // 获取课程和单元的id 路由名称
      this.routeName = this.$route.name
      this.courseID = this.$route.params.courseID
      this.unitID = this.$route.params.unitID
      // 提交代码的api
      this.submitFunc = {
        'problem-details': 'submitCode',
        'contest-problem-details': 'submitCode',
        'course-unit-problem': 'submitUnitCode'
      }[this.routeName]
      // 获取判题结果的api,提交代码后获取判题结果
      this.getSubmitFunc = {
        'problem-details': 'getSubmission',
        'contest-problem-details': 'getSubmission',
        'course-unit-problem': 'getCourseSubmission'
      }[this.routeName]
      this.init()
      if (!this.$route.params.courseID) {
      // 固定题目内容 暂时没想到好的方法
        setTimeout(() => {
          this.proInfoHeight()
        }, 1500)
        this.colNum = 19
      } else {
        // 是课程界面 设置题目所占宽度
        this.colNum = 24
      }
    },
    methods: {
      init () {
        this.$Loading.start()
        this.contestID = this.$route.params.contestID
        this.problemID = this.$route.params.problemID
        let func = {
          'problem-details': 'getProblem',
          'contest-problem-details': 'getContestProblem',
          'course-unit-problem': 'getUnitProblem'
        }[this.routeName]
        let params = {
          contestID: this.contestID,
          courseID: this.courseID,
          taskID: this.unitID
        }
        api[func](this.problemID, params).then(res => {
          this.$Loading.finish()
          this.$nextTick(() => {
            if (window.MathJax) {
              window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'problem-content'])
            }
          })
          let problem = res.data.data
          if (!this.courseID) {
            api.submissionExists(problem.id).then(res => {
              this.submissionExists = res.data.data
            })
          }
          problem.languages = problem.languages.sort()
          this.problem = problem
          if (!this.courseID) {
            this.changePie(problem)
          }

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
      changePie (problemData) {
        // 只显示特定的一些状态
        for (let k in problemData.statistic_info) {
          if (filtedStatus.indexOf(k) === -1) {
            delete problemData.statistic_info[k]
          }
        }
        let acNum = problemData.accepted_number
        let data = [
          {name: 'WA', value: problemData.submission_number - acNum},
          {name: 'AC', value: acNum}
        ]
        this.pie.series[0].data = data
        // 只把大图的AC selected下，这里需要做一下deepcopy
        let data2 = JSON.parse(JSON.stringify(data))
        data2[1].selected = true
        this.largePie.series[1].data = data2

        // 根据结果设置legend,没有提交过的legend不显示
        let legend = Object.keys(problemData.statistic_info).map(ele => JUDGE_STATUS[ele].short)
        if (legend.length === 0) {
          legend.push('AC', 'WA')
        }
        this.largePie.legend.data = legend

        // 把ac的数据提取出来放在最后
        let acCount = problemData.statistic_info['0']
        delete problemData.statistic_info['0']

        let largePieData = []
        Object.keys(problemData.statistic_info).forEach(ele => {
          largePieData.push({name: JUDGE_STATUS[ele].short, value: problemData.statistic_info[ele]})
        })
        largePieData.push({name: 'AC', value: acCount})
        this.largePie.series[0].data = largePieData
      },
      handleRoute (route) {
        if (!this.courseID) {
          this.$router.push(route)
        }
      },
      onChangeLang (newLang) {
        if (this.problem.template[newLang]) {
          if (this.code.trim() === '') {
            this.code = this.problem.template[newLang]
          } else {
            this.$Modal.confirm({
              content: '该题目有 ' + newLang + ' 的模板, 是否替换你这个模板的代码?',
              onOk: () => {
                this.code = this.problem.template[newLang]
              }
            })
          }
        }
        this.language = newLang
      },
      checkSubmissionStatus () {
        if (this.refreshStatus) {
        // 如果之前的提交状态检查还没有停止,则停止,
        // 否则将会失去timeout的引用造成无限请求
          clearTimeout(this.refreshStatus)
        }
        const checkStatus = () => {
          let id = this.submissionId
          api[this.getSubmitFunc](id).then(res => {
            this.result = res.data.data
            if (Object.keys(res.data.data.statistic_info).length !== 0) {
              this.submitting = false
              clearTimeout(this.refreshStatus)
              this.init()
            } else {
              this.refreshStatus = setTimeout(checkStatus, 2000)
            }
          }, res => {
            this.submitting = false
            clearTimeout(this.refreshStatus)
          })
        }
        this.refreshStatus = setTimeout(checkStatus, 2000)
      },
      submitCode () {
        if (this.code.trim() === '') {
          this.$error('代码不能为空!')
          return
        }
        this.submissionId = ''
        this.result = {result: 9}
        this.submitting = true
        let data = {
          problem_id: this.problem.id,
          language: this.language,
          code: this.code,
          contest_id: this.contestID,
          course_id: this.courseID,
          task_id: this.unitID
        }
        data = utils.filterEmptyValue(data)
        if (this.captchaRequired) {
          data.captcha = this.captchaCode
        }
        const submitFunc = (data, detailsVisible) => {
          console.log(detailsVisible)
          this.statusVisible = true
          api[this.submitFunc](data).then(res => {
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

        if (this.contestRuleType === 'OI' && !this.OIContestRealTimePermission) {
          if (this.submissionExists) {
            this.$Modal.confirm({
              title: '',
              content: '<h3>你已经提交过这个问题, 确认要重新提交?<h3>',
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
        } else {
          submitFunc(data, true)
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
      }
    },
    computed: {
      ...mapGetters(['problemSubmitDisabled', 'contestRuleType', 'OIContestRealTimePermission', 'contestStatus', 'courseProblemSubmitDisabled']),
      contest () {
        return this.$store.state.contest.contest
      },
      contestEnded () {
        return this.contestStatus === CONTEST_STATUS.ENDED
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

      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: true})
      if (!this.courseID) {
        storage.set(buildProblemCodeKey(this.problem._id, from.params.contestID), {
          code: this.code,
          language: this.language
        })
      } else {
        storage.set(buildCourseProblemCodeKey(this.problem.id, this.courseID, this.unitID), {
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
            flex: 1;
            text-align: left;
            &.btn {
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

