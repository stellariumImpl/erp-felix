// src/api/auth.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const register = (userData) => {
  return api.post('/auth/register', userData)
}

export const getCurrentUser = () => {
  return api.get('/auth/me')
}