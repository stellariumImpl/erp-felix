// store/auth.js
import { defineStore } from 'pinia'
import { login, register, getCurrentUser } from '../api/auth'

import router from '../router'  // 直接导入 router

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    userId: (state) => state.user?.id || null
  },

  actions: {
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        const { data } = await login(credentials)
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败'
        return false
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      try {
        this.loading = true
        this.error = null
        await register(userData)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'  // 使用 window.location.href 替代 router.push
    }
  }
})