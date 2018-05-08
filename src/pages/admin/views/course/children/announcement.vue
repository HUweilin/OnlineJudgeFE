<template>
  <div class="announcement view">
    <Panel title="公告">
      <div class="list">
        <el-table
          v-loading="loading"
          element-loading-text="loading"
          ref="table"
          :data="announcementList"
          style="width: 100%">
          <el-table-column
            width="100"
            prop="id"
            label="编号" align="center">
          </el-table-column>
          <el-table-column
            prop="title"
            label="标题">
          </el-table-column>
          <el-table-column
            prop="create_time"
            label="创建时间" align="center" width="150">
            <template slot-scope="scope">
              {{ scope.row.create_time | localtime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="last_update_time"
            label="最近更新时间" align="center" width="150">
            <template slot-scope="scope">
              {{scope.row.last_update_time | localtime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="created_by.username"
            label="创建者" align="center">
          </el-table-column>
          <el-table-column
            width="100"
            prop="visible"
            label="是否可见" align="center">
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
            label="操作"
            width="200" align="center">
            <div slot-scope="scope">
              <icon-btn name="修改" icon="edit" @click.native="openAnnouncementDialog(scope.row.id)"></icon-btn>
              <icon-btn name="删除" icon="trash" @click.native="deleteAnnouncement(scope.row.id)"></icon-btn>
            </div>
          </el-table-column>
        </el-table>
        <div class="panel-options">
          <el-button type="primary" size="small" @click="openAnnouncementDialog(null)" icon="el-icon-plus">创建</el-button>
        </div>
      </div>
    </Panel>
    <!--对话框-->
    <el-dialog :title="announcementDialogTitle" :visible.sync="showEditAnnouncementDialog"
               @open="onOpenEditDialog" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="标题" required>
          <el-input
            v-model="announcement.title"
            placeholder="标题" class="title-input">
          </el-input>
        </el-form-item>
        <el-form-item label="内容" required>
          <Simditor v-model="announcement.content"></Simditor>
        </el-form-item>
        <div class="visible-box">
          <span>是否可见</span>
          <el-switch
            v-model="announcement.visible"
            active-text=""
            inactive-text="">
          </el-switch>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <cancel @click.native="showEditAnnouncementDialog = false"></cancel>
          <save type="primary" @click.native="submitAnnouncement"></save>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  import Simditor from '@admin/components/Simditor.vue'
  import api from '../../../api.js'

  export default {
    props: {
      course: {
        type: Object,
        required: true
      }
    },
    components: {
      Simditor
    },
    data () {
      return {
        courseID: '',
        // 显示编辑公告对话框
        showEditAnnouncementDialog: false,
        // 公告列表
        announcementList: [],
        // 一页显示的公告数
        pageSize: 15,
        // 总公告数
        total: 0,
        // 当前公告id
        currentAnnouncementId: null,
        mode: 'create',
        // 公告 (new | edit) model
        announcement: {
          title: '',
          visible: true,
          content: ''
        },
        // 对话框标题
        announcementDialogTitle: '修改公告',
        // 是否显示loading
        loading: true
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.courseID = this.$route.params.courseId
        this.getCourseAnnouncementList()
      },
      getCourseAnnouncementList () {
        this.loading = true
        api.getCourseAnnouncementList(this.courseID).then(res => {
          this.loading = false
          this.announcementList = res.data.data
        }).catch(() => {
          this.loading = false
        })
      },
      // 打开编辑对话框的回调
      onOpenEditDialog () {
        // todo 优化
        // 暂时解决 文本编辑器显示异常bug
        setTimeout(() => {
          if (document.createEvent) {
            let event = document.createEvent('HTMLEvents')
            event.initEvent('resize', true, true)
            window.dispatchEvent(event)
          } else if (document.createEventObject) {
            window.fireEvent('onresize')
          }
        }, 0)
      },
      // 提交编辑
      // 默认传入MouseEvent
      submitAnnouncement (data = undefined) {
        let funcName = ''
        if (!data.title) {
          data = {
            id: this.currentAnnouncementId,
            title: this.announcement.title,
            content: this.announcement.content,
            visible: this.announcement.visible
          }
        }
        data.course_id = this.courseID
        funcName = this.mode === 'edit' ? 'updateCourseAnnouncement' : 'createCourseAnnouncement'
        api[funcName](data).then(res => {
          this.showEditAnnouncementDialog = false
          this.init()
        }).catch()
      },
      // 删除公告
      deleteAnnouncement (announcementId) {
        this.$confirm('确认删除该公告?', '确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          api.deleteCourseAnnouncement(announcementId).then(res => {
            this.loading = true
            this.init()
          })
        }).catch(() => {
          this.loading = true
        })
      },
      openAnnouncementDialog (id) {
        this.showEditAnnouncementDialog = true
        if (id !== null) {
          this.currentAnnouncementId = id
          this.announcementDialogTitle = '修改公告'
          this.announcementList.find(item => {
            if (item.id === this.currentAnnouncementId) {
              this.announcement.title = item.title
              this.announcement.visible = item.visible
              this.announcement.content = item.content
              this.mode = 'edit'
            }
          })
        } else {
          this.announcementDialogTitle = '创建公告'
          this.announcement.title = ''
          this.announcement.visible = true
          this.announcement.content = ''
          this.mode = 'create'
        }
      },
      handleVisibleSwitch (row) {
        this.mode = 'edit'
        this.submitAnnouncement({
          id: row.id,
          title: row.title,
          content: row.content,
          visible: row.visible
        })
      }
    },
    watch: {
      $route () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .title-input {
    margin-bottom: 20px;
  }

  .visible-box {
    margin-top: 10px;
    width: 205px;
    float: left;
  }
</style>
