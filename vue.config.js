module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack: config => {
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.0.110:3000'
      },
      '/streams': {
        target: 'http://192.168.0.110:8887/api'
      },
      '/live': {
        target: 'http://192.168.0.110:8888'
      }
    }
  }
}
