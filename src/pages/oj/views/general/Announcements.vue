<template>
  <Panel shadow :padding="0">
    <div slot="title">
      {{title}}
    </div>
    <div slot="extra">
      <Button v-if="listVisible" type="info" @click="init" :loading="btnLoading">刷新</Button>
      <Button v-else type="ghost" icon="ios-undo" @click="goBack">返回</Button>
    </div>

    <transition-group name="announcement-animate" mode="in-out">
      <div class="no-announcement" v-if="!announcements.length" key="no-announcement">
        <p>暂无公告</p>
      </div>
      <template v-if="listVisible">
        <ul class="announcements-container" key="list">
          <li v-for="announcement, index in announcements">
            <div class="flex-container">
              <div class="title"><a class="entry" @click="goAnnouncement(announcement)">
                {{announcement.title}}</a></div>
              <div class="date">{{announcement.create_time | localtime }}</div>
              <div class="creator">{{announcement.created_by.username}}</div>
            </div>
          </li>
        </ul>
        <Pagination v-if="!isContest && !isCourse"
                    key="page"
                    :total="total"
                    :page-size="limit"
                    @on-change="getAnnouncementList">
        </Pagination>
      </template>

      <template v-else>
        <div v-html="announcement.content" key="content" class="content-container markdown-body"></div>
      </template>
    </transition-group>
  </Panel>
</template>

<script>
  import api from '@oj/api'
  import Pagination from '@oj/components/Pagination'

  export default {
    name: 'Announcement',
    components: {
      Pagination
    },
    data () {
      return {
        limit: 10,
        total: 10,
        btnLoading: false,
        announcements: [],
        announcement: '',
        listVisible: true
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        if (this.isContest) {
          this.getContestAnnouncementList()
        } else if (this.isCourse) {
          this.getCourseAnnouncementList()
        } else {
          this.getAnnouncementList()
        }
      },
      getAnnouncementList (page = 1) {
        let params = {
          limit: this.limit,
          offset: (page - 1) * this.limit
        }
        this.btnLoading = true
        api.getAnnouncementList(params).then(res => {
          this.btnLoading = false
          this.announcements = res.data.data.results
          this.total = res.data.data.total
        }, () => {
          this.btnLoading = false
        })
      },
      // 获取竞赛公告列表
      getContestAnnouncementList () {
        this.btnLoading = true
        api.getContestAnnouncementList(this.$route.params.contestID).then(res => {
          this.btnLoading = false
          this.announcements = res.data.data
        }, () => {
          this.btnLoading = false
        })
      },
      // 获取课程公告列表
      getCourseAnnouncementList () {
        this.btnLoading = true
        api.getCourseAnnouncementList(this.$route.params.courseID).then(res => {
          this.btnLoading = false
          this.announcements = res.data.data
        }, () => {
          this.btnLoading = false
        })
      },
      goAnnouncement (announcement) {
        this.announcement = announcement
        this.listVisible = false
        this.$nextTick(() => {
          if (window.MathJax) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'problem-content'])
          }
        })
      },
      goBack () {
        this.listVisible = true
        this.announcement = ''
      }
    },
    computed: {
      title () {
        if (this.listVisible) {
          return this.isContest ? '比赛公告' : '公告'
        } else {
          return this.announcement.title
        }
      },
      isContest () {
        return !!this.$route.params.contestID
      },
      isCourse () {
        return !!this.$route.params.courseID
      }
    }
  }
</script>

<style scoped lang="less">
  .announcements-container {
    margin-top: -10px;
    margin-bottom: 10px;
    li {
      padding-top: 15px;
      padding-bottom: 15px;
      margin-left: 20px;
      font-size: 16px;
      border-bottom: 1px solid rgba(187, 187, 187, 0.5);
      &:last-child {
        border-bottom: none;
      }
      .flex-container {
        .title {
          flex: 1 1;
          text-align: left;
          padding-left: 10px;
          a.entry {
            color: #495060;
            &:hover {
              color: #2d8cf0;
              border-bottom: 1px solid #2d8cf0;
            }
          }
        }
        .creator {
          flex: none;
          width: 200px;
          text-align: center;
        }
        .date {
          flex: none;
          font-size: 10px;
          width: 200px;
          text-align: center;
        }
      }
    }
  }
  .content-container {
    padding: 0 20px 20px 20px;
  }

  .no-announcement {
    text-align: center;
    font-size: 16px;
  }

  .announcement-animate-enter-active {
    animation: fadeIn 1s;
  }
  @media screen and (max-width: 767px){
    .panel-title {
      &>div {
        width: 60%;
        font-size: 16px;
        line-height: 1.2;
        font-weight: bold;
      }
    }
    .announcements-container {
      li {
      margin-left: 0;
      font-size: 12px;
      .flex-container {
        .title {
          flex: 1;
          flex-flow: row wrap;
          padding: 0 5px 0 0;
          text-align: center;
          min-width: 90px;
          min-height: 35px;
          overflow: hidden;
          text-overflow:ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .date {
          flex: 1;
          flex-flow: row wrap;
          text-align: center;
          padding-right: 5px;
        }
        .creator {
          flex: 1;
          flex-flow: row wrap;
          text-align: center;
          min-width: 90px;
          min-height: 35px;
          overflow: hidden;
          text-overflow:ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      }
    }
  }
</style>
