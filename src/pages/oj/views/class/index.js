const ExaminationList = () => import('./examinationList.vue')
const ExaminationDetail = () => import('./examinationDetail.vue')
const ExaminationProblemList = () => import('./children/examinationProblemList.vue')
const Problem = () => import('./children/problem.vue')
const Rank = () => import('./children/rank.vue')
export {
  ExaminationList,
  ExaminationDetail,
  ExaminationProblemList,
  Problem,
  Rank
}
