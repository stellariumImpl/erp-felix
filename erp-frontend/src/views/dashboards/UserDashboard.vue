// views/dashboards/UserDashboard.vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">普通用户仪表盘</h1>
    <p>欢迎回来，{{ authStore.user?.username }}</p>
    <button
      @click="authStore.logout"
      class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      退出登录
    </button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../store/auth'
const authStore = useAuthStore()
</script>