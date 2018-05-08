import types from '../types'
import moment from 'moment'
import api from '@oj/api'
import { COURSE_STATUS, USER_TYPE } from '@/utils/constants'
const state = {
  courseNow: moment(),
  course: {
    created_by: {}
  },
  units: [],
  unit: {
    smallProblems: [],
    programProblems: []
  }
}
const getters = {
  courseLoaded: (state) => {
    return !!state.course.title
  },
  courseStatus: (state, getters) => {
    // 若无则说明未在课程界面或未加载好
    if (!getters.courseLoaded) return null
    let startTime = moment(state.course.start_time)
    let endTime = moment(state.course.end_time)
    let now = state.courseNow
    // 根据当前时间判断
    if (startTime > now) {
      return COURSE_STATUS.NOT_START
    } else if (endTime < now) {
      return COURSE_STATUS.ENDED
    } else {
      return COURSE_STATUS.UNDERWAY
    }
  },
  courseUnits: (state, getters) => {
    let units = state.units
    units.forEach(unit => {
      let startTime = moment(unit.start_time)
      let endTime = moment(unit.end_time)
      let now = state.courseNow
      // 根据当前时间判断
      if (startTime > now) {
        unit.status = COURSE_STATUS.NOT_START
      } else if (endTime < now) {
        unit.status = COURSE_STATUS.ENDED
      } else {
        unit.status = COURSE_STATUS.UNDERWAY
      }
    })
    return units
  },
  unitLoaded: (state) => {
    return !!state.unit.title
  },
  // 某个单元的状态
  unitStatus: (state, getters) => {
    // 若无则说明未在课程界面或未加载好
    if (!getters.courseLoaded && !getters.unitLoaded) return null
    let startTime = moment(state.unit.start_time)
    let endTime = moment(state.unit.end_time)
    let now = state.courseNow
    if (startTime > now) {
      return COURSE_STATUS.NOT_START
    } else if (endTime < now) {
      return COURSE_STATUS.ENDED
    } else {
      return COURSE_STATUS.UNDERWAY
    }
  },
  isCourseAdmin: (state, getters, _, rootGetters) => {
    return rootGetters.isAuthenticated && (state.course.created_by.id === rootGetters.user.id || rootGetters.user.admin_type === USER_TYPE.SUPER_ADMIN)
  },
  // 判断课程单元代码提交按钮是否可点击
  courseProblemSubmitDisabled: (state, getters, _, rootGetters) => {
    if (getters.courseStatus === COURSE_STATUS.ENDED) {
      // 若课程结束则无法点击
      console.log(1)
      return true
    } else if (getters.courseStatus === COURSE_STATUS.NOT_START) {
      // 若未开始则是超级管理员或者课程创建者可以提交代码测试
      console.log(2)
      return !getters.isCourseAdmin
    } else if (getters.unitStatus === COURSE_STATUS.ENDED) {
      console.log(3)
      // 若课程进行而单元结束则无法点击
      return true
    } else if (getters.unitStatus === COURSE_STATUS.NOT_START) {
      console.log(4)
      return !getters.isCourseAdmin
    }
    return !rootGetters.isAuthenticated
  },
  courseStartTime: (state) => {
    return moment(state.course.start_time)
  },
  courseEndTime: (state) => {
    return moment(state.course.end_time)
  },
  countDown: (state, getters) => {
    if (getters.courseStatus === COURSE_STATUS.NOT_START) {
      let duration = moment.duration(getters.courseStartTime.diff(state.courseNow, 'seconds'), 'seconds')
      // time is too long
      if (duration.weeks() > 0) {
        return duration.humanize() + '后开始'
      }
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else if (getters.courseStatus === COURSE_STATUS.UNDERWAY) {
      let duration = moment.duration(getters.courseEndTime.diff(state.courseNow, 'seconds'), 'seconds')
      let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
      return '-' + texts.join(':')
    } else {
      return '已结束'
    }
  },
  unitStartTime: (state) => {
    return moment(state.unit.start_time)
  },
  unitEndTime: (state) => {
    return moment(state.unit.end_time)
  }
}
const mutations = {
  [types.CHANGE_COURSE] (state, payload) {
    state.course = payload.course
  },
  [types.CHANGE_UNIT] (state, payload) {
    Object.assign(state.unit, payload.unit)
  },
  [types.CHANGE_COURSE_UNITS] (state, payload) {
    state.units = payload.units
  },
  [types.CLEAR_COURSE] (state) {
    state.course = {created_by: {}}
    state.units = []
    state.unit = {smallProblems: [], programProblems: []}
  },
  [types.CLEAR_COURSE_UNIT] (state) {
    state.unit = {smallProblems: [], programProblems: []}
  },
  [types.COURSE_NOW] (state, payload) {
    state.courseNow = payload.now
  },
  [types.COURSE_NOW_ADD_1S] (state) {
    state.courseNow = moment(state.courseNow.add(1, 's'))
  }
}
const actions = {
  // 获取课程信息
  getCourse ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getCourse(rootState.route.params.courseID).then(res => {
        resolve(res)
        let course = res.data.data
        commit(types.CHANGE_COURSE, {course: course})
        commit(types.COURSE_NOW, {now: moment()})
      }, res => {
        reject(res)
      })
    })
  },
  // 获取课程单元列表 并添加status状态字段
  getCourseUnitList ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getCourseUnitList(rootState.route.params.courseID).then(res => {
        commit(types.CHANGE_COURSE_UNITS, {units: res.data.data})
        resolve(res)
      }, res => {
        commit(types.CHANGE_COURSE_UNITS, {units: []})
      })
    })
  },
  // 获取某个单元的信息
  getCourseUnit ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getCourseUnit(rootState.route.params.unitID).then(res => {
        commit(types.CHANGE_UNIT, {unit: res.data.data})
        resolve(res)
      }, res => {
        commit(types.CHANGE_UNIT, {unit: {smallProblems: [], programProblems: []}})
      })
    })
  },
  // 获取单元习题信息
  getCourseUnitProblemList ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      let params = {
        course_id: rootState.route.params.courseID,
        task_id: rootState.route.params.unitID
      }
      api.getCourseUnitProblemList(params).then(res => {
        // data1为小题数组 data2为编程题数组
        let small = res.data.data1
        let program = res.data.data2
        commit(types.CHANGE_UNIT, {unit: {smallProblems: small, programProblems: program}})
        resolve(res)
      }, res => {
        commit(types.CHANGE_UNIT, {unit: {smallProblems: [], programProblems: []}})
      })
    })
  }
}
export default {
  state,
  mutations,
  getters,
  actions
}
