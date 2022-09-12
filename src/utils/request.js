// 封装axios
import axios from 'axios'
import { Message } from 'element-ui'
import { startLoading, endLoading } from './Loading'

let baseURL = ""

if (process.env.NODE_ENV == "development") {
  // baseURL = 'http://localhost:3000'
  baseURL = 'http://124.221.63.19:3000'
  // baseURL = 'https://netease-cloud-music-api-lemon-chi.vercel.app'
} else {
  baseURL = 'http://124.221.63.19:3000'
  // baseURL = 'http://duoduozuikeail.top:3000'
  // baseURL = 'https://netease-cloud-music-api-lemon-chi.vercel.app'
}

const instance = axios.create({
  baseURL,
  timeout: 5000
})

instance.interceptors.response.use(
  response => {
    if (response.status == 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  error => {
    error && Message({
      type: 'error',
      message: '网络连接出问题了~',
      showClose: true
    })
  }
)

export default instance

// 下载音乐
export function downloadMusic (config) {
  const instance = axios.create({
    timeout: 30000,
    responseType: "blob",
  });

  // 请求拦截
  instance.interceptors.request.use(
    config => {
      startLoading("准备下载...");
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // 响应拦截
  instance.interceptors.response.use(
    response => {
      endLoading();
      return response;
    },
    error => {
      endLoading();
      return Promise.reject(error);
    }
  );
  return instance(config);
}
