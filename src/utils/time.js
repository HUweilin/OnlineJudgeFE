import moment from 'moment'

// convert utc time to localtime
function utcToLocal (utcDt, format = 'YYYY-M-D  HH:mm:ss') {
  return moment.utc(utcDt).local().format(format)
}

// get duration from startTime to endTime, return like 3 days, 2 hours, one yead ..
function duration (startTime, endTime) {
  let start = moment(startTime)
  let end = moment(endTime)
  let duration = moment.duration(start.diff(end, 'seconds'), 'seconds')
  if (duration.days() !== 0) {
    return duration.humanize()
  }
  return Math.abs(duration.asHours().toFixed(1)) + ' hours'
}

function secondFormat (seconds) {
  let m = moment.duration(seconds, 'seconds')
  return m.hours() + ':' + m.minutes() + ':' + m.seconds()
}

// 后台添加课程或者课程单元时计算开始时间至结束时间的持续时间
function durationTime (startTime, endTime) {
  // moment的参数不能是'',否则会是NaN
  startTime = startTime || undefined
  endTime = endTime || undefined
  let start = moment(startTime)
  let end = moment(endTime)
  let diff = end.diff(start, 'seconds')
  if (diff < 0) {
    // 说明结束时间小于开始时间
    return false
  }
  // 相差时间
  let duration = moment.duration(diff, 'seconds')
  let day = duration.days()
  let hour = duration.hours()
  let min = duration.minutes()
  if (day === 0) {
    return hour + ' 小时 ' + min + ' 分 '
  } else {
    return day + ' 天 ' + hour + ' 小时 '
  }
}

export default {
  utcToLocal: utcToLocal,
  duration: duration,
  secondFormat: secondFormat,
  durationTime: durationTime
}
