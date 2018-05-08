<template>
  <div>
    <Row type="flex">
      <Col :span="24">
        <Panel shadow>
          <div slot="title">我的课程</div>
          <div slot="extra">
            <Button type="success" icon="plus-round" size="large" @click="showDialog=true">加入新课程</Button>
          </div>
        </Panel>
      </Col>
    </Row>
    <Row type="flex" style="margin-top: 10px;" :gutter="10">
      <Col :span="24" style="position: relative; height: 200px;" v-if="courseLoading">
        <Spin fix>
          <Icon type="load-c" size="42" class="spin-icon-load"></Icon>
          <div>加载中</div>
        </Spin>
      </Col>
      <Col :xs="24" :sm="7" v-for="(course, index) in courses" :key="index">
        <div @click="goCourse(course.id)" style="cursor: pointer;" class="course">
          <Card>
            <div slot="title">{{course.title}}</div>
            <div slot="extra">
              <Button type="error" size="small" @click.stop="exitCourse(course)">退出课程</Button>
            </div>
            <div>
              <img class="course-img" :src="course.picture" :alt="course.title" :title="course.title">
              <div class="footer">
                <span class="duration">{{course.start_time | localtime('YYYY M.D')}} - {{course.end_time | localtime('YYYY M.D')}}</span>
                <span v-if="course.created_by" class="name">{{course.created_by.username}}</span>
                <span class="num"><Icon type="person-stalker"></Icon> {{course.total_student}}</span>
              </div>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
    <Modal v-model="showDialog" title="添加新课程">
      <Form ref="formCourse" :model="formCourse" :rules="ruleValidate">
        <FormItem label="课程代码" :show-message="true" :error="error.code" prop="code">
          <Input v-model="formCourse.code" placeholder="请输入课程代码"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="addNewCourse" long :loading="loadings.addLoading">加入课程</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import api from '@oj/api'
  import { mapGetters } from 'vuex'
  import utils from '@/utils/utils'
  export default {
    data () {
      return {
        keyword: '',
        courses: [],
        loadings: {
          courseLoading: false,
          addLoading: false
        },
        // 添加课程弹窗控制变量
        showDialog: false,
        // 添加的课程信息
        formCourse: {
          code: ''
        },
        // 表单验证
        ruleValidate: {
          code: {required: true, message: '课程代码不能为空', trigger: 'blur'}
        },
        error: {
          code: ''
        }
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.getCourseList()
      },
      // 获取课程列表
      getCourseList () {
        this.loadings.courseLoading = true
        api.getCourseList().then(res => {
          this.courses = res.data.data
          this.loadings.courseLoading = false
        }, res => {
          this.loadings.courseLoading = false
        })
      },
      // 进入课程
      goCourse (id) {
        this.$router.push({name: 'course-details', params: {courseID: id}})
      },
      // 添加新课程
      addNewCourse () {
        this.$refs.formCourse.validate((valid) => {
          if (valid) {
            this.loadings.addLoading = true
            let params = utils.filterEmptyValue(this.formCourse)
            api.addNewCourse(params).then(res => {
              this.$success('成功加入')
              this.getCourseList()
              this.loadings.addLoading = false
              this.showDialog = false
            }, res => {
              let data = res.data.data
              // startsWith判断是否以给定的字符串为开头
              if (data.startsWith('课程不存在') || data.startsWith('该课程已加入')) {
                this.error.code = data
              }
              this.loadings.addLoading = false
            })
          } else {
            this.loadings.addLoading = false
          }
        })
      },
      // 退出课程
      exitCourse (course) {
        this.$Modal.confirm({
          content: '是否确认退出课程' + course.title + '，请谨慎操作',
          onOk: () => {
            // 发送请求 退出课程
            api.exitCourse(course.id).then(res => {
              this.$success('已退出课程')
              this.init()
            })
          }
        })
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user'])
    }
  }
</script>
<style lang="less" scoped>
  .spin-icon-load{
    animation: ani-spin 1s linear infinite;
  }
  @keyframes ani-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  .course {
  	.course-img {
  	  width: 100%;
  	  height: 180px;
  	}
    .footer {
      width: 100%;
      display: inline-flex;
      color: #000;
      .duration {
      	flex: 6;
        font-size: 12px;
      }
      .name, .num {
      	flex: 1;
      	text-align: right;
      	font-size: 14px;
      }
    }
  }
</style>