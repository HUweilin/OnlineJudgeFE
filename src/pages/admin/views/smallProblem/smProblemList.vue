<template>
  <div class="view">
    <Panel title="小题题库">
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="关键词">
        </el-input>
      </div>
      <el-table
        v-loading="loading"
        element-loading-text="loading"
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        style="width: 100%">
        <el-table-column
          width="100"
          prop="id"
          label="编号" align="center">
        </el-table-column>
        <el-table-column width="80" prop="_id" label="展示编号" align="center">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row._id}}</span>
            <el-input v-show="row.isEditing" v-model="row._id"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题" align="center">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row.title}}</span>
            <el-input v-show="row.isEditing" v-model="row.title"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center">
          <template slot-scope="scope">
            <span>{{SMALL_PROBLEM_TYPE[scope.row.type].name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_by.username"
          label="创建者" align="center">
        </el-table-column>
        <el-table-column
          width="200"
          prop="create_time"
          label="创建时间" align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          prop="visible"
          label="是否可见" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="250" align="center">
          <div slot-scope="scope">
            <icon-btn name="修改" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
            <!-- <icon-btn v-if="contestId" name="添加到公共题目" icon="clone"
                      @click.native="makeContestProblemPublic(scope.row.id)"></icon-btn> -->
            <!-- <icon-btn icon="download" name="下载测试用例"
                      @click.native="downloadTestCase(scope.row.id)"></icon-btn> -->
            <icon-btn icon="trash" name="删除题目"
                      @click.native="deleteProblem(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-button type="primary" size="small"
                   @click="goCreateProblem" icon="el-icon-plus">创建
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
    <el-dialog title="确认更新该题目? "
               width="20%"
               :visible.sync="InlineEditDialogVisible"
               @close-on-click-modal="false">
      <div>
        <p>展示编号: {{currentRow._id}}</p>
        <p>标题: {{currentRow.title}}</p>
      </div>
      <span slot="footer">
        <cancel @click.native="InlineEditDialogVisible = false; getProblemList(currentPage)"></cancel>
        <save @click.native="updateProblem(currentRow)"></save>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import utils from '@/utils/utils'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants'
  export default {
    name: 'smallProblemList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        problemList: [],
        keyword: '',
        loading: false,
        currentPage: 1,
        routeName: '',
        // contestId: '',
        // for make public use
        currentProblemID: '',
        currentRow: {},
        InlineEditDialogVisible: false,
        makePublicDialogVisible: false,
        addProblemDialogVisible: false,
        SMALL_PROBLEM_TYPE: SMALL_PROBLEM_TYPE
      }
    },
    mounted () {
      this.routeName = this.$route.name
      // this.contestId = this.$route.params.contestId
      this.getProblemList(this.currentPage)
    },
    methods: {
      handleDblclick (row) {
        row.isEditing = true
      },
      goEdit (problemId) {
        if (this.routeName === 'small-problem-list') {
          this.$router.push({name: 'edit-small-problem', params: {problemId}})
        }
      },
      goCreateProblem () {
        if (this.routeName === 'small-problem-list') {
          this.$router.push({name: 'create-small-problem'})
        }
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getProblemList(page)
      },
      // 获取小题列表
      getProblemList (page = 1) {
        this.loading = true
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          keyword: this.keyword
        }
        api.getSmallProblemList(params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          for (let problem of res.data.data.results) {
            problem.isEditing = false
          }
          this.problemList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      deleteProblem (id) {
        this.$confirm('您只能删除没有提交的题目, 是否继续?', '删除题目', {
          type: 'warning'
        }).then(() => {
          api.deleteSmallProblem(id).then(() => [
            this.getProblemList(this.currentPage - 1)
          ]).catch(() => {
          })
        }, () => {
        })
      },
      makeContestProblemPublic (problemID) {
        this.$prompt('请为其添加为公共题目的展示编号', '确认').then(({value}) => {
          api.makeContestProblemPublic({id: problemID, display_id: value}).catch()
        }, () => {
        })
      },
      updateProblem (row) {
        let data = Object.assign({}, row)
        api.editSmallProblem(data).then(res => {
          this.InlineEditDialogVisible = false
          this.getProblemList(this.currentPage)
        }).catch(() => {
          this.InlineEditDialogVisible = false
        })
      },
      handleInlineEdit (row) {
        this.currentRow = row
        this.InlineEditDialogVisible = true
      },
      downloadTestCase (problemID) {
        let url = '/admin/test_case?problem_id=' + problemID
        utils.downloadFile(url)
      },
      getPublicProblem () {
        api.getProblemList()
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        // this.contestId = newVal.params.contestId
        this.routeName = newVal.name
        this.getProblemList(this.currentPage)
      },
      'keyword' () {
        this.currentChange()
      }
    }
  }
</script>

<style scoped lang="less">
</style>
