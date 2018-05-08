<template>
  <div>
    <NavBar></NavBar>
    <div class="content-app">
      <transition name="fadeInUp" mode="out-in">
        <router-view></router-view>
      </transition>
      <div id="footer">
        <p v-html="website.website_footer"></p>
        <p>学院网站: <a href="http://www.gpnu.edu.cn/">广技师官网</a>&nbsp;&nbsp;<a href="http://sxxy.gpnu.edu.cn/">数科院官网</a></p>
        <p>友情链接: <a href="http://114.215.99.34">DI Studio-OJ</a>&nbsp;&nbsp;<a href="http://acm.hdu.edu.cn/">HDU-OJ</a>
          <!-- <span v-if="version">&nbsp; Version: {{ version }}</span> -->
        </p>
      </div>
    </div>
    <BackTop></BackTop>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import NavBar from '@oj/components/NavBar.vue'
  export default {
    name: 'app',
    components: {
      NavBar
    },
    data () {
      return {
        version: process.env.VERSION
      }
    },
    created () {
      try {
        document.body.removeChild(document.getElementById('app-loader'))
      } catch (e) {
      }
    },
    mounted () {
      this.getWebsiteConfig()
    },
    methods: {
      ...mapActions(['getWebsiteConfig'])
    },
    computed: {
      ...mapState(['website'])
    }
  }
</script>

<style lang="less">

  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  // 新增
  body {
    min-width: 100%;
    width: 100%;
    height: 100%;
  }
  a {
    text-decoration: none;
    background-color: transparent;
    &:active, &:hover {
      outline-width: 0;
    }
  }


  .content-app {
    width: 100%;
    margin-top: 20px;
    padding: 0 2%;
    @media screen and (max-width: 750px) {
      margin-top: 10px;
      padding: 0 5px;
    }
  }

  #footer {
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
    font-size: small;
    font-size: 10px;
    p {
      margin: 0;
      line-height: 1.5;
    }
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }


</style>
