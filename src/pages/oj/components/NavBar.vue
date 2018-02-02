<template>
  <div id="header">
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#my-bottom-nav" aria-expanded="false" style="float: left;" @click="removeClass('my-top-nav')">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <button class="navbar-toggle click-me collapsed" data-toggle="collapse" data-target="#my-top-nav" aria-expanded="false" @click="removeClass('my-bottom-nav')">
            <img src="/public/avatar/default.png" />
          </button>
          <div class="navbar-brand hidden-xs"><img class="logo" src="../../../assets/logo.png"><span class="title">数科院在线判题系统</span></div>
        </div>
        <div ref="my-top-nav" id="my-top-nav" class="collapse navbar-collapse" @click="removeClass('my-top-nav',$event)">
          <template v-if="!isAuthenticated">
            <div class="nav navbar-nav navbar-right">
              <Button 
              type="primary" 
              shape="circle"
              @click="handleBtnClick('login')">登录</Button>
              <Button 
              v-if="website.allow_register"
              type="primary"
              shape="circle"
              @click="handleBtnClick('register')">注册</Button>
            </div>
          </template>
          <template v-else>
            <ul class="nav navbar-nav navbar-right">
              <Dropdown trigger="click" @on-click="handleRoute">
                <a id="user-option" class="dropdown-toggle" href="javascript:void(0)">
                  <img v-if="profile.avatar" :src="profile.avatar" style="width:30px;height:30px;border-radius:50%;overflow:hidden;" /> {{user.username}} 
                  <Icon type="arrow-down-b"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem name="/user-home">我的主页</DropdownItem>
                  <DropdownItem name="/status?myself=1">提交状态</DropdownItem>
                  <DropdownItem name="/setting/profile">个人中心</DropdownItem>
                  <DropdownItem  v-if="isAdminRole" name="/admin" divided>管理</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <router-link tag="li" class="logout" to="/logout">退出</router-link>
            </ul>
          </template>
        </div>
      </div>
      <div class="container-fluid">
        <div ref="my-bottom-nav" class="collapse navbar-collapse" id="my-bottom-nav">
          <Menu class="is-show ivu-row" theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu">
            <Col :sm="1" :md="3" style="height: inherit"></Col>
            <Menu-item name="/" class="ivu-col ivu-col-span-sm-3">
              <Icon type="home"></Icon>
              主页
            </Menu-item>
            <Submenu name="" class="ivu-col ivu-col-span-sm-4 ivu-col-span-md-3">
              <template slot="title">
                <Icon type="ios-keypad"></Icon>
                题库
              </template>
              <Menu-item name="/problems">
                编程训练
              </Menu-item>
              <Menu-item name="/smallProblems">
                小题训练
              </Menu-item>
            </Submenu>
            <Menu-item name="/contests" class="ivu-col ivu-col-span-sm-3">
              <Icon type="trophy"></Icon>
              竞赛
            </Menu-item>
            <Menu-item name="/status" class="ivu-col ivu-col-span-sm-4 ivu-col-span-md-3">
              <Icon type="ios-pulse-strong"></Icon>
              状态
            </Menu-item>
            <Submenu name="" class="ivu-col ivu-col-span-sm-4 ivu-col-span-md-3">
              <template slot="title">
                <Icon type="podium"></Icon>
                比例
              </template>
              <Menu-item name="/acm-rank">
                ACM 比例
              </Menu-item>
              <Menu-item name="/oi-rank">
                OI 比例
              </Menu-item>
            </Submenu>
            <Submenu name="" class="ivu-col ivu-col-span-sm-4 ivu-col-span-md-3">
              <template slot="title">
                <Icon type="information-circled"></Icon>
                关于
              </template>
              <Menu-item name="/about">
                Judger
              </Menu-item>
              <Menu-item name="/FAQ">
                FAQ
              </Menu-item>
            </Submenu>
          </Menu>
          <!-- 小屏幕菜单 -->
          <Row class="is-hidden">
            <Col span="24">
            <Menu theme="light" width="100%" @on-select="handleRoute" :active-name="activeMenu" style="height: auto">
              <Menu-item name="/">
                <Icon type="home"></Icon>
                主页
              </Menu-item>
              <Submenu name="">
                <template slot="title">
                  <Icon type="ios-keypad"></Icon>
                  题库
                </template>
                <Menu-item name="/problems">
                  编程训练
                </Menu-item>
                <Menu-item name="/problems">
                  小题训练
                </Menu-item>
              </Submenu>
              <Menu-item name="/contests">
                <Icon type="trophy"></Icon>
                竞赛
              </Menu-item>
              <Menu-item name="/status">
                <Icon type="ios-pulse-strong"></Icon>
                状态
              </Menu-item>
              <Submenu name="">
                <template slot="title">
                  <Icon type="podium"></Icon>
                  比例
                </template>
                <Menu-item name="/acm-rank">
                  ACM 比例
                </Menu-item>
                <Menu-item name="/oi-rank">
                  OI 比例
                </Menu-item>
              </Submenu>
              <Submenu name="">
                <template slot="title">
                  <Icon type="information-circled"></Icon>
                  关于
                </template>
                <Menu-item name="/about">
                  Judger
                </Menu-item>
                <Menu-item name="/FAQ">
                  FAQ
                </Menu-item>
              </Submenu>
            </Menu>
            </Col>
          </Row>
        </div>
      </div>
    </nav>
    <Modal v-model="modalVisible" :width="400">
      <div slot="header" class="modal-title">欢迎来到 {{website.website_name_shortcut}}</div>
      <component :is="modalStatus.mode" v-if="modalVisible"></component>
      <div slot="footer" style="display: none"></div>
    </Modal>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import login from '@oj/views/user/Login'
  import register from '@oj/views/user/Register'
  import { hasClass, removeClass } from '@/utils/dom.js'
  export default {
    components: {
      login,
      register
    },
    mounted () {
      this.getProfile()
    },
    methods: {
      ...mapActions(['getProfile', 'changeModalStatus']),
      handleRoute (route) {
        if (route && route.indexOf('admin') < 0) {
          this.$router.push(route)
        } else {
          window.open('/admin/')
        }
        this.removeClass('my-bottom-nav')
      },
      handleBtnClick (mode) {
        this.changeModalStatus({
          visible: true,
          mode: mode
        })
      },
      removeClass (el, e) {
        if (e && e.target) {
          // 二级菜单 点击二级菜单下的导航(小屏幕)后收起导航
          if (hasClass(e.target, 'dropdown-toggle')) {
            return false
          }
        }
        // bootstrap3框架 导航栏切换时添加的class in
        // console.log(el)
        removeClass(this.$refs[el], 'in')
      }
    },
    computed: {
      ...mapGetters(['website', 'modalStatus', 'user', 'profile', 'isAuthenticated', 'isAdminRole']),
      // 跟随路由变化
      activeMenu () {
        return '/' + this.$route.path.split('/')[1]
      },
      modalVisible: {
        get () {
          return this.modalStatus.visible
        },
        set (value) {
          // console.log(value, 1)
          this.changeModalStatus({visible: value})
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  
  #header {
    height: 100px;
    overflow: hidden;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
    .navbar {
      margin-bottom: 0;
      border: none;
      &.navbar-fixed-top {
        z-index: 50;
      }
      .navbar-header {
        .navbar-brand {
          padding: 0;
          .logo {
            display: inline-block;
            height: 50px;
            vertical-align: middle;
            margin: 0 20px;
          }
          .title {
            margin-left: 10px;
            font-size: 20px;
            font-family: FangSong;
            color: rgba(0,0,0,0.7);
          }
        }
      }
      #my-top-nav {
        .nav {
          height: 50px;
          line-height: 50px;
          .ivu-dropdown {
            height: 100%;
            font-size: 14px;
            padding: 0;
            cursor: pointer;
            #user-option {
              display: inline-block;
              height: 100%;
              line-height: inherit;
              color: rgba(0, 0, 0, 0.5);
              padding: 0 8px;
              &:hover, &:focus {
                text-decoration: none;
              }
            }
            & /deep/ .ivu-select-dropdown {
              z-index: 901;
            }
          }
          .logout {
            float: right;
            height: 100%;
            line-height: inherit;
            padding: 0 8px;
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
          }
        }
      }
      #my-bottom-nav {
        .is-show {
          display: block !important;
        }
        .is-hidden {
          display: none !important;
        }
        .ivu-menu {
          height: 50px;
          line-height: 50px;
          background-color: #f8f8f8;
          .ivu-col {
            text-align: center;
            cursor: pointer;
          }
          .ivu-menu-submenu {
            .ivu-menu-item {
              line-height: normal;
            }
          }
        }
      }
    }
  }
  @media screen and (max-width: 767px) {
    #header {
      height: 50px;
      .navbar {
        .navbar-toggle {
          margin-left: 15px;
          &.click-me {
            width: 30px;
            height: 30px;
            padding: 0;
            border-radius:50%;
            overflow:hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        #my-top-nav {
          .navbar-nav {
            margin-left: 0;
            margin-right: 0;
            height: auto;
          }
        }
        .container-fluid {
          padding: 0;
          margin: 0;
          .navbar-collapse {
            padding: 0;
            margin: 0;
          }
        }
        #my-bottom-nav {
          .is-show {
            display: none !important;
          }
          .is-hidden {
            display: block !important;
          }
          & /deep/ .ivu-menu-submenu .ivu-menu-submenu-title-icon {
            float: none;
            left: 5px;
            top: 0;
          }
        }
      }
    }
  }
</style>