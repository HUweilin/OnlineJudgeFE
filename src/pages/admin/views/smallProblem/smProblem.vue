<template>
  <el-row class="problem" :gutter="15">
    <el-col :span="23">
      <Panel :title="title">
        <el-form ref="form" :model="problem" :rules="rules" label-position="top" label-width="70px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item prop="_id" label="展示编号" required>
                <el-input placeholder="展示的编号" v-model="problem._id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="15">
              <el-form-item prop="title" label="标题" required>
                <el-input placeholder="标题" v-model="problem.title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item prop="type" label="类型">
                <el-select v-model="problem.type" placeholder="请选择">
                  <el-option v-for="item in typeOptions" :label="item.label" :value="item.type" :key="item.type"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="description" label="题目内容" required>
                <Simditor v-model="problem.description"></Simditor>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="changeAnswerType.showSingle || changeAnswerType.showMultiple">
            <el-col :span="14">
              <el-form-item :prop="'options['+index+']'" v-if="index < optionsLen"
              v-for="(letter,index) in alphabet" 
              :label="'选项'+ letter" 
              :key="index" reuqired>
                <el-input v-model="problem.options[index]" :placeholder="'选项' + letter">
                  <span slot="prepend">{{letter}}</span>
                </el-input>
                <el-button type="danger" @click="deleteOption(index)">删除</el-button>
              </el-form-item>
              <el-button type="primary" @click="addOptions"><i class="el-icon-plus"></i>添加选项
              </el-button>
            </el-col>
            <el-col :span="10">
              <el-form-item prop="answer" label="答案">
                <el-select size="medium" v-if="changeAnswerType.showSingle" v-model="problem.answer" placeholder="请选择答案,字母代替">
                  <el-option v-if="index < optionsLen" v-for="(letter,index) in alphabet" :key="letter" :value="letter" :label="letter"></el-option>
                </el-select>
                <el-select size="medium" v-if="changeAnswerType.showMultiple" multiple="true" v-model="problem.answer" placeholder="请选择题目答案,字母代替">
                  <el-option v-if="index < optionsLen" v-for="(letter,index) in alphabet" :key="letter" :value="letter" :label="letter"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="是否可见">
                <el-switch
                  v-model="problem.visible">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="6">
            	<el-form-item label="标签" :error="error.tags" required>
                <span class="tags">
                  <el-tag
                    v-for="(tag,index) in problem.tags"
                    :closable="true"
                    :close-transition="false"
                    :key="tag"
                    type="success"
                    @close="closeTag(index)"
                  >{{tag}}</el-tag>
                </span>
                <el-autocomplete
                  v-if="inputVisible"
                  size="mini"
                  v-model="tagInput"
                  :trigger-on-focus="false"
                  @keyup.enter.native="addTag"
                  @select="addTag"
                  trigger-on-focus="true"
                  :fetch-suggestions="querySearch">
                </el-autocomplete>
                <el-button class="button-new-tag" v-else size="small" @click="inputVisible = true">添加标签</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <save @click.native="submit()"></save>
        </el-form>
      </Panel>
    </el-col>
    <el-col :span="1" style="position: fixed; right: 10px; top: 50%;">
      <el-button type="info" style="padding: 4px 10px; border: none; font-size: 18px;" @click="showGuide=true">
        <div>创</div>
        <div>建</div>
        <div>指</div>
        <div>引</div>
        <i class="el-icon-fa-question-circle"></i>
      </el-button>
    </el-col>
    <el-dialog :visible.sync="showGuide" title="题目创建指引">
      <h3>填空题</h3>
      <ul>
        <li>填空题的答案放在留空的地方，用@@包裹，如：题目内容@@答案@@题目内容@@答案@@</li>
      </ul>
      <span slot="footer">
        <el-button type="primary" @click="showGuide = false">确 定</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>
