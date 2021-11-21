/* eslint-disable quotes */

module.exports = {
  configureWebpack: {
    plugins: []
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/assets/scss/argon.scss";`
      }
    },
    sourceMap: process.env.NODE_ENV !== 'production'
  }
}
