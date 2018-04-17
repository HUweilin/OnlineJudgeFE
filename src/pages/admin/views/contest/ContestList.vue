<template>
  <div class="view">
    <Panel title="竞赛列表">
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
        :data="contestList"
        style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <p>开始时间: {{props.row.start_time | localtime }}</p>
            <p>结束时间: {{props.row.end_time | localtime }}</p>
            <p>创建时间: {{props.row.create_time | localtime}}</p>
            <p>创建者: {{props.row.created_by.username}}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="id"
          width="80"
          label="编号">
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题">
        </el-table-column>
        <el-table-column
          label="规则类型"
          width="130">
          <template slot-scope="scope">
            <el-tag type="gray">{{scope.row.rule_type}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="竞赛类型"
          width="180">
          <template slot-scope="scope">
            <el-tag :type="scope.row.contest_type === 'Public' ? 'success' : 'primary'">
              {{ scope.row.contest_type}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="当前状态"
          width="130">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '-1' ? 'danger' : scope.row.status === '0' ? 'success' : 'primary'">
              {{ scope.row.status | contestStatus}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          label="是否可见">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="handleVisibleSwitch(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="200"
          label="操作">
          <div slot-scope="scope">
            <icon-btn name="修改" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
            <icon-btn name="题目" icon="list-ol" @click.native="goContestProblemList(scope.row.id)"></icon-btn>
            <icon-btn name="公告" icon="info-circle"
                      @click.native="goContestAnnouncement(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
  </div>
</template>

<script>
  import api from '../../api.js'
  import { CONTEST_STATUS_REVERSE } from '@/utils/constants'

  export default {
    name: 'ContestList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        contestList: [],
        keyword: '',
        loading: false,
        currentPage: 1
      }
    },
    mounted () {
      this.getContestList(this.currentPage)
    },
    filters: {
      contestStatus (value) {
        return CONTEST_STATUS_REVERSE[value].name
      }
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getContestList(page)
      },
      getContestList (page) {
        this.loading = true
        api.getContestList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.contestList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      goEdit (contestId) {
        this.$router.push({name: 'edit-contest', params: {contestId}})
      },
      goContestAnnouncement (contestId) {
        this.$router.push({name: 'contest-announcement', params: {contestId}})
      },
      goContestProblemList (contestId) {
        this.$router.push({name: 'contest-problem-list', params: {contestId}})
      },
      handleVisibleSwitch (row) {
        api.editContest(row)
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      }
    }
  }
</script>
