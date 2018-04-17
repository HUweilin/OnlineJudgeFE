export const JUDGE_STATUS = {
  '-2': {
    name: 'Compile Error',
    short: 'CE',
    color: 'yellow',
    type: 'warning'
  },
  '-1': {
    name: 'Wrong Answer',
    short: 'WA',
    color: 'red',
    type: 'error'
  },
  '0': {
    name: 'Accepted',
    short: 'AC',
    color: 'green',
    type: 'success'
  },
  '1': {
    name: 'Time Limit Exceeded',
    short: 'TLE',
    color: 'red',
    type: 'error'
  },
  '2': {
    name: 'Time Limit Exceeded',
    short: 'TLE',
    color: 'red',
    type: 'error'
  },
  '3': {
    name: 'Memory Limit Exceeded',
    short: 'MLE',
    color: 'red',
    type: 'error'
  },
  '4': {
    name: 'Runtime Error',
    short: 'RE',
    color: 'red',
    type: 'error'
  },
  '5': {
    name: 'System Error',
    short: 'SE',
    color: 'red',
    type: 'error'
  },
  '6': {
    name: 'Pending',
    color: 'yellow',
    type: 'warning'
  },
  '7': {
    name: 'Judging',
    color: 'blue',
    type: 'info'
  },
  '8': {
    name: 'Partial Accepted',
    short: 'PAC',
    color: 'blue',
    type: 'info'
  },
  '9': {
    name: 'Submitting',
    color: 'yellow',
    type: 'warning'
  }
}
export const SUBMISSION_LANGUAGE = {
  '0': 'C++',
  '1': 'C',
  '2': 'Java',
  '3': 'Python2',
  '4': 'Python3'
}
export const CONTEST_STATUS = {
  'NOT_START': '1',
  'UNDERWAY': '0',
  'ENDED': '-1'
}

export const CONTEST_STATUS_REVERSE = {
  '1': {
    name: '等待',
    color: 'yellow'
  },
  '0': {
    name: '进行中',
    color: 'green'
  },
  '-1': {
    name: '已结束',
    color: 'red'
  }
}

export const EXAMINATION_STATUS = {
  'NOT_START': '1',
  'UNDERWAY': '0',
  'ENDED': '-1'
}

export const EXAMINATION_STATUS_REVERSE = {
  '1': {
    name: '等待',
    color: 'yellow'
  },
  '0': {
    name: '进行中',
    color: 'green'
  },
  '-1': {
    name: '已结束',
    color: 'red'
  }
}

// 小题的回答情况 -1: 未回答 0: 回答正确 1: 回答错误
export const SMALL_PROBLEM_STATUS = {
  'NOT_ANSWER': -1,
  'RIGHT': 0,
  'ERROR': 1
}

// 小题类型 Single单选题 Multiple为多选题 Blank为填空题
export const SMALL_PROBLEM_TYPE = {
  Single: 'Single',
  Multiple: 'Multiple',
  Blank: 'Blank'
}

export const RULE_TYPE = {
  ACM: 'ACM',
  OI: 'OI'
}

export const CONTEST_TYPE = {
  PUBLIC: 'Public',
  PRIVATE: 'Password Protected'
}

export const EXAMINATION_TYPE = {
  PBULIC: 'public',
  PRIVATE: 'Password Protected'
}

export const USER_TYPE = {
  REGULAR_USER: 'Regular User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin'
}

export const PROBLEM_PERMISSION = {
  NONE: 'None',
  OWN: 'Own',
  ALL: 'All'
}

export const STORAGE_KEY = {
  AUTHED: 'authed',
  PROBLEM_CODE: 'problemCode',
  languages: 'languages'
}

export function buildProblemCodeKey (problemID, contestID = null) {
  if (contestID) {
    return `${STORAGE_KEY.PROBLEM_CODE}_${contestID}_${problemID}`
  }
  return `${STORAGE_KEY.PROBLEM_CODE}_NaN_${problemID}`
}

export function buildTestProblemCodeKey (problemID, testID) {
  return `${STORAGE_KEY.PROBLEM_CODE}_${testID}_${problemID}`
}

export function buildHomeworkProblemCodeKey (problemID, homeworkID) {
  return `${STORAGE_KEY.PROBLEM_CODE}_${homeworkID}_${problemID}`
}