<script>
  // import { types } from '@/store'
  import { mapGetters } from 'vuex'
  import Simditor from '../../components/Simditor'
  import { SMALL_PROBLEM_TYPE } from '@/utils/constants'
  import api from '../../api'
  export default {
    name: 'small-problem',
    components: {
      Simditor
    },
    data () {
      return {
        problem: {},
        rules: {
          _id: [{required: true, message: '不能为空', trigger: 'blur'}],
          title: [{required: true, message: '标题不能为空', trigger: 'blur'}],
          description: [{required: true, message: '不能为空~'}],
          answer: {required: true, message: '答案不能为空~'}
        },
        // 要和select绑定的值变量一样名字 不然出bug
        typeOptions: [
          {
            label: '单选题',
            type: SMALL_PROBLEM_TYPE.Single
          },
          {
            label: '多选题',
            type: SMALL_PROBLEM_TYPE.Multiple
          },
          {
            label: '填空题',
            type: SMALL_PROBLEM_TYPE.Blank
          }
        ],
        inputVisible: false,
        // 要添加的标签
        tagInput: '',
        error: {
          tags: ''
        },
        routeName: '',
        title: '',
        // 远程获取所有的标签 跟该问题有的标签没关系
        tagList: [],
        changeAnswerType: {
          showSingle: false,
          showMultiple: false
        },
        // 展示指引
        showGuide: false,
        alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
        // 选项的长度
        optionsLen: 4
      }
    },
    mounted () {
      this.routeName = this.$route.name
      if (this.routeName === 'edit-small-problem') {
        this.mode = 'edit'
      } else {
        this.mode = 'add'
      }
      if (this.mode === 'edit') {
        this.title = '修改题目'
        // 修改页面 路由有一个参数problemId
        api.getSmallProblem(this.$route.params.problemId).then(res => {
          this.problem = res.data.data
        })
      } else {
        this.title = '添加题目'
        this.problem = {
          _id: '',
          title: '',
          type: SMALL_PROBLEM_TYPE.Blank,
          visible: true,
          tags: [],
          options: [],
          answer: []
        }
      }
      // 获取标签列表
      api.getSmallProblemTagList().then(res => {
        for (let tag of res.data.data) {
          this.tagList.push({value: tag.name})
        }
      }).catch(() => {
        this.tagList = []
      })
    },
    methods: {
      querySearch (queryString, cb) {
        let tags = this.tagList
        let results = queryString ? tags.filter(this.createFilter(queryString)) : tags
        // 调用callback返回数据
        cb(results)
      },
      // 根据输入内容筛选已存在的标签
      createFilter (queryString) {
        return (tag) => {
          return (tag.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
        }
      },
      // 选择题中，若四个选项不够用则optionsLen+1
      // optionsLen代表选项长度
      addOptions () {
        if (this.optionsLen < this.alphabet.length) {
          this.optionsLen++
        }
      },
      // 删除某个选项
      deleteOption (index) {
        // 移除下标为index值的
        // 因为首次加载有四个空选项,而这时problem.options.length应该为0
        if (index < this.optionsLen) {
          this.problem.options.splice(index, 1)
          // 选项个数减1
          this.optionsLen--
        }
      },
      submit () {
        let type = this.problem.type
        // 若为选择题
        if (!this.problem._id && this.problem._id !== 0) {
          this.$error('展示编号不能为空~')
          return
        }
        if (!this.problem.title) {
          this.$error('标题不能为空~')
          return
        }
        if (!this.problem.description) {
          this.$error('题目内容不能为空~')
          return
        }
        if (type === SMALL_PROBLEM_TYPE.Single || type === SMALL_PROBLEM_TYPE.Multiple) {
          let options = this.problem.options
          let bool = false
          for (let i = 0; i < options.length; i++) {
            if (options[i] !== '' && options[i] !== undefined) {
              bool = true
              break
            }
          }
          // 若bool为false说明选项为空
          if (!bool) {
            this.$error('请填写选择题选项')
            return
          }
          // 若为单选题 将答案push到数组里
          if (type === SMALL_PROBLEM_TYPE.Single) {
            if (!this.problem.answer) {
              this.$error('请填写答案~')
              return
            }
            if ((typeof this.problem.answer) === 'string') {
              let result = []
              result.push(this.problem.answer)
              this.problem.answer = result
            }
          } else {
            // 说明是多选题 答案进行排序
            this.problem.answer.sort()
          }
        } else if (type === SMALL_PROBLEM_TYPE.Blank) {
          // 填空题下，将description中的填空部分答案筛选出来
          let description = this.problem.description
          let exp = /@@(.*?)@@/g
          let arr
          let result = []
          while ((arr = exp.exec(description)) !== null) {
            result.push(arr[1])
          }
          if (result.length === 0) {
            this.$error('请在描述字段在留空部分用@@答案@@填写')
            return
          }
          // 将填空部分的答案赋值给answer
          this.problem.answer = result
        }
        if (!this.problem.tags.length) {
          this.error.tags = '请至少添加一个标签~'
          this.$error(this.error.tags)
          return
        }
        let func = (this.mode === 'edit') ? 'editSmallProblem' : 'createSmallProblem'
        api[func](this.problem).then(res => {
          this.$router.push({name: 'small-problem-list'})
        }).catch((err) => {
          console.log(err)
        })
      },
      addTag () {
        let inpVal = this.tagInput
        if (inpVal) {
          this.problem.tags.push(inpVal)
        }
        this.inputVisible = false
        this.tagInput = ''
      },
      closeTag (index) {
        this.problem.tags.splice(index, 1)
      }
    },
    watch: {
      'problem.type' (val) {
        if (val === SMALL_PROBLEM_TYPE.Single) {
          if (this.routeName === 'edit-small-problem') {
            this.problem.answer = this.problem.answer.pop()
            // 选项长度设置
            this.optionsLen = this.problem.options.length
          } else {
            // 将单选题的答案置为空
            this.problem.answer = ''
            this.problem.options = []
          }
          this.$nextTick(() => {
            this.changeAnswerType.showSingle = true
            this.changeAnswerType.showMultiple = false
          })
        } else if (val === SMALL_PROBLEM_TYPE.Multiple) {
          if (this.routeName === 'edit-small-problem') {
            this.optionsLen = this.problem.options.length
          } else {
            // 将多选题的答案置为空
            this.problem.answer = []
            this.problem.options = []
          }
          this.$nextTick(() => {
            this.changeAnswerType.showSingle = false
            this.changeAnswerType.showMultiple = true
          })
        } else {
          this.changeAnswerType.showSingle = false
          this.changeAnswerType.showMultiple = false
          this.problem.options = []
        }
      }
    },
    computed: {
      ...mapGetters(['user'])
    }
  }
</script>
<style lang="less" scoped>
	.problem {
    .difficulty-select {
      width: 120px;
    }
    .spj-radio {
      margin-left: 10px;
      &:last-child {
        margin-right: 20px;
      }
    }
    .input-new-tag {
      width: 78px;
    }
    .button-new-tag {
      height: 24px;
      line-height: 22px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .tags {
      .el-tag {
        margin-right: 10px;
      }
    }
    .accordion {
      margin-bottom: 10px;
    }
    .add-samples {
      width: 100%;
      background-color: #fff;
      border: 1px dashed #aaa;
      outline: none;
      cursor: pointer;
      color: #666;
      height: 35px;
      font-size: 14px;
      &:hover {
        background-color: #f9fafc;
      }
      i {
        margin-right: 10px;
      }
    }
    .add-sample-btn {
      margin-bottom: 10px;
    }
  }
</style>