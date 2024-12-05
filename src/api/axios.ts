import axios, { InternalAxiosRequestConfig } from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  withCredentials: true,
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.url?.endsWith('/auth/login')) {
    const token = localStorage.getItem('token')
    config.headers['Authorization'] = 'Bearer ' + token
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  } else {
    delete config.headers['Content-Type']
  }

  return config
})

export default instance
