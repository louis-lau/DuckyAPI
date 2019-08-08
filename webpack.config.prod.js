const merge = require("webpack-merge")
const baseConfig = require("./webpack.config.base.js")
const nodeExternals = require("webpack-node-externals")

module.exports = merge(baseConfig, {
  mode: "production",
  optimization: {
    minimize: false
  },
  externals: [nodeExternals()]
})
