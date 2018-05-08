<template>
  <Panel title="单元列表">
    <div slot="header">
      <div class="unit-count">
        单元总数：<span class="count">{{units.length}}</span>
        <el-button size="small" type="primary" @click="addUnit">添加单元</el-button>
      </div>
    </div>
  	<el-table v-loading="loading" :data="units" border>
  	  <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
  	  <el-table-column label="标题" align="center" prop="title"></el-table-column>
  	  <!-- <el-table-column label="类型" width="80" align="center">
  	    <template slot-scope="scope">
  	      <span>{{COURSE_UNIT_TYPE[scope.row.type].name}}</span>
  	    </template>
  	  </el-table-column> -->
  	  <el-table-column label="开始时间" align="center">
  	    <template slot-scope="scope">{{scope.row.start_time | localtime}}</template>
  	  </el-table-column>
  	  <el-table-column label="结束时间" align="center">
  	    <template slot-scope="scope">{{scope.row.end_time | localtime}}</template>
  	  </el-table-column>
  	  <el-table-column label="是否可见" align="center">
  	    <template slot-scope="scope">
          <el-switch v-model="scope.row.visible" @change="handleVisibleSwitch(scope.row)"></el-switch>
        </template>
  	  </el-table-column>
  	  <el-table-column width="200" label="操作" align="center">
  	    <template slot-scope="scope">
  	      <icon-btn name="习题列表" icon="tasks" @click.native="goUnitProblemList(scope.row.id)"></icon-btn>
  	      <icon-btn name="设置" icon="gear" @click.native="editUnitSetting(scope.row)"></icon-btn>
  	      <icon-btn name="删除" icon="trash" @click.native="deleteUnit(scope.row.id)"></icon-btn>
  	    </template>
  	  </el-table-column>
  	</el-table>
  	<el-dialog :visible.sync="dialogFormVisible">
  	  <div slot="title">
  	  	<span class="title">{{dialogTitle}}</span>
  	  	<span class="notice">带<i style="color: red;"> * </i>号为必填项</span>
  	  </div>
  	  <el-form ref="unitForm" :model="createUnit" :rules="rules" label-position="right" label-width="80px">
  	    <el-form-item label="名称" prop="title">
  	      <el-input v-model="createUnit.title" placeholder="单元名称"></el-input>
  	    </el-form-item>
  	    <!-- <el-form-item label="类型">
          <el-select v-model="createUnit.type" placeholder="请选择类型">
            <el-option v-for="(item, key) in COURSE_UNIT_TYPE" :label="item.name" :value="item.value" :key="key"></el-option>
          </el-select>
	    </el-form-item> -->
	    <el-form-item label="开始时间" prop="start_time">
	      <el-date-picker type="datetime" placeholder="选择日期" v-model="createUnit.start_time"></el-date-picker>
	    </el-form-item>
	    <el-form-item label="结束时间" prop="end_time">
	      <el-date-picker type="datetime" placeholder="选择日期" v-model="createUnit.end_time"></el-date-picker>
	    </el-form-item>
	    <el-form-item :error="durationError" :show-message="isShowDuration">
          <div slot="label">
            <i class="el-icon-time"></i>
            <span>时长</span>
          </div>
          <span style="margin-left: 10px;">{{unitDuration}}</span>
        </el-form-item>
	    <el-form-item label="描述">
	      <el-input type="textarea" :autosize="{ minRows: 2}" v-model="createUnit.introduction"></el-input>
	    </el-form-item>
	    <el-form-item label="是否可见" prop="visible">
	      <el-switch v-model="createUnit.visible"></el-switch>
	    </el-form-item>
  	  </el-form>
  	  <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUnit" v-if="dialogTitle === '创建新单元'">创 建</el-button>
         <el-button type="primary" @click="submitUnit" v-else>修 改</el-button>
      </span>
  	</el-dialog>
  </Panel>
