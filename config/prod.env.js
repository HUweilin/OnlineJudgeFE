const merge = require('webpack-merge')
const devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"production"'
  // API_ROOT: '"//qduoj.com/api"'
})
