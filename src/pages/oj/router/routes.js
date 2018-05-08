// all routes here.
import {
  About,
  ACMRank,
  Announcements,
  ApplyResetPassword,
  Home,
  Logout,
  NotFound,
  OIRank,
  Problem,
  ProblemList,
  ResetPassword,
  SubmissionDetails,
  SubmissionList,
  UserHome
} from '../views'

import * as Contest from '@oj/views/contest'
import * as Setting from '@oj/views/setting'
import * as Course from '@oj/views/course'

export default [
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'logout',
    path: '/logout',
    component: Logout
  },
  {
    name: 'apply-reset-password',
    path: '/apply-reset-password',
    component: ApplyResetPassword
  },
  {
    name: 'reset-password',
    path: '/reset-password/:token',
    component: ResetPassword
  },
  {
    name: 'problem-list',
    path: '/problems',
    component: ProblemList
  },
  {
    name: 'problem-details',
    path: '/problem/:problemID',
    component: Problem
  },
  // 新增 小题列表的路由
  {
    name: 'small-problem-list',
    path: '/smallProblems',
    component: ProblemList
  },
  {
    name: 'submission-list',
    path: '/status',
    component: SubmissionList
  },
  {
    name: 'submission-details',
    path: '/status/:id/',
    component: SubmissionDetails
  },
  {
    name: 'contest-list',
    path: '/contests',
    component: Contest.ContestList
  },
  {
    name: 'contest-details',
    path: '/contest/:contestID/',
    component: Contest.ContestDetails,
    children: [
      {
        name: 'contest-submission-list',
        path: 'submissions',
        component: SubmissionList
      },
      {
        name: 'contest-problem-list',
        path: 'problems',
        component: Contest.ContestProblemList
      },
      {
        name: 'contest-problem-details',
        path: 'problem/:problemID/',
        component: Problem
      },
      {
        name: 'contest-announcement-list',
        path: 'announcements',
        component: Announcements
      },
      {
        name: 'contest-rank',
        path: 'rank',
        component: Contest.ContestRank
      },
      {
        name: 'acm-helper',
        path: 'helper',
        component: Contest.ACMContestHelper
      }
    ]
  },
  // 课程相关路由
  // 课程列表
  {
    name: 'course-list',
    path: '/courses',
    meta: {requiresAuth: true},
    component: Course.CourseList
  },
  // 单个课程信息
  {
    name: 'course-details',
    path: '/course/:courseID/',
    meta: {requiresAuth: true},
    component: Course.CourseDetail,
    children: [
      // 公告列表
      {
        name: 'course-announcement-list',
        path: 'announcements',
        component: Announcements
      },
      // 单元列表
      {
        name: 'course-unit-list',
        path: 'unit',
        component: Course.CourseUnitList
      },
      // 单元习题列表
      {
        name: 'course-unit-problem-list',
        path: 'unit/:unitID',
        component: Course.UnitProblemList
      },
      // 单元编程题界面
      {
        name: 'course-unit-problem',
        path: 'unit/:unitID/problem/:problemID',
        component: Problem
      }
    ]
  },

  {
    name: 'acm-rank',
    path: '/acm-rank',
    component: ACMRank
  },
  {
    name: 'oi-rank',
    path: '/oi-rank',
    component: OIRank
  },
  {
    name: 'user-home',
    path: '/user-home',
    component: UserHome,
    meta: {requiresAuth: true}
  },
  {
    path: '/setting',
    component: Setting.Settings,
    children: [
      {
        name: 'default-setting',
        path: '',
        meta: {requiresAuth: true},
        component: Setting.ProfileSetting
      },
      {
        name: 'profile-setting',
        path: 'profile',
        meta: {requiresAuth: true},
        component: Setting.ProfileSetting
      },
      {
        name: 'account-setting',
        path: 'account',
        meta: {requiresAuth: true},
        component: Setting.AccountSetting
      },
      {
        name: 'security-setting',
        path: 'security',
        meta: {requiresAuth: true},
        component: Setting.SecuritySetting
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '*',
    meta: {title: '404'},
    component: NotFound
  }
]
