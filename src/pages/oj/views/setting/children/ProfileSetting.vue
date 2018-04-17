<template>
  <div class="setting-main">
    <div class="section-title">头像设置</div>
    <template v-if="!avatarOption.imgSrc">
      <Upload type="drag"
              class="mini-container"
              accept=".jpg,.jpeg,.png,.bmp,.gif"
              action=""
              :before-upload="handleSelectFile">
        <div style="padding: 30px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>拖拽图片到这里,或者点击这里手动上传</p>
        </div>
      </Upload>
    </template>

    <template v-else>
      <div class="flex-container">
        <div class="cropper-main inline">
          <vueCropper
            ref="cropper"
            autoCrop
            fixed
            :autoCropWidth="200"
            :autoCropHeight="200"
            :img="avatarOption.imgSrc"
            :outputSize="avatarOption.size"
            :outputType="avatarOption.outputType"
            :info="true"
            @realTime="realTime">
          </vueCropper>
        </div>
        <ButtonGroup vertical class="cropper-btn">
          <Button @click="rotate('left')">
            <Icon type="arrow-return-left" size="20"></Icon>
          </Button>
          <Button @click="rotate('right')">
            <Icon type="arrow-return-right" size="20"></Icon>
          </Button>
          <Button @click="reselect">
            <Icon type="refresh" size="20"></Icon>
          </Button>
          <Button @click="finishCrop">
            <Icon type="checkmark-round" size="20"></Icon>
          </Button>
        </ButtonGroup>
        <div class="cropper-preview" :style="previewStyle">
          <div :style=" preview.div">
            <img :src="avatarOption.imgSrc" :style="preview.img">
          </div>
        </div>
      </div>
    </template>
    <Modal v-model="uploadModalVisible"
           title="上传头像">
      <div class="upload-modal">
        <p class="notice">您的头像:</p>
        <img :src="uploadImgSrc"/>
      </div>
      <div slot="footer">
        <Button @click="uploadAvatar" :loading="loadingUploadBtn">上传</Button>
      </div>
    </Modal>

    <div class="section-title">信息设置</div>
    <Form ref="formProfile" :model="formProfile">
      <Row type="flex" :gutter="30" justify="space-around">
        <Col :span="11">
        <FormItem label="真实姓名">
          <Input v-model="formProfile.real_name"/>
        </FormItem>
        <Form-item label="学校">
          <Input v-model="formProfile.school"/>
        </Form-item>
        <Form-item label="专业">
          <Input v-model="formProfile.major"/>
        </Form-item>
        <Form-item>
          <Button type="primary" @click="updateProfile" :loading="loadingSaveBtn">保存</Button>
        </Form-item>
        </Col>

        <Col :span="11">
        <Form-item label="个性签名">
          <Input v-model="formProfile.mood"/>
        </Form-item>
        <Form-item label="Blog">
          <Input v-model="formProfile.blog"/>
        </Form-item>
        <Form-item label="Github">
          <Input v-model="formProfile.github"/>
        </Form-item>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
  import api from '@oj/api'
  import utils from '@/utils/utils'
  import vueCropper from 'vue-cropper'
  import {types} from '../../../../../store'

  export default {
    components: {
      vueCropper
    },
    data () {
      return {
        loadingSaveBtn: false,
        loadingUploadBtn: false,
        uploadModalVisible: false,
        preview: {},
        uploadImgSrc: '',
        avatarOption: {
          imgSrc: '',
          size: 0.8,
          outputType: 'png'
        },
        formProfile: {
          real_name: '',
          mood: '',
          major: '',
          blog: '',
          school: '',
          github: ''
        }
      }
    },
    mounted () {
      let profile = this.$store.state.user.profile
      Object.keys(this.formProfile).forEach(element => {
        if (profile[element] !== undefined) {
          this.formProfile[element] = profile[element]
        }
      })
    },
    methods: {
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
      handleSelectFile (file) {
        let isOk = this.checkFileType(file) && this.checkFileSize(file)
        if (!isOk) {
          return false
        }
        let reader = new window.FileReader()
        // 文件读取完成后触发
        reader.onload = (e) => {
          this.avatarOption.imgSrc = e.target.result
        }
        // 将文件读取为DataURL
        reader.readAsDataURL(file)
        return false
      },
      realTime (data) {
        this.preview = data
      },
      rotate (direction) {
        if (direction === 'left') {
          this.$refs.cropper.rotateLeft()
        } else {
          this.$refs.cropper.rotateRight()
        }
      },
      reselect () {
        this.$Modal.confirm({
          content: '是否放弃操作?',
          onOk: () => {
            this.avatarOption.imgSrc = ''
          }
        })
      },
      finishCrop () {
        this.$refs.cropper.getCropData(data => {
          this.uploadImgSrc = data
          this.uploadModalVisible = true
        })
      },
      uploadAvatar () {
        this.$refs.cropper.getCropBlob(blob => {
          let form = new window.FormData()
          let file = new window.File([blob], 'avatar.' + this.avatarOption.outputType)
          form.append('image', file)
          this.loadingUploadBtn = true
          this.$http({
            method: 'post',
            url: 'upload_avatar',
            data: form,
            headers: {'content-type': 'multipart/form-data'}
          }).then(res => {
            this.loadingUploadBtn = false
            this.$success('头像上传成功')
            this.uploadModalVisible = false
            this.avatarOption.imgSrc = ''
            this.$store.dispatch('getProfile')
          }, () => {
            this.loadingUploadBtn = false
          })
        })
      },
      updateProfile () {
        this.loadingSaveBtn = true
        let updateData = utils.filterEmptyValue(Object.assign({}, this.formProfile))
        api.updateProfile(updateData).then(res => {
          this.$success('Success')
          this.$store.commit(types.CHANGE_PROFILE, {profile: res.data.data})
          this.loadingSaveBtn = false
        }, _ => {
          this.loadingSaveBtn = false
        })
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
  .inline {
    display: inline-block;
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
      flex: none;
      .copper-img;
    }
    .cropper-btn {
      flex: none;
      vertical-align: top;
    }
    .cropper-preview {
      flex: none;
      /*margin: 10px;*/
      margin-left: 20px;
      box-shadow: 0 0 1px 0;
      .copper-img;
    }
  }

  .upload-modal {
    .notice {
      font-size: 16px;
      display: inline-block;
      vertical-align: top;
      padding: 10px;
      padding-right: 15px;
    }
    img {
      box-shadow: 0 0 1px 0;
      border-radius: 50%;
    }
  }
</style>
