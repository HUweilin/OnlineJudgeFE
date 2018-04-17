<template>
  <div class="view">
    <Panel :title="title">
      <el-form label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="标题" required>
              <el-input v-model="contest.title" placeholder="标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" required>
              <Simditor v-model="contest.description"></Simditor>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" required>
              <el-date-picker
                v-model="contest.start_time"
                type="datetime"
                placeholder="开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" required>
              <el-date-picker
                v-model="contest.end_time"
                type="datetime"
                placeholder="结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="密码">
              <el-input v-model="contest.password" placeholder="竞赛 密码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="竞赛规则">
              <el-radio class="radio" v-model="contest.rule_type" label="ACM" :disabled="disableRuleType">ACM</el-radio>
              <el-radio class="radio" v-model="contest.rule_type" label="OI" :disabled="disableRuleType">OI</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实时排名">
              <el-switch
                v-model="contest.real_time_rank"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否可见">
              <el-switch
                v-model="contest.visible"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="允许的IP范围">
              <div v-for="(range, index) in contest.allowed_ip_ranges" :key="index">
                <el-row :gutter="20" style="margin-bottom: 15px">
                  <el-col :span="8">
                    <el-input v-model="range.value" placeholder="CIDR Network"></el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-button plain icon="el-icon-fa-plus" @click="addIPRange"></el-button>
                    <el-button plain icon="el-icon-fa-trash" @click="removeIPRange(range)"></el-button>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <save @click.native="saveContest"></save>
    </Panel>
  </div>
</template>

<script>
  import api from '../../api.js'
  import Simditor from '../../components/Simditor.vue'

  export default {
    name: 'CreateContest',
    components: {
      Simditor
    },
    data () {
      return {
        title: '创建竞赛',
        disableRuleType: false,
        contest: {
          title: '',
          description: '',
          start_time: '',
          end_time: '',
          rule_type: 'ACM',
          password: '',
          real_time_rank: true,
          visible: true,
          allowed_ip_ranges: [{
            value: ''
          }]
        }
      }
    },
    methods: {
      saveContest () {
        let funcName = this.$route.name === 'edit-contest' ? 'editContest' : 'createContest'
        let data = Object.assign({}, this.contest)
        let ranges = []
        for (let v of data.allowed_ip_ranges) {
          if (v.value !== '') {
            ranges.push(v.value)
          }
        }
        data.allowed_ip_ranges = ranges
        api[funcName](data).then(res => {
          this.$router.push({name: 'contest-list', query: {refresh: 'true'}})
        }).catch(() => {
        })
      },
      addIPRange () {
        this.contest.allowed_ip_ranges.push({value: ''})
      },
      removeIPRange (range) {
        let index = this.contest.allowed_ip_ranges.indexOf(range)
        if (index !== -1) {
          this.contest.allowed_ip_ranges.splice(index, 1)
        }
      }
    },
    mounted () {
      if (this.$route.name === 'edit-contest') {
        this.title = '修改竞赛'
        this.disableRuleType = true
        api.getContest(this.$route.params.contestId).then(res => {
          let data = res.data.data
          let ranges = []
          for (let v of data.allowed_ip_ranges) {
            ranges.push({value: v})
          }
          if (ranges.length === 0) {
            ranges.push({value: ''})
          }
          data.allowed_ip_ranges = ranges
          this.contest = data
        }).catch(() => {
        })
      }
    }
  }
</script>
