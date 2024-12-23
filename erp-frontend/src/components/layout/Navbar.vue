// components/layout/Navbar.vue
<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- 左侧 Logo 区域 -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <span class="text-lg font-semibold text-gray-800">ERP System</span>
          </div>
        </div>

        <!-- 右侧按钮和用户信息区域 -->
        <div class="flex items-center gap-4">
          <!-- 创建工单按钮 -->
          <button
            @click="showWorkOrderModal = true"  
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            创建工单
          </button>

          <!-- 用户下拉菜单 -->
          <div class="relative">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon class="h-5 w-5 text-gray-500" />
              </div>
              <span class="ml-2 text-gray-700">{{ authStore.user?.username }}</span>
              <ChevronDownIcon class="ml-2 h-5 w-5 text-gray-400" />
            </button>

            <!-- 下拉菜单 -->
            <div
              v-if="isDropdownOpen"
              @click="isDropdownOpen = false"
              class="fixed inset-0 z-10"
            />
            <div
              v-show="isDropdownOpen"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
            >
              <div class="py-1">
                <a
                  href="#"
                  @click.prevent="handleProfile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  个人资料
                </a>
                <a
                  href="#"
                  @click.prevent="handleLogout"
                  class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  退出登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加 Modal -->
    <WorkOrderModal 
      :is-open="showWorkOrderModal"
      @close="showWorkOrderModal = false"
      @submit="handleWorkOrderSubmit"
    />
  </nav>


</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { PlusIcon, UserIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

import WorkOrderModal from '../workorder/WorkOrderModal.vue'

import { createWorkOrder } from '../../api/workOrder' 

const router = useRouter()
const authStore = useAuthStore()
const isDropdownOpen = ref(false)

const showWorkOrderModal = ref(false)  // add modal

// 处理工单提交
const handleWorkOrderSubmit = async (formData) => {
  try {
    // TODO: 调用 API 保存工单
    console.log('工单数据:', formData)
    showWorkOrderModal.value = false
  } catch (error) {
    console.error('保存工单失败:', error)
  }
}

// 处理创建工单
const handleCreateOrder = () => {
  // TODO: 实现创建工单逻辑
  console.log('Create order clicked')
}

// 处理查看个人资料
const handleProfile = () => {
  // TODO: 实现查看个人资料逻辑
  router.push('/profile')
}

// 处理退出登录
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}


</script>