// src/api/workOrder.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,  // 添加超时设置
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

// 添加响应拦截器处理错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      console.error('Network Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const createWorkOrder = (workOrderData) => {
  return api.post('/workorders', workOrderData)
}

export const getWorkOrders = (params) => {
  console.log('请求参数:', params)  // 添加调试日志
  return api.get('/workorders', { params })
}

// api/workOrder.js
export const deleteWorkOrder = (id) => {
  return api.delete(`/workorders/${id}`)
}

// api/workOrder.js
export const updateWorkOrder = (id, data) => {
  return api.put(`/workorders/${id}`, data)
}

