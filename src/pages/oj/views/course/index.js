const CourseDetail = () => import('./courseDetail.vue')
const CourseList = () => import('./courseList.vue')
const CourseUnitList = () => import('./children/courseUnitList.vue')
const UnitProblemList = () => import('./children/unitProblemList.vue')
export {
  CourseList,
  CourseDetail,
  CourseUnitList,
  UnitProblemList
}
