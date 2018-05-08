<template>
  <Panel title="课程成员">
    <div class="student-container">学生数<span class="total">{{course.total_student}}</span></div>
    <div class="table-container">
      <div class="options-btn">
      	<el-button size="mini" 
      	type="primary" 
      	icon="el-icon-upload2" 
      	@click="showUploadDialog = true">上传学生名单</el-button>
        <el-button size="mini" type="danger" @click="handleDeleteSelect">删除勾选</el-button>
      </div>
      <el-table ref="studentTable" 
      :data="displayStu" border
      v-loading="loading" 
      element-loading-text="loading" 
      @selection-change="handleSelectChange">
        <el-table-column align="center" type="selection" width="55"></el-table-column>
        <el-table-column align="center" type="index" :index="indexMethod" label="序号" width="80"></el-table-column>
        <el-table-column align="center" prop="username" label="姓名"></el-table-column>
        <el-table-column align="center" prop="email" label="邮箱"></el-table-column>
      </el-table>
      <div class="panel-options">
        <el-pagination
        class="page"
        layout="prev, pager, next, sizes"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30]" 
        @current-change="currentChange"
        @size-change="handleSizeChange"
        :total="course.total_student">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="上传学生名单" width="60%" :visible.sync="showUploadDialog">
      <div class="notices">
        <div class="notice">
          <span class="el-icon-warning"></span>
          名单文件需要为 .xlsx 后缀的 表格文件
        </div>
        <div class="notice">
          <span class="el-icon-warning"></span>
          文件的每一行为一个学生信息 (表头为username)
        </div>
        <div class="notice">
          <span class="el-icon-warning"></span>
          具体格式如下
          <ul class="list">
          	<li>username</li>
          	<li>名字1</li>
          	<li>名字2</li>
          </ul>
        </div>
      </div>
      <div class="upload-container">
        <div class="btn">
        	<el-upload :on-change="handleSelectFile" action=""
        	 accept="xlsx" :auto-upload="false" :show-file-list="false" multiple>
        	  <el-button size="small" type="primary">选择文件</el-button>
        	</el-upload>
          <br />
          <el-button size="small" round type="primary" @click="uploadData" v-if="uploadStu.length">确定创建</el-button>
        </div>
        <div class="table">
          <div class="add-row">
            <el-input size="mini" class="inp" v-model="addStu.username">
              <template slot="prepend">姓名</template>
            </el-input>
            <el-button size="small" type="primary" @click="addUploadStu">添加</el-button>
            <el-button size="small" type="danger" @click="emptyUploadStu">清空表格</el-button>
          </div>
          <div class="data-error" v-if="dataError">姓名长度必须小于 20 位,均不能为空</div>
          <el-table :data="uploadStu" border>
            <el-table-column label="序号" width="50" type="index" :index="indexMethod"></el-table-column>
            <el-table-column align="center" label="姓名" width="150" prop="username"></el-table-column>
            <el-table-column align="center" label="操作" width="80">
              <template slot-scope="scope">
                <el-button size="small" type="danger" @click="deleteUploadStu(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </Panel>
