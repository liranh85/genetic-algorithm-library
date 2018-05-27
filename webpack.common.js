const path = require('path')
const cleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    main: [
      'idempotent-babel-polyfill',
      path.join(__dirname, 'src', 'index.js')
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    library: 'genetic-lib',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new cleanWebpackPlugin('dist', {})
  ]
}