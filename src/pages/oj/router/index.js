import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import storage from '@/utils/storage'
import {STORAGE_KEY} from '@/utils/constants'
import {sync} from 'vuex-router-sync'
import {types, default as store} from '../../../store'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  },
  routes
})

// 全局身份确认
router.beforeEach((to, from, next) => {
  // iview的loading-bar组件,顶部的进度条
  Vue.prototype.$Loading.start()
  // 这里是直接在地址栏输入url时会判断 路由中只有登录后的设置界面有设置requiresAuth属性
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      Vue.prototype.$error('请先登录!!!')
      store.commit(types.CHANGE_MODAL_STATUS, {mode: 'login', visible: true})
      next({
        name: 'home'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

router.afterEach((to, from, next) => {
  Vue.prototype.$Loading.finish()
})

sync(store, router)

export default router
