const Course = () => import('./course.vue')
const CourseList = () => import('./courseList.vue')
const Announcement = () => import('./children/announcement.vue')
const CourseHome = () => import('./children/courseHome.vue')
const CourseIntro = () => import('./children/courseIntro.vue')
const Member = () => import('./children/member.vue')
const UnitList = () => import('./children/unitList.vue')
const UnitProblemList = () => import('./children/unitProblemList.vue')
// const UnitProblem = () => import('./children/unitProblem.vue')

export {Course, CourseList, Announcement, CourseHome, CourseIntro, Member, UnitList, UnitProblemList}
