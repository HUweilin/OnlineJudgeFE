import Vue from 'vue'
import store from '@/store'
import axios from 'axios'

Vue.prototype.$http = axios
axios.defaults.baseURL = '/api'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

export default {
  getWebsiteConf (params) {
    return ajax('website', 'get', {
      params
    })
  },
  getAnnouncementList () {
    return ajax('announcement', 'get')
  },
  login (data) {
    return ajax('login', 'post', {
      data
    })
  },
  checkUsernameOrEmail (username, email) {
    return ajax('check_username_or_email', 'post', {
      data: {
        username,
        email
      }
    })
  },
  // 注册
  register (data) {
    return ajax('register', 'post', {
      data
    })
  },
  logout () {
    return ajax('logout', 'get')
  },
  getCaptcha () {
    return ajax('captcha', 'get')
  },
  getUserInfo (username = undefined) {
    return ajax('profile', 'get', {
      params: {
        username
      }
    })
  },
  updateProfile (profile) {
    return ajax('profile', 'put', {
      data: profile
    })
  },
  freshDisplayID (userID) {
    return ajax('profile/fresh_display_id', 'get', {
      params: {
        user_id: userID
      }
    })
  },
  twoFactorAuth (method, data) {
    return ajax('two_factor_auth', method, {
      data
    })
  },
  tfaRequiredCheck (username) {
    return ajax('tfa_required', 'post', {
      data: {
        username
      }
    })
  },
  getSessions () {
    return ajax('sessions', 'get')
  },
  deleteSession (sessionKey) {
    return ajax('sessions', 'delete', {
      params: {
        session_key: sessionKey
      }
    })
  },
  applyResetPassword (data) {
    return ajax('apply_reset_password', 'post', {
      data
    })
  },
  resetPassword (data) {
    return ajax('reset_password', 'post', {
      data
    })
  },
  changePassword (data) {
    return ajax('change_password', 'post', {
      data
    })
  },
  changeEmail (data) {
    return ajax('change_email', 'post', {
      data
    })
  },
  getLanguages () {
    return ajax('languages', 'get')
  },
  // 获取编程题相关数据
  getProblemTagList () {
    return ajax('problem/tags', 'get')
  },
  getProblemList (offset, limit, searchParams) {
    let params = {
      paging: true,
      offset,
      limit
    }
    Object.keys(searchParams).forEach((element) => {
      if (searchParams[element]) {
        params[element] = searchParams[element]
      }
    })
    return ajax('problem', 'get', {
      params: params
    })
  },
  pickone () {
    return ajax('pickone', 'get')
  },
  getProblem (problemID) {
    return ajax('problem', 'get', {
      params: {
        problem_id: problemID
      }
    })
  },
  // 获取小题列表数据
  getSmallProList (offset, limit, searchParams) {
    let params = {
      paging: true,
      offset,
      limit
    }
    Object.keys(searchParams).forEach((element) => {
      if (searchParams[element]) {
        params[element] = searchParams[element]
      }
    })
    return ajax('small_problem', 'get', {
      params: params
    })
  },
  getSmallProblemTagList () {
    return ajax('small_problem/tags', 'get')
  },
  getSmallProblem (problemID) {
    return ajax('small_problem', 'get', {
      params: {
        small_problem_id: problemID
      }
    })
  },

  getContestList (offset, limit, searchParams) {
    let params = {
      offset,
      limit
    }
    if (searchParams !== undefined) {
      Object.keys(searchParams).forEach((element) => {
        if (searchParams[element]) {
          params[element] = searchParams[element]
        }
      })
    }
    return ajax('contests', 'get', {
      params
    })
  },

  getContest (id) {
    return ajax('contest', 'get', {
      params: {
        id
      }
    })
  },
  getContestAccess (contestID) {
    return ajax('contest/access', 'get', {
      params: {
        contest_id: contestID
      }
    })
  },
  checkContestPassword (contestID, password) {
    return ajax('contest/password', 'post', {
      data: {
        contest_id: contestID,
        password
      }
    })
  },
  getContestAnnouncementList (contestId) {
    return ajax('contest/announcement', 'get', {
      params: {
        contest_id: contestId
      }
    })
  },
  getContestProblemList (contestId) {
    return ajax('contest/problem', 'get', {
      params: {
        contest_id: contestId
      }
    })
  },
  getContestProblem (problemID, params) {
    let contestID = params.contestID
    return ajax('contest/problem', 'get', {
      params: {
        contest_id: contestID,
        problem_id: problemID
      }
    })
  },
  // 提交代码
  submitCode (data) {
    return ajax('submission', 'post', {
      data
    })
  },
  // 提交小题
  submitSmallProblem (data) {
    return ajax('submitSmallProblem', 'post', {
      data
    })
  },

  // 获取课程列表
  getCourseList () {
    return ajax('course', 'get')
  },
  // 获取课程信息
  getCourse (id) {
    return ajax('course', 'get', {
      params: {
        course_id: id
      }
    })
  },
  // 加入新课程
  addNewCourse (data) {
    return ajax('course/add', 'post', {
      data
    })
  },
  // 退出课程
  exitCourse (id) {
    return ajax('course/exit', 'delete', {
      params: {
        course_id: id
      }
    })
  },
  // 获取课程公告列表
  getCourseAnnouncementList (courseID) {
    return ajax('course/announcement', 'get', {
      params: {
        course_id: courseID
      }
    })
  },
  // 获取课程单元列表
  getCourseUnitList (courseID) {
    return ajax('course/task', 'get', {
      params: {
        course_id: courseID
      }
    })
  },
  // 获取课程单元信息 参数为task_id
  getCourseUnit (taskID) {
    return ajax('course/task', 'get', {
      params: {
        task_id: taskID
      }
    })
  },
  // 获取课程单元的习题列表 需要两个参数course_id和task_id
  getCourseUnitProblemList (params) {
    return ajax('course/task/problem', 'get', {
      params
    })
  },
  // 获取单元编程题
  getUnitProblem (problemId, params) {
    return ajax('course/task/problem', 'get', {
      params: {
        problem_id: problemId,
        course_id: params.courseID,
        task_id: params.taskID
      }
    })
  },
  // 提交编程题代码
  submitUnitCode (data) {
    return ajax('course/task/submit', 'post', {
      data
    })
  },
  // 获取编程题判题结果
  getCourseSubmission (id) {
    return ajax('course/task/submission', 'get', {
      params: {
        id
      }
    })
  },
  // 获取单元小题
  getUnitSmallProblem (id) {
    return ajax('course/task/small_problem', 'get', {
      params: {
        small_problem_id: id
      }
    })
  },
  // 提交单元小题
  submitUnitSmallProblem (data) {
    return ajax('course/task/submit_small', 'post', {
      data
    })
  },

  getSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('submissions', 'get', {
      params
    })
  },
  getContestSubmissionList (offset, limit, params) {
    params.limit = limit
    params.offset = offset
    return ajax('contest_submissions', 'get', {
      params
    })
  },
  getSubmission (id) {
    return ajax('submission', 'get', {
      params: {
        id
      }
    })
  },
  submissionExists (problemID) {
    return ajax('submission_exists', 'get', {
      params: {
        problem_id: problemID
      }
    })
  },
  submissionRejudge (id) {
    return ajax('admin/submission/rejudge', 'get', {
      params: {
        id
      }
    })
  },
  updateSubmission (data) {
    return ajax('submission', 'put', {
      data
    })
  },
  getUserRank (offset, limit, rule = 'acm') {
    let params = {
      offset,
      limit,
      rule
    }
    return ajax('user_rank', 'get', {
      params
    })
  },
  getContestRank (params) {
    return ajax('contest_rank', 'get', {
      params
    })
  },
  getACMACInfo (params) {
    return ajax('admin/contest/acm_helper', 'get', {
      params
    })
  },
  updateACInfoCheckedStatus (data) {
    return ajax('admin/contest/acm_helper', 'put', {
      data
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
        // 若后端返回为登录，则为session失效，应退出当前登录用户
        if (res.data.data.startsWith('Please login')) {
          store.dispatch('changeModalStatus', {'mode': 'login', 'visible': true})
        }
      } else {
        resolve(res)
        // if (method !== 'get') {
        //   Vue.prototype.$success('Succeeded')
        // }
      }
    }, res => {
      // API请求异常，一般为Server error 或 network error
      reject(res)
      Vue.prototype.$error(res.data.data)
    })
  })
}
