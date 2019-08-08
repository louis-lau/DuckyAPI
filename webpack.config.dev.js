const merge = require("webpack-merge")
const baseConfig = require("./webpack.config.base.js")
const nodeExternals = require("webpack-node-externals")
const webpack = require("webpack")

module.exports = merge(baseConfig, {
  entry: ["webpack/hot/poll?100"],
  mode: "development",
  watch: true,
  externals: [
    nodeExternals({
      whitelist: ["webpack/hot/poll?100"]
    })
  ],
  devtool: "eval-source-map",
  plugins: [new webpack.HotModuleReplacementPlugin()]
})