</template>
<script>
  import api from '../../../api.js'
  import XLSX from 'xlsx'
  export default {
    props: {
      course: {
        type: Object
      }
    },
    data () {
      return {
        courseID: '',
        // 所有的学生信息
        students: [],
        // 当前展示的学生信息
        displayStu: [],
        pageSize: '10',
        loading: false,
        // 存储被选中的学生id
        studentSel: [],
        showUploadDialog: false,
        // 上传文件，展示解析后的学生数据
        uploadStu: [],
        // 手动添加的学生变量
        addStu: {
          username: ''
        },
        // 控制错误信息的显示(手动添加的数据信息)
        dataError: false,
        // 判断手动添加的用户名是否存在
        isExistUser: false
      }
    },
    mounted () {
      // 数据是一次获取再进行分页的
      this.courseID = this.$route.params.courseId
      this.getCourseMember()
    },
    methods: {
      getCourseMember () {
        this.loading = true
        api.getCourseMember(this.courseID).then(res => {
          this.loading = false
          this.students = res.data.data
          // 分割数据进行展示
          this.setDisplayStudents()
        }, res => {
          this.loading = false
        })
      },
      // 表格的序列号
      indexMethod (index) {
        return index + 1
      },
      // 选项值改变时触发
      handleSelectChange (sel) {
        this.studentSel = []
        sel.forEach(obj => {
          this.studentSel.push(obj.id)
        })
      },
      // 进行删除操作
      handleDeleteSelect () {
        this.$confirm('确认删除勾选的学生账号?', '删除学生账号', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 发送ajax删除信息
          let data = {
            student_id: this.studentSel,
            course_id: this.courseID
          }
          api.deleteCourseMember(data).then(res => {
            // 请求成功后重新获取学生信息
            this.$success('删除成功')
            this.getCourseMember()
            // 更新course的数据
            this.$emit('update-course')
          }, res => {
            this.$error(res.data.data)
          })
        })
      },
      // 切换展示的学生数据 参数为当前页数
      setDisplayStudents (page = 1) {
        let size = this.pageSize
        // 偏移量
        let offset = (page - 1) * size
        // 因为slice不包括end，所以不用减1
        let end = offset + size
        this.displayStu = this.students.slice(offset, end)
      },
      // 更改每页条数
      handleSizeChange (size) {
        this.pageSize = size
        this.setDisplayStudents()
      },
      // 当前页数改变时触发
      currentChange (page) {
        this.setDisplayStudents(page)
      },
      // 判断上传文件的类型
      checkFileType (file) {
        if (!/\.xlsx$/.test(file.name)) {
          this.$Notice.warning({
            title: '不支持该文件类型',
            desc: file.name + ' 的格式错误，请重新选择文件上传.'
          })
          return false
        }
        return true
      },
      // 文件状态改变时调用
      handleSelectFile (file) {
        if (!this.checkFileType(file)) {
          return false
        }
        let reader = new window.FileReader()
        let persons, workBook
        reader.onload = (e) => {
          try {
            workBook = XLSX.read(e.target.result, {
              type: 'binary'
            })
            persons = []
          } catch (e) {
            console.log(e)
          }
          for (let sheet in workBook.Sheets) {
            if (workBook.Sheets.hasOwnProperty(sheet)) {
              persons = persons.concat(XLSX.utils.sheet_to_json(workBook.Sheets[sheet]))
            }
          }
          let results = []
          // 上传文件的表头
          let keys = Object.keys(persons[0])
          // 遍历提取出的数组，取出每个对象的值 放入uploadStu中
          persons.forEach(obj => {
            let res = {}
            keys.forEach(key => {
              res[key] = obj[key]
            })
            results.push(res)
          })
          this.uploadStu = this.uploadStu.concat(results)
        }
        reader.readAsBinaryString(file.raw)
      },
      // 手动添加信息到uploadStu
      addUploadStu () {
        if (this.addStu.username === '') {
          this.dataError = true
          return
        }
        let data = Object.assign({}, this.addStu)
        this.uploadStu.unshift(data)
        this.addStu.username = ''
      },
      // 删除上传的excel对应行的信息
      deleteUploadStu (index) {
        this.uploadStu.splice(index, 1)
      },
      // 清空上传excel的所有数据
      emptyUploadStu () {
        this.uploadStu = []
      },
      // 数据上传到后台
      uploadData () {
        // uploadStu中存放的是一个个对象，需要传的只是其中的username
        let students = []
        this.uploadStu.forEach((obj) => {
          students.push(obj.username)
        })
        let data = {
          course_id: this.courseID,
          students: students
        }
        api.addCourseMember(data).then(res => {
          // 上传成功后重新获取数据
          this.getCourseMember()
          this.showUploadDialog = false
          this.emptyUploadStu()
          // 更新course的数据
          this.$emit('update-course')
        }, res => {
          this.$error(res.data.data)
          // this.showUploadDialog = false
        })
      }
    }
  }
</script>
<style scoped lang="less">
  .student-container {
  	font-size: 14px;
  	.total {
  	  display: inline-block;
  	  padding: 3px 7px;
  	  margin-left: 10px;
  	  border-radius: 5px;
  	  background-color: #eee;
  	}
  }
  .table-container {
  	padding: 15px;
  	.options-btn {
  	  margin-bottom: 5px;
  	  text-align: right;
  	}
  }
  .notices {
  	.notice {
      .list {
        list-style: none;
        font-size: 12px;
        color: #000;
        padding: 0 0 0 15px;
        margin: 0;
      }
  	}
    border-bottom: 2px solid #ddd;
  }
  .upload-container {
    margin-top: 10px;
    display: flex;
    .btn {
      flex: 1
    }
    .table {
      flex: 5;
      .add-row {
        margin-bottom: 5px;
        .inp {
          width: 30%;
          vertical-align: middle;
        }
        .noExist {
          display: inline-block;
          font-size: 12px;
          color: red;
          margin: 0 10px;
        }
      }
      .data-error {
        font-size: 12px;
        color: red;
      }
    }
  }
</style>