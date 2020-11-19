const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.base.js')
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')

module.exports = merge(baseConfig, {
  entry: {
    main: ['webpack/hot/poll?100', './src/main.ts'],
    cli: './src/cli.ts',
    'generate-openapi': './scripts/generate-openapi.ts',
  },
  mode: 'development',
  watch: true,
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  devtool: 'eval-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
})
