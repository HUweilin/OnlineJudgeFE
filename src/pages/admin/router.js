import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入 view 组件
import { Announcement, Conf, Contest, ContestList, Home, JudgeServer, Login,
  Problem, ProblemList, User, PruneTestCase, Dashboard, ProblemImportOrExport,
  smProblemList, smProblem } from './views'
import * as Course from '@admin/views/course'
Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: '/admin',
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          component: Dashboard
        },
        {
          path: '/announcement',
          name: 'announcement',
          component: Announcement
        },
        {
          path: '/user',
          name: 'user',
          component: User
        },
        {
          path: '/conf',
          name: 'conf',
          component: Conf
        },
        {
          path: '/judge-server',
          name: 'judge-server',
          component: JudgeServer
        },
        {
          path: '/prune-test-case',
          name: 'prune-test-case',
          component: PruneTestCase
        },
        {
          path: '/problems',
          name: 'problem-list',
          component: ProblemList
        },
        {
          path: '/problem/create',
          name: 'create-problem',
          component: Problem
        },
        {
          path: '/problem/edit/:problemId',
          name: 'edit-problem',
          component: Problem
        },
        {
          path: '/problem/batch_ops',
          name: 'problem_batch_ops',
          component: ProblemImportOrExport
        },
        {
          path: '/contest/create',
          name: 'create-contest',
          component: Contest
        },
        {
          path: '/contest',
          name: 'contest-list',
          component: ContestList
        },
        {
          path: '/contest/:contestId/edit',
          name: 'edit-contest',
          component: Contest
        },
        {
          path: '/contest/:contestId/announcement',
          name: 'contest-announcement',
          component: Announcement
        },
        {
          path: '/contest/:contestId/problems',
          name: 'contest-problem-list',
          component: ProblemList
        },
        {
          path: '/contest/:contestId/problem/create',
          name: 'create-contest-problem',
          component: Problem
        },
        // 修改竞赛某个题目的路由
        {
          path: '/contest/:contestId/problem/:problemId/edit',
          name: 'edit-contest-problem',
          component: Problem
        },
        // 小题列表路由
        {
          path: '/small-problems',
          name: 'small-problem-list',
          component: smProblemList
        },
        // 创建小题路由
        {
          path: '/small-problem/create',
          name: 'create-small-problem',
          component: smProblem
        },
        // 修改小题的路由(题库)
        {
          path: '/small-problem/edit/:problemId',
          name: 'edit-small-problem',
          component: smProblem
        },
        {
          path: '/small-problem/batch_ops',
          name: 'small_problem_batch_ops',
          component: ProblemImportOrExport
        },
        // 课程模块
        // 课程列表路由
        {
          path: '/courses',
          name: 'course-list',
          component: Course.CourseList
        },
        // 课程创建路由
        {
          path: '/course/create',
          name: 'course-create',
          component: Course.Course
        },
        // 课程主页路由
        {
          path: '/course/:courseId/',
          name: 'course-home',
          component: Course.CourseHome,
          children: [
            // 课程简介路由
            {
              path: 'intro',
              name: 'course-intro',
              component: Course.CourseIntro
            },
            // 课程公告路由
            {
              path: 'announcement',
              name: 'course-announcement',
              component: Course.Announcement
            },
            {
              path: 'member',
              name: 'course-member',
              component: Course.Member
            },
            {
              path: 'units',
              name: 'course-unit',
              component: Course.UnitList
            },
            {
              path: 'setting',
              name: 'course-setting',
              component: Course.Course
            },
            {
              path: '*',
              redirect: 'intro'
            }
          ]
        }
      ]
    },
    {
      path: '',
      component: Login
    },
    {
      path: '*', redirect: '/login'
    }
  ]
})
