// all routes here.
import {
  About,
  ACMRank,
  Announcements,
  ApplyResetPassword,
  FAQ,
  Home,
  Logout,
  NotFound,
  OIRank,
  Problem,
  ProblemList,
  // smallProblemList,
  ResetPassword,
  SubmissionDetails,
  SubmissionList,
  UserHome
} from '../views'

import * as Contest from '@oj/views/contest'
import * as Setting from '@oj/views/setting'
import * as Examination from '@oj/views/class'

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
  // 新增 测验列表
  {
    name: 'testing-list',
    path: '/tests',
    component: Examination.ExaminationList
  },
  {
    name: 'test-details',
    path: '/test/:testID',
    component: Examination.ExaminationDetail,
    children: [
      {
        name: 'test-problem-list',
        path: 'problems',
        component: Examination.ExaminationProblemList
      },
      {
        name: 'test-problem-details',
        path: 'problem/:problemID/',
        component: Examination.Problem
      },
      {
        name: 'test-submission-list',
        path: 'submissions',
        component: SubmissionList
      },
      {
        name: 'test-rank',
        path: 'rank',
        component: Examination.Rank
      }
    ]
  },
  // 新增 作业列表
  {
    name: 'homework-list',
    path: '/homeworkList',
    component: Examination.ExaminationList
  },
  {
    name: 'homework-details',
    path: '/homework/:homeworkID',
    component: Examination.ExaminationDetail,
    children: [
      {
        name: 'homework-problem-list',
        path: 'problems',
        component: Examination.ExaminationProblemList
      },
      {
        name: 'homework-problem-details',
        path: 'problem/:problemID/',
        component: Examination.Problem
      },
      {
        name: 'homework-submission-list',
        path: 'submissions',
        component: SubmissionList
      },
      {
        name: 'homework-rank',
        path: 'rank',
        component: Examination.Rank
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
    path: '/faq',
    name: 'faq',
    component: FAQ
  },
  {
    path: '*',
    meta: {title: '404'},
    component: NotFound
  }
]
