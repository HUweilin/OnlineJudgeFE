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
        // 创建竞赛题目路由
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
          path: '/course/:courseId',
          component: Course.CourseHome,
          children: [
            // 课程简介路由
            {
              path: '',
              name: 'course-intro',
              component: Course.CourseIntro
            },
            // 课程公告路由
            {
              path: 'announcement',
              name: 'course-announcement',
              component: Course.Announcement
            },
            // 课程成员路由
            {
              path: 'member',
              name: 'course-member',
              component: Course.Member
            },
            // 课程单元列表
            {
              path: 'units',
              name: 'course-unit-list',
              component: Course.UnitList
            },
            // 课程单元的题目列表
            {
              path: 'unit/:taskId/problems',
              name: 'course-unit-problem-list',
              component: Course.UnitProblemList
            },
            // 创建课程单元的编程题题目
            {
              path: 'unit/:taskId/problem/create',
              name: 'create-unit-problem',
              component: Problem
            },
            // 修改课程单元的编程题题目
            {
              path: 'unit/:taskId/problem/:problemId/edit',
              name: 'edit-course-unit-problem',
              component: Problem
            },
            // 创建课程单元的小题题目
            {
              path: 'unit/:taskId/sm-problem/create',
              name: 'create-unit-small-problem',
              component: smProblem
            },
            // 修改课程单元的小题题目
            {
              path: 'unit/:taskId/sm-problem/:problemId/edit',
              name: 'edit-unit-small-problem',
              component: smProblem
            },
            // 课程设置路由
            {
              path: 'setting',
              name: 'course-setting',
              component: Course.Course
            },
            {
              path: '*',
              redirect: {name: 'course-intro'}
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
