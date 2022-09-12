module.exports = {
  publicPath: './',
  productionSourceMap: false,
  devServer:{
    proxy: {
      '/api': {
        target: 'http://124.221.63.19:3000',
        chageOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
    }
  }
}
