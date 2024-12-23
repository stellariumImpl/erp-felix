// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
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
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'admin-dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/dashboards/AdminDashboard.vue'),
        meta: { role: 'admin' }
      },
      {
        path: 'boss-dashboard',
        name: 'BossDashboard',
        component: () => import('../views/dashboards/BossDashboard.vue'),
        meta: { role: 'boss' }
      },
      {
        path: 'user-dashboard',
        name: 'UserDashboard',
        component: () => import('../views/dashboards/UserDashboard.vue'),
        meta: { role: 'user' }
      },
      {
        path: 'workorder-list',
        name: 'WorkOrderList',
        component: () => import('../views/WorkOrderList.vue')
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { roles: ['admin', 'boss'] }
      },
      {
        path: '/crane-config',
        name: 'CraneConfig',
        component: () => import('../views/CraneConfigView.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin', 'boss']
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const roleRoutes = {
      user: '/user-dashboard',
      admin: '/admin-dashboard',
      boss: '/boss-dashboard'
    }
    return next(roleRoutes[authStore.userRole])
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  if (to.meta.role && to.meta.role !== authStore.userRole) {
    const roleRoutes = {
      user: '/user-dashboard',
      admin: '/admin-dashboard',
      boss: '/boss-dashboard'
    }
    return next(roleRoutes[authStore.userRole])
  }
  
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    return next('/')
  }
  
  next()
})

export default router