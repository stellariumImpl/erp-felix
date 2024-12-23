// api/user.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getAllUsers = () => {
  return api.get('/users')
}

export const getUserWorkOrders = (userId) => {
  return api.get(`/users/${userId}/workorders`)
}

export const exportUserOrders = (userId) => {
  return api.get(`/users/${userId}/workorders/export`)
}

export const exportAllOrders = () => {
  return api.get('/workorders/export')
}