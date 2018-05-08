<template>
  <div>
    <el-table :data="problems" v-loading="loading" @selection-change="handleSelectChange">
      <el-table-column align="center" type="selection" width="55"></el-table-column>
      <el-table-column label="编号" width="100" prop="id">
      </el-table-column>
      <el-table-column label="展示编号" width="200" prop="_id">
      </el-table-column>
      <el-table-column label="标题" prop="title">
      </el-table-column>
      <el-table-column label="类型" align="center" v-if="type">
        <template slot-scope="scope">
          <span>{{SMALL_PROBLEM_TYPE[scope.row.type].name}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="panel-options">
      <el-button type="primary" size="small" @click="handleAddProblem" icon="el-icon-plus">添加
        </el-button>
      <el-pagination class="page" layout="prev, pager, next" @current-change="getPublicProblem" :page-size="limit" :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
  import api from '@admin/api'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants.js'
  export default {
    props: {
      courseID: {
        type: String
      },
      taskID: {
        type: String
      },
      isProblem: {
        type: Boolean
      }
    },
    data () {
      return {
        page: 1,
        limit: 10,
        total: 0,
        loading: false,
        problems: [],
        func: '',
        // 小题类型
        SMALL_PROBLEM_TYPE: SMALL_PROBLEM_TYPE,
        // 被选择的题目数组
        problem_id: []
      }
    },
    mounted () {
      // 这里需要判断是请求小题题库还是编程题题库
      this.func = this.isProblem ? 'getProblemList' : 'getSmallProblemList'
      this.getPublicProblem()
    },
    methods: {
      // 获取题库列表
      getPublicProblem (page) {
        this.loading = true
        let params = {
          offset: (page - 1) * this.limit,
          limit: this.limit
        }
        api[this.func](params).then(res => {
          this.loading = false
          this.problems = res.data.data.results
          this.total = res.data.data.total
        }, res => {
          this.loading = false
        })
      },
      // 选择添加
      handleSelectChange (selection) {
        this.problem_id = []
        selection.forEach(item => {
          this.problem_id.push(item.id)
        })
      },
      handleAddProblem (id) {
        this.$confirm('确认添加该题目', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 这里进行添加操作
          let data = {
            problem_id: this.problem_id,
            course_id: this.courseID,
            task_id: this.taskID,
            is_problem: this.isProblem
          }
          api.addUnitProblemFromPublic(data).then(res => {
            this.$emit('on-change')
          }, res => {
            this.$error(res.data.data)
          })
        })
      }
    }
  }
</script>
<style></style>