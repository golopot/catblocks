const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const baseConfig = require('./webpack.config.js')


module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  devtool: 'source-map',
})
