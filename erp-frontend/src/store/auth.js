// src/store/auth.js
import { defineStore } from 'pinia'
import { login, register, getCurrentUser } from '../api/auth'
import router from '../router' // 直接导入 router 实例

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        // 移除发送的 role
        const { data } = await login({
          username: credentials.username,
          password: credentials.password
        })
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
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

    async fetchCurrentUser() {
      try {
        const { data } = await getCurrentUser()
        this.user = data
        return true
      } catch (error) {
        return false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      this.loading = false
      localStorage.removeItem('token')
      router.push('/login') // 使用导入的 router 实例
    }
  }
})