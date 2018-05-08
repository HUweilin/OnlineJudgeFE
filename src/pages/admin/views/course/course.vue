<template>
  <div class="course-container">
    <Panel :title="courseID ? '修改设置' : '创建课程'">
      <el-form label-position="left" label-width="80px" ref="courseForm" :model="realCourse" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课程名称" prop="title">
              <el-input name="title" v-model="realCourse.title" placeholder="课程名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课程介绍" prop="introduction">
              <el-input name="introduction" type="textarea" :autosize="{ minRows: 10 }" placeholder="请输入课程介绍" v-model="realCourse.introduction"></el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="3" :sm="24">
            <el-form-item label="是否可见">
              <el-switch
              v-model="realCourse.visible"
              active-text=""
              inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :sm="24">
            <el-form-item label="开始时间" prop="start_time">
              <el-date-picker 
              name="start_time"
              v-model="realCourse.start_time"
              type="datetime"
              placeholder="开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :sm="24">
            <el-form-item label="结束时间" prop="end_time">
              <el-date-picker
              name="end_time"
              v-model="realCourse.end_time"
              type="datetime"
              placeholder="结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :lg="5" :sm="24">
            <el-form-item error="结束日期不能在开始日期之前" 
            :show-message="isShowDuration">
              <div slot="label" style="width: 80px;">
                <i class="el-icon-time "></i>
                <span class="course-duration-text">持续时间</span>
              </div>
              <span style="margin-left: 10px;">{{courseDuration}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课程图片">
              <template v-if="!imgOptions.imgSrc">
                <el-upload drag="true" 
                name="image" 
                class="mini-container" 
                accept=".jpg,.jpeg,.png,.bmp,.gif" 
                action="" 
                :before-upload="handleSelectFile">
                <div style="padding: 30px 0">
                  <i class="el-icon-upload" style="color: #3399ff; font-size: 52px; margin: 0;"></i>
                  <p>拖拽图片到这里,或者点击这里手动上传</p>
                </div>
                </el-upload>
              </template>
              <template v-else>
                <div class="flex-container">
                  <div class="cropper-main">
                    <vueCropper 
                    ref="cropper"
                    autoCrop
                    fixed
                    :autoCropWidth="200"
                    :autoCropHeight="200"
                    :img="imgOptions.imgSrc"
                    :outputSize="imgOptions.size"
                    :outputType="imgOptions.outputType"
                    :info="true"
                    @realTime="realTime">
                    </vueCropper>
                  </div>
                  <div class="cropper-btn">
                    <el-button class="btn" @click="rotate('left')">
                      <i class="el-icon-fa-rotate-left" size="20"></i>
                    </el-button>
                    <el-button class="btn" @click="rotate('right')">
                      <i class="el-icon-fa-rotate-right" size="20"></i>
                    </el-button>
                    <el-button class="btn" @click="reselect">
                      <i class="el-icon-close" size="20"></i>
                    </el-button>
                  </div>
                  <div class="cropper-preview" :style="previewStyle">
                    <div :style=" preview.div">
                      <img :src="imgOptions.imgSrc" :style="preview.img">
                    </div>
                  </div>
                </div>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <save @click.native="saveCourse"></save>
    </Panel>
  </div>
</template>
<script>
  import vueCropper from 'vue-cropper'
  import time from '@/utils/time.js'
  export default {
    name: 'createEditCourse',
    components: {
      vueCropper
    },
    props: {
      // 若是某个课程的设置界面，这里就会有值
      course: {
        type: Object
      }
    },
    data () {
      return {
        rules: {
          title: { required: true, message: '请输入课程名称', trigger: 'blur' },
          introduction: {required: true, message: '请输入课程介绍', trigger: 'blur'},
          start_time: {type: 'date', required: true, message: '请选择开始时间', trigger: 'change'},
          end_time: {type: 'date', required: true, message: '请选择结束时间', trigger: 'change'}
        },
        imgOptions: {
          // 图片
          imgSrc: '',
          size: 0.8,
          outputType: 'png'
        },
        // 上传的图片(剪裁操作)预览
        preview: {},
        // 当前课程时间
        courseDuration: '无限',
        // 是否显示错误信息(持续时间)
        isShowDuration: false,
        // 路由名
        routeName: '',
        // 课程id
        courseID: '',
        // 真正用于显示和提交的课程变量
        realCourse: {
          title: '',
          introduction: '',
          visible: true,
          start_time: '',
          end_time: ''
        }
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      // 初始化
      init () {
        this.routeName = this.$route.name
        this.courseID = this.$route.params.courseId
        // 若是课程的修改设置界面 则将传过来的course属性拷贝给realCourse
        if (this.routeName === 'course-setting') {
          this.$nextTick(() => {
            Object.assign(this.realCourse, this.course)
            // 对时间格式进行更改 这里判断原因是一开始
            this.realCourse.start_time = new Date(this.realCourse.start_time)
            this.realCourse.end_time = new Date(this.realCourse.end_time)
          })
        }
      },
      // 上传图片的类型
      checkFileType (file) {
        if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(file.name)) {
          this.$Notice.warning({
            title: '不支持该文件类型',
            desc: file.name + ' 的格式错误，请重新选择图片上传.'
          })
          return false
        }
        return true
      },
      // 上传图片的大小
      checkFileSize (file) {
        // max size is 2MB
        if (file.size > 2 * 1024 * 1024) {
          this.$Notice.warning({
            title: '文件大小超过限制',
            desc: '文件 ' + file.name + ' 太大, 请选择大小在2MB内的图片'
          })
          return false
        }
        return true
      },
      // 文件上传前调用该函数
      handleSelectFile (file) {
        let isOk = this.checkFileType(file) && this.checkFileSize(file)
        if (!isOk) {
          return false
        }
        let reader = new window.FileReader()
        // 文件读取完成后触发
        reader.onload = (e) => {
          this.imgOptions.imgSrc = e.target.result
        }
        // 将文件读取为DataURL
        reader.readAsDataURL(file)
        return false
      },
      // 剪裁图片时的预览效果
      realTime (data) {
        this.preview = data
      },
      // 旋转图片
      rotate (direction) {
        if (direction === 'left') {
          this.$refs.cropper.rotateLeft()
        } else {
          this.$refs.cropper.rotateRight()
        }
      },
      // 撤销上传的图片
      reselect () {
        this.$confirm('是否放弃上传?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.imgOptions.imgSrc = ''
        })
      },
      // 上传表单
      saveCourse () {
        this.$refs.courseForm.validate((valid) => {
          if (valid) {
            // 若开始时间大于结束时间，即下值为true 直接return
            if (this.isShowDuration) {
              return
            }
            // 发送请求的路由，和携带的数据
            let url = 'admin/course'
            let form = new window.FormData(this.$refs.courseForm.$el)
            // 日期格式设为IOS, 设置visible值，首字母大写
            let visible = this.realCourse.visible + ''
            let bool = visible.slice(0, 1).toUpperCase() + visible.slice(1)
            form.append('visible', bool)
            form.set('start_time', this.realCourse.start_time.toISOString())
            form.set('end_time', this.realCourse.end_time.toISOString())
            // 创建也要传，后台要求, undefined不行
            let id = this.courseID || ''
            form.set('id', id)
            let sendObj = {
              method: 'post',
              url: url,
              data: form,
              headers: {'content-type': 'multipart/form-data'}
            }
            // 如果有上传图片
            if (this.imgOptions.imgSrc) {
              this.$refs.cropper.getCropBlob(blob => {
                let file = new window.File([blob], 'courseImg.' + this.imgOptions.outputType)
                form.set('image', file)
                this.getAjax(sendObj)
              })
            } else {
              this.getAjax(sendObj)
            }
          } else {
            this.$error('请填写红色区域')
          }
        })
      },
      // 发送ajax请求
      getAjax (sendObj) {
        new Promise((resolve, reject) => {
          this.$http(sendObj).then(res => {
            // API正常返回(status=20x), 是否错误通过有无error判断
            if (res.data.error !== null) {
              this.$error(res.data.data)
              reject(res)
              // // 若后端返回为登录，则为session失效，应退出当前登录用户
              if (res.data.data.startsWith('Please login')) {
                this.$router.push({name: 'login'})
              }
            } else {
              resolve(res)
              if (sendObj.method !== 'get') {
                this.$success('Succeed')
              }
            }
          }, res => {
            // API请求异常，一般为Server error 或 network error
            reject(res)
            this.$error(res.data.data)
          })
        }).then(res => {
          this.$success('保存成功')
          // 更新当前的course
          if (this.routeName === 'course-setting') {
            this.$emit('update-course')
          }
          this.$router.push({name: 'course-intro', params: {courseId: res.data.data.id}})
        }, res => {
          this.$error(res.data.data)
        })
      }
    },
    watch: {
      'realCourse.start_time' (newDate) {
        // 若结束时间有值则进行计算，否则仍为无限
        if (this.realCourse.end_time !== '') {
          let result = time.durationTime(newDate, this.realCourse.end_time)
          if (result === false) {
            // 说明持续时间为负数，错误
            this.isShowDuration = true
          } else {
            this.isShowDuration = false
            this.courseDuration = result
          }
        }
      },
      'realCourse.end_time' (newDate) {
        if (newDate) {
          let result = time.durationTime(this.realCourse.start_time, newDate)
          if (result === false) {
            // 说明持续时间为负数，错误
            this.isShowDuration = true
          } else {
            this.isShowDuration = false
            this.courseDuration = result
          }
        } else {
          this.courseDuration = '无限'
        }
      },
      // 若发生变化，则说明是课程设置界面
      'course' () {
        this.init()
      }
    },
    computed: {
      previewStyle () {
        return {
          'width': this.preview.w + 'px',
          'height': this.preview.h + 'px',
          'overflow': 'hidden'
        }
      }
    }
  }
</script>
<style lang="less" scoped>
  .mini-container {
    width: 500px;
  }
  .copper-img {
    width: 400px;
    height: 300px;
  }
  .flex-container {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 10px;
    .cropper-main {
      display: inline-block;
      flex: none;
      .copper-img;
    }
    .cropper-btn {
      display: inline-block;
      flex: none;
      vertical-align: top;
      margin-left: 10px;
      .btn {
        display: block;
        margin: 5px;
      }
    }
    .cropper-preview {
      display: inline-block;
      flex: none;
      /*margin: 10px;*/
      margin-left: 20px;
      box-shadow: 0 0 1px 0;
      vertical-align: top;
      .copper-img;
    }
  }
</style>