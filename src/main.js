import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'

import './assets/iconfont/iconfont.css'
import './assets/font_home/iconfont.css'

import axios from 'axios'



axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('Token');
  //固定写法，必须return config
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false



new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
