<template>
  <div class="view">
    <Panel :title="$t('m.User_User')">
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button v-show="selectedUsers.length"
                       type="warning" icon="el-icon-fa-trash"
                       @click="deleteUsers(selectedUserIDs)">{{$t('m.delete')}}
            </el-button>
          </el-col>
          <el-col :span="selectedUsers.length ? 16: 24">
            <el-input v-model="keyword" prefix-icon="el-icon-search" :placeholder="$t('m.keyword')"></el-input>
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="loadingTable"
        element-loading-text="loading"
        @selection-change="handleSelectionChange"
        ref="table"
        :data="userList"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" :label="$t('m.User_ID')" align="center" width="70"></el-table-column>

        <el-table-column prop="username" :label="$t('m.User_Username')" align="center"></el-table-column>

        <el-table-column prop="create_time" :label="$t('m.Create_Time')" align="center" width="150">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>

        <el-table-column prop="last_login" :label="$t('m.Last_Login_Time')" align="center" width="150">
          <template slot-scope="scope">
            {{scope.row.last_login | localtime }}
          </template>
        </el-table-column>

        <el-table-column prop="real_name" :label="$t('m.User_Real_Name')" align="center"></el-table-column>

        <el-table-column prop="email" :label="$t('m.User_Email')" align="center" width="160"></el-table-column>

        <el-table-column prop="admin_type" :label="$t('m.User_Type')" align="center">
          <template slot-scope="scope">
            {{ scope.row.admin_type }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="$t('m.operation')" width="200" align="center">
          <template slot-scope="{row}">
            <icon-btn :name="$t('m.edit')" icon="edit" @click.native="openUserDialog(row.id)"></icon-btn>
            <icon-btn :name="$t('m.delete')" icon="trash" @click.native="deleteUsers([row.id])"></icon-btn>
          </template>
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

    <Panel>
      <span slot="title">{{$t('m.Import_User')}}
        <el-popover placement="right" trigger="hover">
          <p>仅支持的csv格式的文件导入,要求csv文件不带头, 共三列: 用户名,密码,邮箱。请保存为UTF-8编码的文件,否则中文可能会乱码</p>
          <i slot="reference" class="el-icon-fa-question-circle import-user-icon"></i>
        </el-popover>
      </span>
      <el-upload v-if="!uploadUsers.length"
                 action=""
                 :show-file-list="false"
                 accept=".csv"
                 :before-upload="handleUsersCSV">
        <el-button size="small" icon="el-icon-fa-upload" type="primary">{{$t('m.upload')}}</el-button>
      </el-upload>
      <template v-else>
        <el-table :data="uploadUsersPage">
          <el-table-column label="Username">
            <template slot-scope="{row}">
              {{row[0]}}
            </template>
          </el-table-column>
          <el-table-column label="Password">
            <template slot-scope="{row}">
              {{row[1]}}
            </template>
          </el-table-column>
          <el-table-column label="Email">
            <template slot-scope="{row}">
              {{row[2]}}
            </template>
          </el-table-column>
        </el-table>
        <div class="panel-options">
          <el-button type="primary" size="small"
                     icon="el-icon-fa-upload"
                     @click="handleUsersUpload">{{$t('m.upload_All')}}
          </el-button>
          <el-button type="warning" size="small"
                     icon="el-icon-fa-undo"
                     @click="handleResetData">{{$t('m.reset')}}
          </el-button>
          <el-pagination
            class="page"
            layout="prev, pager, next"
            :page-size="uploadUsersPageSize"
            :current-page.sync="uploadUsersCurrentPage"
            :total="uploadUsers.length">
          </el-pagination>
        </div>
      </template>
    </Panel>

    <Panel :title="$t('m.Generate_User')">
      <el-form :model="formGenerateUser" ref="formGenerateUser">
        <el-row type="flex" justify="space-between">
          <el-col :span="4">
            <el-form-item :label="$t('m.Prefix')" prop="prefix">
              <el-input v-model="formGenerateUser.prefix" placeholder="前缀"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Suffix')" prop="suffix">
              <el-input v-model="formGenerateUser.suffix" placeholder="后缀"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Start_Number')" prop="number_from" required>
              <el-input-number v-model="formGenerateUser.number_from" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.End_Number')" prop="number_to" required>
              <el-input-number v-model="formGenerateUser.number_to" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Password_Length')" prop="password_length" required>
              <el-input v-model="formGenerateUser.password_length"
                        placeholder="$t('m.Password_Length')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="generateUser" icon="el-icon-fa-users" :loading="loadingGenerate">{{$t('m.Generate_User')}}
          </el-button>
          <span class="userPreview" v-if="formGenerateUser.number_from && formGenerateUser.number_to &&
                                          formGenerateUser.number_from <= formGenerateUser.number_to">
            用户名为 {{formGenerateUser.prefix + formGenerateUser.number_from + formGenerateUser.suffix}},
            <span v-if="formGenerateUser.number_from + 1 < formGenerateUser.number_to">
              {{formGenerateUser.prefix + (formGenerateUser.number_from + 1) + formGenerateUser.suffix + '...'}}
            </span>
            <span v-if="formGenerateUser.number_from + 1 <= formGenerateUser.number_to">
              {{formGenerateUser.prefix + formGenerateUser.number_to + formGenerateUser.suffix}}
            </span>
          </span>
        </el-form-item>
      </el-form>
    </Panel>
    <!--对话框-->
    <el-dialog :title="$t('m.User_Info')" :visible.sync="showUserDialog" :close-on-click-modal="false">
      <el-form :model="user" label-width="120px" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Username')" required>
              <el-input v-model="user.username"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Real_Name')" required>
              <el-input v-model="user.real_name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Email')" required>
              <el-input v-model="user.email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_New_Password')">
              <el-input v-model="user.password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Type')">
              <el-select v-model="user.admin_type">
                <el-option label="一般用户" value="Regular User"></el-option>
                <el-option label="管理员" value="Admin"></el-option>
                <el-option label="超级管理员" value="Super Admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Problem_Permission')">
              <el-select v-model="user.problem_permission" :disabled="user.admin_type!=='Admin'">
                <el-option label="无" value="None"></el-option>
                <el-option label="自己" value="Own"></el-option>
                <el-option label="所有" value="All"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Two_Factor_Auth')">
              <el-switch
                v-model="user.two_factor_auth"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Open Api">
              <el-switch
                v-model="user.open_api"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Is_Disabled')">
              <el-switch
                v-model="user.is_disabled"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <cancel @click.native="showUserDialog = false"></cancel>
        <save @click.native="saveUser()"></save>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import papa from 'papaparse'
  import api from '../../api.js'
  import utils from '@/utils/utils'

  export default {
    name: 'User',
    data () {
      return {
        // 一页显示的用户数
        pageSize: 10,
        // 用户总数
        total: 0,
        // 用户列表
        userList: [],
        uploadUsers: [],
        uploadUsersPage: [],
        uploadUsersCurrentPage: 1,
        uploadUsersPageSize: 15,
        // 搜索关键字
        keyword: '',
        // 是否显示用户对话框
        showUserDialog: false,
        // 当前用户model
        user: {},
        loadingTable: false,
        loadingGenerate: false,
        // 当前页码
        currentPage: 0,
        selectedUsers: [],
        formGenerateUser: {
          prefix: '',
          suffix: '',
          number_from: 0,
          number_to: 0,
          password_length: 8
        }
      }
    },
    mounted () {
      this.getUserList(1)
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getUserList(page)
      },
      // 提交修改用户的信息
      saveUser () {
        api.editUser(this.user).then(res => {
          // 更新列表
          this.getUserList(this.currentPage)
        }).then(() => {
          this.showUserDialog = false
        }).catch(() => {
        })
      },
      // 打开用户对话框
      openUserDialog (id) {
        this.showUserDialog = true
        api.getUser(id).then(res => {
          this.user = res.data.data
          this.user.password = ''
        })
      },
      // 获取用户列表
      getUserList (page) {
        this.loadingTable = true
        api.getUserList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loadingTable = false
          this.total = res.data.data.total
          this.userList = res.data.data.results
        }, res => {
          this.loadingTable = false
        })
      },
      deleteUsers (ids) {
        this.$confirm('确认删除该用户?', '确认', {
          type: 'warning'
        }).then(() => {
          api.deleteUsers(ids.join(',')).then(res => {
            this.getUserList(this.currentPage)
          }).catch(() => {
            this.getUserList(this.currentPage)
          })
        }, () => {
        })
      },
      handleSelectionChange (val) {
        this.selectedUsers = val
      },
      generateUser () {
        this.$refs['formGenerateUser'].validate((valid) => {
          if (!valid) {
            this.$error('请确认错误区域')
            return
          }
          this.loadingGenerate = true
          let data = Object.assign({}, this.formGenerateUser)
          api.generateUser(data).then(res => {
            this.loadingGenerate = false
            let url = '/admin/generate_user?file_id=' + res.data.data.file_id
            utils.downloadFile(url).then(() => {
              this.$alert('所有用户创建成功,用户表已下载到磁盘上.', 'Notice')
            })
            this.getUserList(1)
          }).catch(() => {
            this.loadingGenerate = false
          })
        })
      },
      handleUsersCSV (file) {
        papa.parse(file, {
          complete: (results) => {
            let data = results.data.filter(user => {
              return user[0] && user[1] && user[2]
            })
            let delta = results.data.length - data.length
            if (delta > 0) {
              this.$warning(delta + ' users have been filtered due to empty value')
            }
            this.uploadUsersCurrentPage = 1
            this.uploadUsers = data
            this.uploadUsersPage = data.slice(0, this.uploadUsersPageSize)
          },
          error: (error) => {
            this.$error(error)
          }
        })
      },
      handleUsersUpload () {
        api.importUsers(this.uploadUsers).then(res => {
          this.getUserList(1)
          this.handleResetData()
        }).catch(() => {
        })
      },
      handleResetData () {
        this.uploadUsers = []
      }
    },
    computed: {
      selectedUserIDs () {
        let ids = []
        for (let user of this.selectedUsers) {
          ids.push(user.id)
        }
        return ids
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      'user.admin_type' () {
        if (this.user.admin_type === 'Super Admin') {
          this.user.problem_permission = 'All'
        } else if (this.user.admin_type === 'Regular User') {
          this.user.problem_permission = 'None'
        }
      },
      'uploadUsersCurrentPage' (page) {
        this.uploadUsersPage = this.uploadUsers.slice((page - 1) * this.uploadUsersPageSize, page * this.uploadUsersPageSize)
      }
    }
  }
</script>

<style scoped lang="less">
  .import-user-icon {
    color: #555555;
    margin-left: 4px;
  }

  .userPreview {
    padding-left: 10px;
  }

  .notification {
    p {
      margin: 0;
      text-align: left;
    }
  }
</style>
