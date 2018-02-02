let date = require('moment')().format('YYYYMMDD')
let commit = require('child_process').execSync('git rev-parse HEAD').toString().slice(0, 5)
let version = `"${date}-${commit}"`

console.log(`current version is ${version}`)

module.exports = {
  NODE_ENV: '"development"',
  VERSION: version,
  // TARGET: '"//192.168.1.139:8000/"',
  USE_SENTRY: '0'
}
