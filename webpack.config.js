const path = require('path')

module.exports = {
  entry: './frontend/js/main.js',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.min.js'
  },
  mode: 'production'
}
