import moment from 'moment'
import types from '../types'
import api from '@oj/api'
import { EXAMINATION_STATUS, USER_TYPE, EXAMINATION_TYPE } from '@/utils/constants'

const state = {
  now: moment(),
  // 非公共测验验证密码正确后 为true
  access: false,
  rankLimit: 30,
  examination: {
    created_by: {},
    examination_type: EXAMINATION_TYPE.PUBLIC
  },
  examinationProblems: [],
  itemVisible: {
    menu: true,
    chart: true,
    realName: false
  }
}

const getters = {
  examinationLoaded: (state) => {
    return !!state.examination.status
  },
  // 测验的状态
  examinationStatus: (state, getters) => {
    if (!getters.examinationLoaded) return null
    let startTime = moment(state.examination.start_time)
    let endTime = moment(state.examination.end_time)
    let now = state.now
    // 判断是 未开始 或 已结束 或 正在进行
    if (startTime > now) {
      return EXAMINATION_STATUS.NOT_START
    } else if (endTime < now) {
      return EXAMINATION_STATUS.ENDED
    } else {
      return EXAMINATION_STATUS.UNDERWAY
    }
  },
  // 已登录 且 该测验的创建者或者该账号为管理员
  isExamAdmin: (state, getters, _, rootGetters) => {
    return rootGetters.isAuthenticated &&
      (state.examination.created_by.id === rootGetters.user.id || rootGetters.user.admin_type === USER_TYPE.SUPER_ADMIN)
  },
  // 判断该导航(题目、排行榜、提交状态等)是否可以点击 如果是创建者 或者公共测验且不是未开始状态
  // 或者 是非公开的 验证密码正确 三种情况返回false 为可点击状态
  examMenuDisabled: (state, getters) => {
    if (getters.isExamAdmin) return false
    if (state.examination.examination_type === EXAMINATION_TYPE.PUBLIC) {
      return getters.examinationStatus === EXAMINATION_STATUS.NOT_START
    }
    return !state.access
  },
  // 判断代码提交按钮是否可点击
  examProblemSubmitDisabled: (state, getters, _, rootGetters) => {
    if (getters.examinationStatus === EXAMINATION_STATUS.ENDED) {
      return true
    } else if (getters.examinationStatus === EXAMINATION_STATUS.NOT_START) {
      return !getters.isExamAdmin
    }
    return !rootGetters.isAuthenticated
  },
  // 判断是否显示密码输入框
  passwordVisible: (state, getters) => {
    return state.examination.examination_type !== EXAMINATION_TYPE.PUBLIC && !state.access && !getters.isExamAdmin
  },
  examStartTime: (state) => {
    return moment(state.examination.start_time)
  },
  examEndTime: (state) => {
    return moment(state.examination.end_time)
  },
  examCountdown: (state, getters) => {
    if (getters.examinationStatus === EXAMINATION_STATUS.NOT_START) {
      let duration = moment.duration(getters.examStartTime.diff(state.now, 'seconds'), 'seconds')
      // time is too long
      if (duration.weeks() > 0) {
        return duration.humanize() + '开始'
      }
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else if (getters.examinationStatus === EXAMINATION_STATUS.UNDERWAY) {
      let duration = moment.duration(getters.examEndTime.diff(state.now, 'seconds'), 'seconds')
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else {
      return '已结束'
    }
  }
}

const mutations = {
  [types.CHANGE_EXAMINATION] (state, payload) {
    state.examination = payload.examination
  },
  [types.CHANGE_EXAMINATION_PROBLEMS] (state, payload) {
    state.examinationProblems = payload.problems
  },
  [types.CHANGE_EXAMINATION_ITEM_VISIBLE] (state, payload) {
    state.itemVisible = {...state.itemVisible, ...payload}
  },
  [types.EXAMINATION_ACCESS] (state, payload) {
    state.access = payload.access
  },
  [types.NOW] (state, payload) {
    state.now = payload.now
  },
  [types.EXAM_NOW_ADD_1S] (state) {
    state.now = moment(state.now.add(1, 's'))
  },
  [types.CLEAR_EXAMINATION] (state) {
    state.examination = {created_by: {}}
    state.examinationProblems = []
    state.access = false
    state.itemVisible = {
      menu: true,
      chart: true,
      realName: false
    }
  }
}

const actions = {
  // 获取训练数据
  getTest ({commit, rootState, dispatch}) {
    return new Promise((resolve, reject) => {
      api.getTest(rootState.route.params.testID).then((res) => {
        resolve(res)
        let test = res.data.data
        commit(types.CHANGE_EXAMINATION, {examination: test})
        commit(types.NOW, {now: moment(test.now)})
        // 若为私有
        if (test.examination_type === EXAMINATION_TYPE.PRIVATE) {
          dispatch('getTestAccess')
        }
      }, err => {
        // 测试
        // commit(types.CHANGE_EXAMINATION, {examination: {id: '2', title: '测试2', start_time: '2017-1-2', end_time: '2018-4-1', status: -1, created_by: {username: '2b'}, examination_type: EXAMINATION_TYPE.PUBLIC, now: '2018-3-1'}})
        reject(err)
      })
    })
  },
  getTestProblems ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getTestProblemList(rootState.route.params.testID).then(res => {
        res.data.data.sort((a, b) => {
          return a._id > b._id
        })
        commit(types.CHANGE_EXAMINATION_PROBLEMS, {problems: res.data.data})
        resolve(res)
      }, () => {
        commit(types.CHANGE_EXAMINATION_PROBLEMS, {problems: []})
      })
    })
  },
  getTestAccess ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getTestAccess(rootState.route.params.testID).then(res => {
        commit(types.EXAMINATION_ACCESS, {access: res.data.data.access})
        resolve(res)
      }).catch()
    })
  },
  // 获取作业数据
  getHomework ({commit, rootState, dispatch}) {
    return new Promise((resolve, reject) => {
      api.getHomework(rootState.route.params.homeworkID).then((res) => {
        resolve(res)
        let test = res.data.data
        commit(types.CHANGE_EXAMINATION, {examination: test})
        commit(types.NOW, {now: moment(test.now)})
        // 若为私有
        if (test.examination_type === EXAMINATION_TYPE.PRIVATE) {
          dispatch('getHomeworkAccess')
        }
      }, err => {
        // commit(types.CHANGE_EXAMINATION, {examination: {id: '3', title: '测试4', start_time: '2017-1-2', end_time: '2018-5-1', status: 1, created_by: {username: '2b'}, examination_type: EXAMINATION_TYPE.PUBLIC, now: '2018-3-1'}})
        reject(err)
      })
    })
  },
  getHomeworkProblems ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getHomeworkProblemList(rootState.route.params.testID).then(res => {
        res.data.data.sort((a, b) => {
          return a._id > b._id
        })
        commit(types.CHANGE_EXAMINATION_PROBLEMS, {problems: res.data.data})
        resolve(res)
      }, () => {
        commit(types.CHANGE_EXAMINATION_PROBLEMS, {problems: []})
      })
    })
  },
  getHomeworkAccess ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getHomeworkAccess(rootState.route.params.homeworkID).then(res => {
        commit(types.EXAMINATION_ACCESS, {access: res.data.data.access})
        resolve(res)
      }).catch()
    })
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