</template>
<script>
  import api from '../../../api.js'
  import time from '@/utils/time.js'
  export default {
    props: {
      course: {
        type: Object
      }
    },
    data () {
      return {
        courseID: '',
        // 所有的单元
        units: [],
        // 创建单元的弹窗控制变量
        dialogFormVisible: false,
        // 存储新建单元 或者修改单元的信息
        createUnit: {
          id: '',
          title: '',
          // type: 'task',
          start_time: '',
          end_time: '',
          introduction: '',
          visible: true
        },
        rules: {
          title: {required: true, message: '请输入名称', trigger: 'blur'},
          // type: {required: true, trigger: 'change'},
          start_time: {required: true, message: '请选择时间', type: 'date', trigger: 'change'},
          end_time: {required: true, message: '请选择时间', type: 'date', trigger: 'change'}
        },
        loading: false,
        // 单元持续时间
        // unitDuration: '无限',
        // // 错误信息控制变量(单元时间)
        // isShowDuration: false,
        // durationError: '',
        routeName: '',
        // 弹窗标题
        dialogTitle: '创建新单元',
        // 当前显示的单元id
        currentUnit: ''
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.routeName = this.$route.name
        this.courseID = this.$route.params.courseId
        this.getCourseUnitList()
      },
      // 获取课程的单元列表
      getCourseUnitList () {
        this.loading = true
        api.getCourseUnitList(this.courseID).then(res => {
          this.units = res.data.data.results
          this.loading = false
        }, res => {
          this.loading = false
        })
      },
      // 更改单元可见属性
      handleVisibleSwitch (row) {
        let data = {}
        let keys = Object.keys(this.createUnit)
        keys.forEach(key => {
          data[key] = row[key]
        })
        data.course_id = this.courseID
        data.task_id = row.id
        api.editCourseUnit(data)
      },
      // 点击添加单元则触发
      addUnit () {
        // 修改弹窗标题显示
        this.dialogTitle = '创建新单元'
        this.dialogFormVisible = true
        this.createUnit = {
          id: '',
          title: '',
          // type: 'task',
          start_time: '',
          end_time: '',
          introduction: '',
          visible: true
        }
      },
      // 提交新单元 修改新单元信息 触发该事件
      submitUnit () {
        this.$refs.unitForm.validate((valid) => {
          if (valid) {
            // 若开始时间大于结束时间，即下值为true 直接return
            if (this.isShowDuration) {
              return
            }
            let data = this.createUnit
            data.course_id = this.courseID
            let func = this.dialogTitle === '创建新单元' ? 'createCourseUnit' : 'editCourseUnit'
            if (func === 'editCourseUnit') {
              data.task_id = this.currentUnit
            }
            api[func](data).then(res => {
              // 创建或修改单元成功后重新获取单元列表
              this.getCourseUnitList()
              this.dialogFormVisible = false
            }, res => {
              this.$error(res.data.data)
              this.dialogFormVisible = false
            })
          } else {
            this.$error('填写有误')
          }
        })
      },
      // 跳转到单元的习题列表
      goUnitProblemList (id) {
        this.$router.push({name: 'course-unit-problem-list', params: {courseId: this.courseID, taskId: id}})
      },
      // 点击修改单元 显示弹窗
      editUnitSetting (row) {
        // 更改弹窗标题
        this.dialogTitle = '修改单元'
        this.dialogFormVisible = true
        // 进行赋值
        this.currentUnit = row.id
        let keys = Object.keys(this.createUnit)
        keys.forEach(key => {
          this.createUnit[key] = row[key]
        })
        // 传过来的日期格式问题，不清楚为什么修改信息时会有问题。。
        this.createUnit.start_time = new Date(this.createUnit.start_time)
        this.createUnit.end_time = new Date(this.createUnit.end_time)
      },
      // 删除单元
      deleteUnit (id) {
        this.$confirm('是否删除单元？ 请谨慎操作', '删除单元', {
          type: 'warning'
        }).then(() => {
          let params = {
            course_id: this.courseID,
            task_id: id
          }
          api.deleteCourseUnit(params).then(res => {
            this.$success('删除成功')
            this.getCourseUnitList()
          }, res => {
            this.$error(res.data.data)
          })
        })
      }
    },
    computed: {
      unitDuration () {
        if (this.createUnit.end_time) {
          let result = time.durationTime(this.createUnit.start_time, this.createUnit.end_time)
          if (!result) {
            return '错误'
          }
          return result
        }
        return '无限'
      },
      isShowDuration () {
        if (this.durationError) {
          return true
        }
        return false
      },
      durationError () {
        let judgeLegalS = time.unitTimeLegal(this.createUnit.start_time, this.course.start_time, this.course.end_time)
        let judgeLegalE = time.unitTimeLegal(this.createUnit.end_time, this.course.start_time, this.course.end_time)
        let result = time.durationTime(this.createUnit.start_time, this.createUnit.end_time)
        if (!judgeLegalS) {
          return '开始时间必须在课程持续时间内'
        } else if (!judgeLegalE) {
          return '结束时间必须在课程持续时间内'
        } else if (!result) {
          return '结束时间不能在开始时间之前'
        }
        return ''
      }
    }
  }
</script>
<style scoped lang="less">
  .unit-count {
  	font-size: 14px;
  	color: #8a8a8a;
  	.count {
  	  color: #000;
  	  margin-right: 10px;
  	}
  }
  .title {
  	font-size: 20px;
  	color: #333;
  	font-weight: 300;
  }
  .notice {
  	font-size: 12px;
  	color: #555;
  	margin-left: 10px;
  }
</style>