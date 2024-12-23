// components/layout/Sidebar.vue
<template>
  <div class="w-64 bg-white shadow-sm min-h-screen">
    <nav class="mt-5 px-2">
      <router-link
        to="/workorder-list"
        class="group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[
          $route.path === '/workorder-list'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
      >
        <DocumentTextIcon class="mr-3 h-6 w-6 text-gray-400" />
        工单列表
      </router-link>

      <router-link
        v-if="['admin', 'boss'].includes(authStore.userRole)"
        to="/user-management"
        class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md"
        :class="[
          $route.path === '/user-management'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
      >
        <UserGroupIcon class="mr-3 h-6 w-6 text-gray-400" />
        用户管理
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { DocumentTextIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
</script>