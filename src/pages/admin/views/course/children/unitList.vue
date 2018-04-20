<template>
  <Panel title="单元列表">
    <div slot="header">
      <div class="unit-count">
        单元总数：<span class="count">{{course.total_task}}</span>
        <el-button size="small" type="primary" @click="dialogFormVisible=true">添加单元</el-button>
      </div>
    </div>
  	<el-table v-loading="loading" :data="units" border>
  	  <el-table-column label="序号" prop="task_id" width="60"></el-table-column>
  	  <el-table-column label="类型" width="80">
  	    <template slot-scope="scope">
  	      <span>{{unitTypes[scope.type]}}</span>
  	    </template>
  	  </el-table-column>
  	  <el-table-column label="开始时间" prop="start_time"></el-table-column>
  	  <el-table-column label="结束时间" prop="end_time"></el-table-column>
  	  <el-table-column width="200" label="操作">
  	    <template slot-scope="scope">
  	      <icon-btn name="习题列表" icon="tasks" @click.native="goUnitProblemList(scope.row.id)"></icon-btn>
  	      <icon-btn name="设置" icon="gear" @click.native="goUnitSetting(scope.row.id)"></icon-btn>
  	    </template>
  	  </el-table-column>
  	</el-table>
  	<el-dialog :visible.sync="dialogFormVisible">
  	  <div slot="title">
  	  	<span class="title">创建单元</span>
  	  	<span class="notice">带<i style="color: red;"> * </i>号为必填项</span>
  	  </div>
  	  <el-form ref="unitForm" :model="createUnit" :rules="rules" label-position="right" label-width="80px">
  	    <el-form-item label="名称" prop="title">
  	      <el-input v-model="createUnit.title" placeholder="单元名称"></el-input>
  	    </el-form-item>
  	    <el-form-item label="类型">
          <el-select v-model="createUnit.type" placeholder="请选择类型">
            <el-option v-for="(item, key) in unitTypes" :label="item" :value="key" :key="key"></el-option>
          </el-select>
	    </el-form-item>
	    <el-form-item label="开始时间" prop="start_time">
	      <el-date-picker type="datetime" placeholder="选择日期" v-model="createUnit.start_time"></el-date-picker>
	    </el-form-item>
	    <el-form-item label="结束时间" prop="end_time">
	      <el-date-picker type="datetime" placeholder="选择日期" v-model="createUnit.end_time"></el-date-picker>
	    </el-form-item>
	    <el-form-item error="结束日期不能在开始日期之前" :show-message="isShowDuration">
          <div slot="label">
            <i class="el-icon-time "></i>
            <span>持续时间</span>
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
        <el-button type="primary" @click="submitUnit">创 建</el-button>
      </span>
  	</el-dialog>
  </Panel>
</template>
<script>
  import api from '../../../api.js'
  import utils from '@/utils/utils.js'
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
        // 存储新建单元
        createUnit: {
          title: '',
          type: 'task',
          start_time: '',
          end_time: '',
          introduction: '',
          visible: true
        },
        rules: {
          title: {required: true, message: '请输入名称', trigger: 'blur'},
          type: {required: true, trigger: 'change'},
          start_time: {required: true, message: '请选择时间', type: 'date', trigger: 'change'},
          end_time: {required: true, message: '请选择时间', type: 'date', trigger: 'change'}
        },
        loading: false,
        // 单元的类型
        unitTypes: {
          'task': '作业',
          'practice': '练习'
        },
        // 单元持续时间
        unitDuration: '无限',
        // 错误信息控制变量(单元时间)
        isShowDuration: false
      }
    },
    mounted () {
      this.courseID = this.$route.params.courseId
      this.getCourseUnitList()
    },
    methods: {
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
      // 创建新单元
      submitUnit () {
        this.$refs.unitForm.validate((valid) => {
          if (valid) {
            // 若开始时间大于结束时间，即下值为true 直接return
            if (this.isShowDuration) {
              return
            }
            let data = utils.filterEmptyValue(this.createUnit)
            data.course_id = this.courseID
            api.createCourseUnit(data).then(res => {
              // 创建单元成功后重新获取单元列表
              this.getCourseUnitList()
            }, res => {
              res.$error(res.data.data)
            })
          } else {
            this.$error('填写有误')
          }
        })
      },
      // 跳转到单元的习题
      goUnitProblemList (id) {
        let params = {
          course_id: this.courseID,
          task_id: id
        }
        api.getUnitProblemList(params).then(res => {}, res => {})
      },
      // 跳转到单元的设置
      goUnitSetting (id) {
        let params = {
          course_id: this.courseID,
          task_id: id
        }
        api.getUnitSetting(params).then(res => {}, res => {})
      }
    },
    watch: {
      'createUnit.start_time' (newDate) {
        // 若结束时间有值则进行计算，否则仍为无限
        if (this.createUnit.end_time !== '') {
          let result = time.durationTime(newDate, this.createUnit.end_time)
          if (result === false) {
            // 说明持续时间为负数，错误
            this.isShowDuration = true
          } else {
            this.isShowDuration = false
            this.unitDuration = result
          }
        }
      },
      'createUnit.end_time' (newDate) {
        if (newDate) {
          let result = time.durationTime(this.createUnit.start_time, newDate)
          if (result === false) {
            // 说明持续时间为负数，错误
            this.isShowDuration = true
          } else {
            this.isShowDuration = false
            this.unitDuration = result
          }
        } else {
          this.unitDuration = '无限'
        }
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