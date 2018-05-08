import { mapState, mapGetters } from 'vuex'
import { SMALL_PROBLEM_STATUS } from '@/utils/constants'
export default {
  props: {
    problem: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      optionsArr: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
      SMALL_PROBLEM_STATUS: SMALL_PROBLEM_STATUS,
      // -1为未答题状态 0为正确 1为答错
      my_status: -1,
      courseID: '',
      unitID: '',
      routeName: '',
      loading: false
    }
  },
  methods: {
    setSomeParams () {
      // 获取课程id和单元id 若是在课程界面
      this.courseID = this.$route.params.courseID
      this.unitID = this.$route.params.unitID
      this.routeName = this.$route.name
      // 获取答题的状态
      this.my_status = (this.problem.my_status === null || this.problem.my_status === undefined) ? -1 : this.problem.my_status
    }
  },
  computed: {
    ...mapState({
      unit: state => state.course.unit
    }),
    ...mapGetters(['isAuthenticated', 'courseProblemSubmitDisabled'])
  }
}
