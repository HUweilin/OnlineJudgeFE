<template>
  <div>
    <textarea ref="editor"></textarea>
    <!-- 用mathJax渲染其中的数学公式 -->
    <div id="render-content" v-html="renderData"></div>
  </div>
</template>

<script>
  import Simditor from 'simditor'
  import 'simditor/styles/simditor.css'
  // import 'simditor-markdown'
  // import 'simditor-markdown/styles/simditor-markdown.css'

  export default {
    name: 'Simditor',
    props: {
      toolbar: {
        type: Array,
        default: () => ['title', 'bold', 'italic', 'underline', 'fontScale', 'color', 'ol', 'ul', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'] //, '|', 'markdown'
      },
      value: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        editor: null,
        currentValue: this.value,
        renderData: ''
      }
    },
    mounted () {
      Simditor.locale = 'zh-CN'
      // Simditor.locale = 'en-US'
      this.editor = new Simditor({
        textarea: this.$refs.editor,
        toolbar: this.toolbar,
        pasteImage: true,
        markdown: true,
        upload: {
          url: '/api/admin/upload_image/',
          params: null,
          fileKey: 'image',
          connectionCount: 3,
          leaveConfirm: '图片正在上传,确认离开该页面?'
        }
      })
      this.editor.on('valuechanged', (e, src) => {
        this.currentValue = this.editor.getValue()
      })
      this.editor.on('decorate', (e, src) => {
        this.currentValue = this.editor.getValue()
      })

      this.editor.setValue(this.value)
      this.renderData = this.currentValue
      this.$nextTick(() => {
        if (window.MathJax) {
          window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'render-content'])
        }
      })
    },
    watch: {
      'value' (val) {
        if (this.currentValue !== val) {
          this.currentValue = val
          this.editor.setValue(val)
        }
      },
      'currentValue' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('change', newVal)
          this.$emit('input', newVal)
          this.renderData = this.currentValue
          this.$nextTick(() => {
            if (window.MathJax) {
              window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'render-content'])
            }
          })
        }
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
