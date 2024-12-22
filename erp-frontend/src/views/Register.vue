// views/Register.vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center">注册</h2>
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
        <div>
          <label class="block text-sm font-medium text-gray-700">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
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
        </div>
        <div v-if="authStore.error" class="text-red-500 text-sm">
          {{ authStore.error }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading || !isPasswordValid"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ authStore.loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <router-link
          to="/login"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          已有账号？立即登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('user')

const isPasswordValid = computed(() => {
  return password.value && password.value === confirmPassword.value
})

const handleSubmit = async () => {
  if (!isPasswordValid.value) {
    authStore.error = '两次输入的密码不一致'
    return
  }

  const success = await authStore.register({
    username: username.value,
    password: password.value,
    role: role.value
  })
  
  if (success) {
    router.push('/login')
  }
}

onMounted(() => {
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  role.value = 'user'
})
</script>