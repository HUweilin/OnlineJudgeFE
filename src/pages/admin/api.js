import Vue from 'vue'
import router from './router'
import axios from 'axios'
import utils from '@/utils/utils'

Vue.prototype.$http = axios
axios.defaults.baseURL = '/api'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
  // 登录
  login (username, password) {
    return ajax('login', 'post', {
      data: {
        username,
        password
      }
    })
  },
  logout () {
    return ajax('logout', 'get')
  },
  getProfile () {
    return ajax('profile', 'get')
  },
  // 获取公告列表
  getAnnouncementList (offset, limit) {
    return ajax('admin/announcement', 'get', {
      params: {
        paging: true,
        offset,
        limit
      }
    })
  },
  // 删除公告
  deleteAnnouncement (id) {
    return ajax('admin/announcement', 'delete', {
      params: {
        id
      }
    })
  },
  // 修改公告
  updateAnnouncement (data) {
    return ajax('admin/announcement', 'put', {
      data
    })
  },
  // 添加公告
  createAnnouncement (data) {
    return ajax('admin/announcement', 'post', {
      data
    })
  },
  // 获取用户列表
  getUserList (offset, limit, keyword) {
    let params = {paging: true, offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    return ajax('admin/user', 'get', {
      params: params
    })
  },
  // 获取单个用户信息
  getUser (id) {
    return ajax('admin/user', 'get', {
      params: {
        id
      }
    })
  },
  // 编辑用户
  editUser (data) {
    return ajax('admin/user', 'put', {
      data
    })
  },
  deleteUsers (id) {
    return ajax('admin/user', 'delete', {
      params: {
        id
      }
    })
  },
  importUsers (users) {
    return ajax('admin/user', 'post', {
      data: {
        users
      }
    })
  },
  generateUser (data) {
    return ajax('admin/generate_user', 'post', {
      data
    })
  },
  getLanguages () {
    return ajax('languages', 'get')
  },
  getSMTPConfig () {
    return ajax('admin/smtp', 'get')
  },
  createSMTPConfig (data) {
    return ajax('admin/smtp', 'post', {
      data
    })
  },
  editSMTPConfig (data) {
    return ajax('admin/smtp', 'put', {
      data
    })
  },
  testSMTPConfig (email) {
    return ajax('admin/smtp_test', 'post', {
      data: {
        email
      }
    })
  },
  getWebsiteConfig () {
    return ajax('admin/website', 'get')
  },
  editWebsiteConfig (data) {
    return ajax('admin/website', 'post', {
      data
    })
  },
  getJudgeServer () {
    return ajax('admin/judge_server', 'get')
  },
  deleteJudgeServer (hostname) {
    return ajax('admin/judge_server', 'delete', {
      params: {
        hostname: hostname
      }
    })
  },
  updateJudgeServer (data) {
    return ajax('admin/judge_server', 'put', {
      data
    })
  },
  getInvalidTestCaseList () {
    return ajax('admin/prune_test_case', 'get')
  },
  pruneTestCase (id) {
    return ajax('admin/prune_test_case', 'delete', {
      params: {
        id
      }
    })
  },
  createContest (data) {
    return ajax('admin/contest', 'post', {
      data
    })
  },
  getContest (id) {
    return ajax('admin/contest', 'get', {
      params: {
        id
      }
    })
  },
  // 修改竞赛信息
  editContest (data) {
    return ajax('admin/contest', 'put', {
      data
    })
  },
  getContestList (offset, limit, keyword) {
    let params = {paging: true, offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    return ajax('admin/contest', 'get', {
      params: params
    })
  },
  getContestAnnouncementList (contestID) {
    return ajax('admin/contest/announcement', 'get', {
      params: {
        contest_id: contestID
      }
    })
  },
  createContestAnnouncement (data) {
    return ajax('admin/contest/announcement', 'post', {
      data
    })
  },
  deleteContestAnnouncement (id) {
    return ajax('admin/contest/announcement', 'delete', {
      params: {
        id
      }
    })
  },
  updateContestAnnouncement (data) {
    return ajax('admin/contest/announcement', 'put', {
      data
    })
  },
  getProblemTagList () {
    return ajax('problem/tags', 'get')
  },
  compileSPJ (data) {
    return ajax('admin/compile_spj', 'post', {
      data
    })
  },
  createProblem (data) {
    return ajax('admin/problem', 'post', {
      data
    })
  },
  editProblem (data) {
    return ajax('admin/problem', 'put', {
      data
    })
  },
  deleteProblem (id) {
    return ajax('admin/problem', 'delete', {
      params: {
        id
      }
    })
  },
  getProblem (id) {
    return ajax('admin/problem', 'get', {
      params: {
        id
      }
    })
  },
  // 获取编程题题库
  getProblemList (params) {
    params = utils.filterEmptyValue(params)
    return ajax('admin/problem', 'get', {
      params
    })
  },
  getContestProblemList (params) {
    params = utils.filterEmptyValue(params)
    return ajax('admin/contest/problem', 'get', {
      params
    })
  },
  getContestProblem (id) {
    return ajax('admin/contest/problem', 'get', {
      params: {
        id
      }
    })
  },
  createContestProblem (data) {
    return ajax('admin/contest/problem', 'post', {
      data
    })
  },
  editContestProblem (data) {
    return ajax('admin/contest/problem', 'put', {
      data
    })
  },
  deleteContestProblem (id) {
    return ajax('admin/contest/problem', 'delete', {
      params: {
        id
      }
    })
  },
  makeContestProblemPublic (data) {
    return ajax('admin/contest_problem/make_public', 'post', {
      data
    })
  },
  addProblemFromPublic (data) {
    return ajax('admin/contest/add_problem_from_public', 'post', {
      data
    })
  },
  getReleaseNotes () {
    return ajax('admin/versions', 'get')
  },
  getDashboardInfo () {
    return ajax('admin/dashboard_info', 'get')
  },
  getSessions () {
    return ajax('sessions', 'get')
  },
  exportProblems (data) {
    return ajax('export_problem', 'post', {
      data
    })
  },
  // 获取小题题库列表
  getSmallProblemList (params) {
    params = utils.filterEmptyValue(params)
    return ajax('admin/small_problem', 'get', {
      params
    })
  },
  // 获取小题标签列表
  getSmallProblemTagList () {
    return ajax('small_problem/tags', 'get')
  },
  // 创建小题
  createSmallProblem (data) {
    return ajax('admin/small_problem', 'post', {
      data
    })
  },
  // 获取小题详细信息
  getSmallProblem (id) {
    return ajax('admin/small_problem', 'get', {
      params: {
        id
      }
    })
  },
  // 提交修改的小题信息
  editSmallProblem (data) {
    return ajax('admin/small_problem', 'put', {
      data
    })
  },
  // 删除小题题库的某个题目
  deleteSmallProblem (id) {
    return ajax('admin/small_problem', 'delete', {
      params: {
        id
      }
    })
  },
  // 课程模块
  // 获取当前课程列表
  getCourseList (offset, limit, keyword) {
    let params = {paging: true, offset, limit}
    if (keyword) {
      params.keyword = keyword
    }
    return ajax('admin/course', 'get', {
      params: params
    })
  },
  // 获取某个课程的信息
  getCourse (id) {
    return ajax('admin/course', 'get', {
      params: {
        id
      }
    })
  },
  // 删除某个课程
  deleteCourse (id) {
    return ajax('admin/course', 'delete', {
      params: {
        id
      }
    })
  },
  // 课程公告部分
  getCourseAnnouncementList (id) {
    return ajax('admin/course/announcement', 'get', {
      params: {
        course_id: id
      }
    })
  },
  createCourseAnnouncement (data) {
    return ajax('admin/course/announcement', 'post', {
      data
    })
  },
  deleteCourseAnnouncement (id) {
    return ajax('admin/course/announcement', 'delete', {
      params: {
        id
      }
    })
  },
  updateCourseAnnouncement (data) {
    return ajax('admin/course/announcement', 'put', {
      data
    })
  },
  // 课程成员部分
  // 获取课程学生信息
  getCourseMember (id) {
    return ajax('admin/course/member', 'get', {
      params: {
        course_id: id
      }
    })
  },
  // 删除课程学生信息
  deleteCourseMember (data) {
    return ajax('admin/course/member', 'put', {
      data
    })
  },
  // 添加课程学生信息
  addCourseMember (data) {
    return ajax('admin/course/member', 'post', {
      data
    })
  },
  // 课程单元模块
  // 获取单元列表
  getCourseUnitList (id) {
    return ajax('admin/course/task', 'get', {
      params: {
        course_id: id
      }
    })
  },
  // 创建新单元
  createCourseUnit (data) {
    return ajax('admin/course/task', 'post', {
      data
    })
  },
  // 删除单元
  deleteCourseUnit (params) {
    return ajax('admin/course/task', 'delete', {
      params
    })
  },
  // 修改单元信息
  editCourseUnit (data) {
    return ajax('admin/course/task', 'put', {
      data
    })
  },
  // 获取单元习题列表 参数为course_id和task_id
  getUnitProblemList (params) {
    return ajax('admin/course/task_problem', 'get', {
      params
    })
  },
  // 添加题库的题
  addUnitProblemFromPublic (data) {
    return ajax('admin/course/task/add_problem_from_public', 'post', {
      data
    })
  },
  // 创建单元编程题的信息
  createUnitProblem (data) {
    return ajax('admin/course/task/problem', 'post', {
      data
    })
  },
  // 修改单元编程题的信息
  editUnitProblem (data) {
    return ajax('admin/course/task/problem', 'put', {
      data
    })
  },
  // 创建单元小题的信息
  createUnitSmallProblem (data) {
    return ajax('admin/course/task/small_problem', 'post', {
      data
    })
  },
  // 修改单元小题的信息
  editUnitSmallProblem (data) {
    return ajax('admin/course/task/small_problem', 'put', {
      data
    })
  },
  // 删除单元某个习题
  deleteUnitProblem (data) {
    return ajax('admin/course/task_problem', 'put', {
      data
    })
  },
  // 获取单元设置信息
  getUnitSetting (params) {
    return ajax('admin/course/task', 'get', {
      params
    })
  }
}

/**
 * @param url
 * @param method get|post|put|delete...
 * @param params like queryString. if a url is index?a=1&b=2, params = {a: '1', b: '2'}
 * @param data post data, use for method put|post
 * @returns {Promise}
 */
function ajax (url, method, options) {
  if (options !== undefined) {
    var {params = {}, data = {}} = options
  } else {
    params = data = {}
  }
  return new Promise((resolve, reject) => {
    axios({
      url,
      method,
      params,
      data
    }).then(res => {
      // API正常返回(status=20x), 是否错误通过有无error判断
      if (res.data.error !== null) {
        Vue.prototype.$error(res.data.data)
        reject(res)
        // // 若后端返回为登录，则为session失效，应退出当前登录用户
        if (res.data.data.startsWith('Please login')) {
          router.push({name: 'login'})
        }
      } else {
        resolve(res)
        if (method !== 'get') {
          Vue.prototype.$success('操作成功')
        }
      }
    }, res => {
      // API请求异常，一般为Server error 或 network error
      reject(res)
      Vue.prototype.$error(res.data.data)
    })
  })
}
