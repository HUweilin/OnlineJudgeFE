<template>
  <div>
    <Panel title="习题列表">
      <div slot="header">
        <el-select v-model="problemType" prefix-icon="el-icon-search" @change="selectChange">
          <el-option label="所有" value="all"></el-option>
          <el-option label="编程题" value="problem"></el-option>
          <el-option label="小题" value="smallProblem"></el-option>
        </el-select>
      </div>
      <el-table v-loading="loading" :data="showProblemList">
        <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
        <el-table-column label="类型" align="center" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.type">{{SMALL_PROBLEM_TYPE[scope.row.type].name}}</span>
            <span v-else>编程题</span>
          </template>
        </el-table-column>
        <el-table-column label="标题" align="center" prop="title"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <icon-btn name="详情" icon="search" @click.native="showProblemDetail(scope.row)"></icon-btn>
            <icon-btn v-if="!scope.row.is_public" name="修改" icon="edit" @click.native="goEdit(scope.row)"></icon-btn>
            <icon-btn icon="trash" name="删除题目" @click.native="deleteProblem(scope.row)"></icon-btn>
          </template>
        </el-table-column>
      </el-table>
      <div class="panel-options">
	      <el-button type="primary" size="small" @click="goCreateProblem(true)" icon="el-icon-plus">创建编程题
	      </el-button>
	      <el-button type="primary" size="small" @click="goCreateProblem(false)" icon="el-icon-plus">创建小题
	      </el-button>
	      <el-button type="primary" size="small" @click="showAddProblemDialog(false)" icon="el-icon-plus">添加公共小题
	      </el-button>
	      <el-button type="primary" size="small" @click="showAddProblemDialog(true)" icon="el-icon-plus">添加公共编程题
	      </el-button>
      </div>
    </Panel>
    <el-dialog title="添加公共题目" width="50%" :visible.sync="addProblemDialogVisible" @close="closeDialog">
      <add-public-problem v-if="addProblemDialogVisible" 
      :courseID="courseID" 
      :taskID="taskID" 
      :isProblem="is_problem"
      @on-change="successAddProblem"></add-public-problem>
    </el-dialog>
    <el-dialog :title="showProblem.title" width="60%" :visible.sync="showDetailDialog">
      <div class="pro-container">
        <h3 class="title">
          {{showProblem.title}} 
          <span class="type" v-if="showProblem.type">{{SMALL_PROBLEM_TYPE[showProblem.type].name}}</span>
        </h3>
        <h3 class="desc">描述</h3>
        <p class="content" v-html="showProblem.description"></p>
        <template v-if="showProblem.type">
          <div class="options" v-if="showProblem.type !== SMALL_PROBLEM_TYPE.Blank.value">
            <span class="title">题目选项</span>
            <div class="option" v-for="(item, index) in showProblem.options">
              <span class="name">选项{{index + 1}}:</span>
              <span class="value">{{item}}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <h3>输入</h3>
          <p class="content" v-html="showProblem.input_description"></p>
          <h3>输出</h3>
          <p class="content" v-html="showProblem.output_description"></p>
        </template>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import api from '@admin/api.js'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants.js'
  import addPublicProblem from './addPublicProblem'
  export default {
    components: {
      addPublicProblem
    },
    data () {
      return {
        // 小题题目
        smallProblemList: [],
        // 编程题题目
        programProblemList: [],
        // 展示的题目列表
        showProblemList: [],
        loading: false,
        courseID: '',
        taskID: '',
        // 添加题库题目弹窗的控制变量
        addProblemDialogVisible: false,
        // 展示详情弹窗控制变量
        showDetailDialog: false,
        // 题目详情
        showProblem: [],
        // 展示的习题类型 分为小题、编程题、所有
        problemType: 'all',
        SMALL_PROBLEM_TYPE: SMALL_PROBLEM_TYPE,
        // 添加公共题库的题 编程题为true 小题为false
        is_problem: true
      }
    },
    mounted () {
      this.courseID = this.$route.params.courseId
      this.taskID = this.$route.params.taskId
      this.getUnitProblemList()
    },
    methods: {
      getUnitProblemList () {
        this.loading = true
        let params = {
          task_id: this.taskID
        }
        api.getUnitProblemList(params).then(res => {
          // 小题
          this.smallProblemList = res.data.data1
          // 编程题
          this.programProblemList = res.data.data2
          // 展示的题目
          this.selectChange(this.problemType)
          this.loading = false
        }, res => {
          this.$error(res.data.data)
          this.loading = false
        })
      },
      // 展示题目详情
      showProblemDetail (row) {
        let func = row.type ? 'getSmallProblem' : 'getProblem'
        api[func](row.id).then(res => {
          this.showDetailDialog = true
          this.showProblem = res.data.data
        }, res => {
          this.$error(res.data.data)
        })
      },
      // 修改题目信息
      goEdit (row) {
        let params = {
          courseId: this.courseID,
          taskId: this.taskID,
          problemId: row.id
        }
        if (row.type) {
          // 小题跳转
          this.$router.push({name: 'edit-unit-small-problem', params: params})
        } else {
          // 编程题修改跳转
          this.$router.push({name: 'edit-course-unit-problem', params: params})
        }
      },
      // 删除题目
      deleteProblem (row) {
        this.$confirm('是否删除单元？ 请谨慎操作', '删除单元', {
          type: 'warning'
        }).then(() => {
          // 题目是编程题还是小题
          let type = true
          if (row.type) {
            type = false
          }
          let data = {
            task_id: this.taskID,
            problem_id: row.id,
            is_problem: type
          }
          api.deleteUnitProblem(data).then(res => {
            // 删除成功后重新获取列表
            this.getUnitProblemList()
            this.$success('删除成功')
          }, res => {
            this.$error(res.data.data)
          })
        })
      },
      // 新建题目
      goCreateProblem (type) {
        // 分为编程题和小题
        if (type) {
          this.$router.push({name: 'create-unit-problem', params: {courseId: this.courseID, taskId: this.taskID}})
        } else {
          this.$router.push({name: 'create-unit-small-problem', params: {courseId: this.courseID, taskId: this.taskID}})
        }
      },
      // 显示弹窗
      showAddProblemDialog (type) {
        this.is_problem = type
        this.addProblemDialogVisible = true
      },
      // 关闭弹窗
      closeDialog () {
        this.is_problem = ''
      },
      // 习题类型变化触发
      selectChange (type) {
        // 对数据进行筛选再显示
        if (type === 'all') {
          // 展示所有
          this.showProblemList = this.programProblemList.concat(this.smallProblemList)
        } else if (type === 'problem') {
          // 展示编程题
          this.showProblemList = this.programProblemList
        } else {
          // 展示小题
          this.showProblemList = this.smallProblemList
        }
      },
      // 成功添加公共题库的题触发
      successAddProblem () {
        this.addProblemDialogVisible = false
        this.getUnitProblemList()
      }
    }
  }
</script>
<style lang="less" scoped>
  .pro-container {
    color: #000;
  }
  .title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin: 0;
    .type {
      font-size: 12px;
      font-weight: normal;
      margin-left: 10px;
    }
  }
  .desc {
    font-size: 16px;
  }
  .options {
    .title {
      font-size: 16px;
    }
    .option {
      margin: 6px 0;
      .name {
        font-weight: 700;
      }
      .value {
        margin-left: 10px;
      }
    }
  }
  .content {

  }
</style>