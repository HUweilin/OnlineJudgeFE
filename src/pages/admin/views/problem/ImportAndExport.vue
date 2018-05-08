<template>
  <div>
    <panel title="导出题库">
      <el-table :data="problems"
                v-loading="loadingProblems" @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="60">
        </el-table-column>
        <el-table-column
          label="编号"
          width="100"
          prop="id">
        </el-table-column>
        <el-table-column
          label="展示编号"
          width="200"
          prop="_id">
        </el-table-column>
        <el-table-column
          label="标题"
          prop="title">
        </el-table-column>
        <el-table-column
          prop="created_by.username"
          label="创建者">
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="创建时间">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>
      </el-table>

      <div class="panel-options">
        <el-button type="primary" size="small" v-show="selected_problems.length" @click="exportProblems" icon="el-icon-fa-arrow-down">导出
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="getProblems"
          :page-size="limit"
          :total="total">
        </el-pagination>
      </div>
    </panel>
    <panel title="导入题库">
      <el-upload
        :action="importUrl"
        name="file"
        :show-file-list="false"
        :with-credentials="true"
        :on-success="uploadSucceeded"
        :on-error="uploadFailed">
        <el-button size="small" type="primary" icon="el-icon-fa-upload">选择文件</el-button>
      </el-upload>
    </panel>
  </div>
</template>
<script>
  import api from '@admin/api'
  import utils from '@/utils/utils'

  export default {
    name: 'import_and_export',
    data () {
      return {
        page: 1,
        limit: 10,
        total: 0,
        loadingProblems: false,
        loadingImporting: false,
        problems: [],
        selected_problems: [],
        routeName: '',
        // 导出的url
        exportUrl: '',
        // 导入的url
        importUrl: ''
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.routeName = this.$route.name
        // 根据当前路由，设置导入导出题目的url
        let bool = this.routeName === 'problem_batch_ops'
        this.exportUrl = bool ? '/admin/export_problem?' : '/admin/export_sm_problem'
        this.importUrl = bool ? '/admin/import_problem?' : '/admin/import_sm_problem'
        this.getProblems()
      },
      handleSelectionChange (val) {
        this.selected_problems = val
      },
      getProblems (page = 1) {
        // 判断是获取编程题题库还是小题题库
        let func = this.routeName === 'problem_batch_ops' ? 'getProblemList' : 'getSmallProblemList'
        let params = {
          offset: (page - 1) * this.limit,
          limit: this.limit
        }
        this.loadingProblems = true
        api[func](params).then(res => {
          this.problems = res.data.data.results
          this.loadingProblems = false
        })
      },
      exportProblems () {
        let params = []
        for (let p of this.selected_problems) {
          params.push('problem_id=' + p.id)
        }
        let url = this.exportUrl + params.join('&')
        utils.downloadFile(url)
      },
      uploadSucceeded (response) {
        if (response.error) {
          this.$error(response.data)
        } else {
          this.$success('Successfully imported ' + response.data.import_count + ' problems')
          this.getProblems()
        }
      },
      uploadFailed () {
        this.$error('上传失败！')
      }
    },
    watch: {
      '$route' () {
        this.init()
      }
    }
  }
</script>

<style scoped lang="less">

</style>
