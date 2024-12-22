// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: (to) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return '/login'
      
      // 根据角色重定向到对应的仪表盘
      const roleRoutes = {
        user: '/user-dashboard',
        admin: '/admin-dashboard',
        boss: '/boss-dashboard'
      }
      return roleRoutes[authStore.userRole] || '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/user-dashboard',
    name: 'UserDashboard',
    component: () => import('../views/dashboards/UserDashboard.vue'),
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/dashboards/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/boss-dashboard',
    name: 'BossDashboard',
    component: () => import('../views/dashboards/BossDashboard.vue'),
    meta: { requiresAuth: true, role: 'boss' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 如果是访问登录或注册页面
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // 如果已登录，重定向到对应的仪表盘
      const roleRoutes = {
        user: '/user-dashboard',
        admin: '/admin-dashboard',
        boss: '/boss-dashboard'
      }
      return next(roleRoutes[authStore.userRole])
    }
    return next()
  }

  // 如果需要认证的页面
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login')
    }
    // 检查角色权限
    if (to.meta.role && to.meta.role !== authStore.userRole) {
      const roleRoutes = {
        user: '/user-dashboard',
        admin: '/admin-dashboard',
        boss: '/boss-dashboard'
      }
      return next(roleRoutes[authStore.userRole])
    }
    return next()
  }

  // 其他情况
  next()
})

export default router