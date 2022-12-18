module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader')
      .options({
        inline: {
          keyword: 'svg-inline',
          strict: true
        },
        sprite: {
          keyword: 'svg-sprite',
          strict: true
        },
        addTitle: false,
        cloneAttributes: ['viewbox'],
        addAttributes: {
          role: 'presentation',
          focusable: false,
          tabindex: -1
        },
        dataAttributes: [],
        removeAttributes: ['alt', 'src'],
        transformImageAttributesToVueDirectives: true,
        md5: true,
        xhtml: false,
        svgo: {
          plugins: [
            {
              removeViewBox: false
            }
          ]
        },
        verbose: true
      })
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  }
}
