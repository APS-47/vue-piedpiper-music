import Vue from 'vue'
import App from './App.vue'
import ElementUI from "element-ui"
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import store from './store'
import Vuelazyload from 'vue-lazyload'
import "./assets/icon/iconfont.css"

Vue.config.productionTip = false

Vue.use(ElementUI)
// 使用懒加载
Vue.use(Vuelazyload,{
  preLoad:1.3,
  loading: require('./assets/imgs/loading.png'),
  attempt:2
})


console.info(`%c
欢迎使用Pied Piper音乐网站！
作者：潘烁
GitHub：
歌曲来源于网易云音乐(https://music.163.com)`,`color:#2980b9`)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
