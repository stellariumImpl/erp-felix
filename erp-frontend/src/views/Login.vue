// views/Login.vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center">登录</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">用户名</label>
          <input
            v-model="username"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">密码</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700">角色</label>
          <select
            v-model="role"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
            <option value="boss">Boss</option>
          </select>
        </div> -->
        <div v-if="authStore.error" class="text-red-500 text-sm">
          {{ authStore.error }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ authStore.loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <router-link
          to="/register"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          还没有账号？立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const role = ref('user')

const handleSubmit = async () => {
  const success = await authStore.login({
    username: username.value,
    password: password.value
    // role: role.value
  })
  
  if (success) {
    const roleRoutes = {
      user: '/user-dashboard',
      admin: '/admin-dashboard',
      boss: '/boss-dashboard'
    }
    router.push(roleRoutes[authStore.userRole])
  }
}

onMounted(() => {
  username.value = ''
  password.value = ''
  // role.value = 'user'
})
</script>