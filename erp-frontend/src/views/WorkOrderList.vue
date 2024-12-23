// views/WorkOrderList.vue
<template>
  <div class="p-6">
    <!-- 顶部操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">工单列表</h2>
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索..."
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="filterArea"
          class="pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部区域</option>
          <option value="区域1">区域1</option>
          <option value="区域2">区域2</option>
        </select>
      </div>
    </div>

    <!-- 工单 Modal -->
    <WorkOrderModal
      :is-open="showModal"
      :edit-mode="isEditMode"
      :initial-data="editingOrder"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />

    <!-- 工单表格 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">区域</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">行车</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备状况</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时长(小时)</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建人</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后修改</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in displayWorkOrders" :key="order._id">
            <td class="px-6 py-4 whitespace-nowrap">{{ order.area || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ order.crane || '-' }}</td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ order.equipmentStatus || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(order.startTime) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ order.duration || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ order.creator?.username || '-' }}</div>
              <div class="text-xs text-gray-500">{{ order.creator?.role || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ order.lastModifiedBy?.username || '-' }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(order.lastModifiedAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                v-if="canEdit(order)"
                @click="handleEdit(order)"
                class="text-blue-600 hover:text-blue-900 mr-2"
              >
                编辑
              </button>
              <button
                v-if="canDelete(order)"
                @click="confirmDelete(order)"
                class="text-red-600 hover:text-red-900"
              >
                删除
              </button>
            </td>
          </tr>
          <!-- 无数据时显示 -->
          <tr v-if="displayWorkOrders.length === 0">
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage > 1 && (currentPage--)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            @click="currentPage < totalPages && (currentPage++)"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示第 <span class="font-medium">{{ startIndex + 1 }}</span> 到 
              <span class="font-medium">{{ Math.min(endIndex, totalItems) }}</span> 条，
              共 <span class="font-medium">{{ totalItems }}</span> 条
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="currentPage > 1 && (currentPage--)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                上一页
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                @click="currentPage < totalPages && (currentPage++)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '../store/auth'
import { getWorkOrders, deleteWorkOrder,updateWorkOrder } from '../api/workOrder'

import WorkOrderModal from '../components/workorder/WorkOrderModal.vue'

const authStore = useAuthStore()
const workOrders = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const searchQuery = ref('')
const filterArea = ref('')
const pageSize = 10

// 计算属性：显示的工单列表
const displayWorkOrders = computed(() => {
  if (!workOrders.value) return []
  
  return workOrders.value
    .filter(order => {
      if (!searchQuery.value) return true
      
      const searchLower = searchQuery.value.toLowerCase()
      return (
        order.area?.toLowerCase().includes(searchLower) ||
        order.crane?.toLowerCase().includes(searchLower) ||
        order.equipmentStatus?.toLowerCase().includes(searchLower)
      )
    })
    .map(order => ({
      ...order,
      creator: order.creator || {},
      lastModifiedBy: order.lastModifiedBy || {}
    }))
})

// 计算分页信息
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const endIndex = computed(() => startIndex.value + pageSize)

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 权限检查
// 在 WorkOrderList.vue 中修改权限检查函数
const canEdit = (order) => {
  const { userRole, user } = authStore
  
  if (!order || !user) return false

  // boss可以编辑任何工单
  if (userRole === 'boss') return true
  
  // admin可以编辑自己的和普通用户的工单
  if (userRole === 'admin') {
    return order.creator._id === user.id || order.creator.role === 'user'
  }
  
  // 普通用户只能编辑自己的工单
  return userRole === 'user' && order.creator._id === user.id
}

const canDelete = (order) => {
  return canEdit(order) // 使用相同的权限逻辑
}

// 获取工单列表
// 移除对工单列表的筛选，允许所有用户查看所有工单
const fetchWorkOrders = async () => {
  try {
    const response = await getWorkOrders({
      page: currentPage.value,
      limit: 10,
      area: filterArea.value || undefined
    })
    workOrders.value = response.data.workOrders
    totalPages.value = response.data.totalPages
    totalItems.value = response.data.total
  } catch (error) {
    console.error('获取工单列表失败:', error)
  }
}

// 删除工单
const confirmDelete = async (order) => {
  if (!order || !order._id) {
    console.error('Invalid order:', order)
    return
  }

  if (confirm('确定要删除这个工单吗？')) {
    try {
      await deleteWorkOrder(order._id)
      await fetchWorkOrders() // 重新加载列表
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

// 编辑工单
const editOrder = (order) => {
  // TODO: 实现编辑功能
  console.log('编辑工单:', order)
}

// 监听筛选条件变化
watch([filterArea, currentPage], () => {
  fetchWorkOrders()
})

// 监听搜索条件变化（使用防抖）
let searchTimeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchWorkOrders()
  }, 300)
})

// 初始加载
onMounted(() => {
  fetchWorkOrders()
})





const showModal = ref(false)
const editingOrder = ref(null)
const isEditMode = ref(false)

const handleEdit = (order) => {
  editingOrder.value = order
  isEditMode.value = true
  showModal.value = true
}

const handleModalClose = () => {
  showModal.value = false
  editingOrder.value = null
  isEditMode.value = false
}

const handleModalSubmit = async (formData) => {
  try {
    if (editingOrder.value) {
      // 编辑模式
      await updateWorkOrder(editingOrder.value._id, formData)
    } else {
      // 创建模式
      await createWorkOrder(formData)
    }
    await fetchWorkOrders() // 刷新列表
    isEditMode.value = false
    editingOrder.value = null
    showModal.value = false
  } catch (error) {
    console.error('操作失败:', error)
    alert('操作失败: ' + (error.response?.data?.message || '未知错误'))
  }
}
</script>
