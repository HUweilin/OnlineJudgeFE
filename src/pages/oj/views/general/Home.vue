<template>
  <Row type="flex" justify="space-around">
    <Col :sm="22" :xs="24">
      <panel shadow v-if="contests.length" class="contest">
        <div slot="title">
          <Button type="text"  class="contest-title" @click="goContest">{{contests[index].title}}</Button>
        </div>
        <Carousel v-model="index" trigger="hover" autoplay :autoplay-speed="6000" class="contest">
          <CarouselItem v-for="contest, index in contests" :key="index">
            <div class="contest-content">
              <div class="contest-content-tags">
                <Button type="info" shape="circle" size="small" icon="calendar">
                  {{contest.start_time | localtime('YYYY-M-D HH:mm') }}
                </Button>
                <Button type="success" shape="circle" size="small" icon="android-time">
                  {{getDuration(contest.start_time, contest.end_time)}}
                </Button>
                <Button class="judgeHide" type="warning" shape="circle" size="small" icon="trophy">
                  {{contest.rule_type}}
                </Button>
              </div>
              <div class="contest-content-description">
                <blockquote v-html="contest.description"></blockquote>
              </div>
            </div>
          </CarouselItem>
        </Carousel>
      </panel>
      <Announcements class="announcement"></Announcements>
      <!-- 编程题 热度推荐 首-->
      <!-- <panel shadow class="programming">
        <div slot="title">
          编程题 热度推荐
        </div>
        <Table style="width: 100%;"
        :columns="programTableColumns"
        :data="programRecom.hotRecom"
        size="small"
        disabled-hover></Table>
      </panel> -->
      <!-- 编程题 热度推荐 末-->
      <!-- 编程题 个性推荐 首-->
      <!-- <panel shadow class="programming" v-if="isAuthenticated">
        <div slot="title">
          编程题 个性推荐
        </div>
        <Table style="width: 100%;" 
        :columns="programTableColumns"
        :data="programRecom.personalRecom" 
        size="small"
        disabled-hover></Table>
      </panel> -->
      <!-- 文章推荐 末-->
      <!-- <panel shadow class="article">
        <div slot="title">
          文章推荐
        </div>
        <Table style="width: 100%;" 
        :data="programRecom.articleRecom" 
        size="small"
        disabled-hover></Table>
      </panel> -->
      <!-- 文章推荐 末-->
    </Col>
  </Row>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Announcements from './Announcements.vue'
  import api from '@oj/api'
  import time from '@/utils/time'
  import { CONTEST_STATUS } from '@/utils/constants'

  export default {
    name: 'home',
    components: {
      Announcements
    },
    data () {
      return {
        contests: [],
        index: 0
        // // 表头
        // programTableColumns: [
        //   {
        //     title: '#',
        //     key: '_id',
        //     render: (h, params) => {
        //       return h('Button', {
        //         props: {
        //           type: 'text',
        //           size: 'large'
        //         },
        //         on: {
        //           click: () => {
        //             this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
        //           }
        //         },
        //         style: {
        //           padding: '2px 0'
        //         }
        //       }, params.row._id)
        //     }
        //   },
        //   {
        //     title: '题目',
        //     width: '35%',
        //     ellipsis: true,
        //     render: (h, params) => {
        //       return h('Button', {
        //         props: {
        //           type: 'text',
        //           size: 'large'
        //         },
        //         on: {
        //           click: () => {
        //             this.$router.push({name: 'problem-details', params: {problemID: params.row._id}})
        //           }
        //         },
        //         style: {
        //           padding: '2px 0'
        //         }
        //       }, params.row.title)
        //     }
        //   },
        //   {
        //     title: '难度',
        //     render: (h, params) => {
        //       let t = params.row.difficulty
        //       let color = 'blue'
        //       if (t === 'Low') color = 'green'
        //       else if (t === 'High') color = 'yellow'
        //       return h('Tag', {
        //         props: {
        //           color: color
        //         }
        //       }, params.row.difficulty)
        //     }
        //   },
        //   {
        //     title: '提交量',
        //     key: 'submission_number'
        //   },
        //   {
        //     title: '通过率',
        //     render: (h, params) => {
        //       return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
        //     }
        //   }
        // ],
        // // 编程题推荐数据
        // programRecom: {
        //   'hotRecom': [],
        //   'personalRecom': [],
        //   'articleRecom': []
        // }
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated'])
    },
    mounted () {
      let params = {status: CONTEST_STATUS.NOT_START}
      api.getContestList(0, 5, params).then(res => {
        this.contests = res.data.data.results
      })
    },
    methods: {
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      goContest () {
        this.$router.push({
          name: 'contest-details',
          params: {contestID: this.contests[this.index].id}
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .contest {
    &-title {
      font-style: italic;
      font-size: 21px;
    }
    &-content {
      padding: 0 70px 40px 70px;
      &-description {
        margin-top: 25px;
      }
    }
  }
  .announcement {
    margin-top: 20px;
  }
  .programming, .article {
    margin-top: 10px;
  }
  @media screen and (max-width: 767px) {
    .contest {
      &-content {
        text-align: center;
        padding: 0 10px 10px 10px;
        &-tags {
          .judgeHide {
            display: none;
          }
        }
        &-description {
          margin-top: 15px;
          padding: 0 5px;
        }
      }
    }
    .programming, .article {
      & /deep/ .ivu-card-head {
        padding: 0;
        .panel-title {
          font-size: 12px;
        }
      }
    }
  }
</style>
