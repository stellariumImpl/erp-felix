// views/UserManagement.vue
<template>
  <div class="flex min-h-screen">
   

    <!-- 右侧内容区域 -->
    <div class="flex-1 min-w-0">
      <div class="p-6">
        <div class="flex justify-between mb-6">
          <h2 class="text-2xl font-bold">用户管理</h2>
        </div>

        <!-- 用户列表 -->
        <div class="space-y-4">
          <div v-for="user in users" :key="user._id" class="bg-white rounded-lg shadow">
            <!-- 用户信息头部 -->
            <div class="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-t-lg">
              <div class="flex items-center space-x-4">
                <span class="font-medium text-lg">{{ user.username }}</span>
                <span 
                  class="px-3 py-1 rounded-full text-sm"
                  :class="{
                    'bg-green-100 text-green-800': user.role === 'user',
                    'bg-blue-100 text-blue-800': user.role === 'admin',
                    'bg-purple-100 text-purple-800': user.role === 'boss'
                  }"
                >
                  {{ user.role }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <button
                  @click="exportUserData(user._id, user.username)"
                  class="px-3 py-1 text-blue-600 hover:text-blue-800"
                >
                  导出工单
                </button>
                <button
                  @click="toggleUserExpand(user._id)"
                  class="p-2 hover:bg-gray-100 rounded-full"
                >
                  <span
                    class="transform transition-transform inline-block"
                    :class="{ 'rotate-180': expandedUsers.includes(user._id) }"
                  >
                    ▼
                  </span>
                </button>
              </div>
            </div>

            <!-- 工单列表 -->
            <div v-show="expandedUsers.includes(user._id)" class="overflow-x-auto">
              <div class="min-w-[1000px]">
                <table class="w-full divide-y divide-gray-200 table-fixed">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">区域</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">行车</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">设备状况</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">开始时间</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">结束时间</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">时长</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">班次</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">作业类型</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">作业属性</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">状态</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="order in userWorkOrders[user._id]" :key="order._id" class="hover:bg-gray-50">
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.area }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.crane }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.equipmentStatus }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ formatDate(order.startTime) }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ formatDate(order.endTime) }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.duration }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.shift }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.workType }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="truncate">{{ order.workProperty }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <span 
                          class="px-2 py-1 rounded-full text-xs inline-block w-16 text-center truncate"
                          :class="{
                            'bg-yellow-100 text-yellow-800': order.status === 'pending',
                            'bg-green-100 text-green-800': order.status === 'success',
                            'bg-red-100 text-red-800': order.status === 'cancel'
                          }"
                        >
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="!userWorkOrders[user._id]?.length">
                      <td colspan="10" class="px-4 py-8 text-center text-gray-500">
                        暂无工单记录
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import * as XLSX from 'xlsx'

const authStore = useAuthStore()
const users = ref([])
const expandedUsers = ref([])
const userWorkOrders = reactive({})  // 使用对象存储每个用户的工单

// 日期格式化函数
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    users.value = data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取用户工单
const fetchUserWorkOrders = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/workorders`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    userWorkOrders[userId] = data
  } catch (error) {
    console.error('获取用户工单失败:', error)
  }
}

// 切换展开状态
const toggleUserExpand = async (userId) => {
  const index = expandedUsers.value.indexOf(userId)
  if (index === -1) {
    expandedUsers.value.push(userId)
    if (!userWorkOrders[userId]) {
      await fetchUserWorkOrders(userId)
    }
  } else {
    expandedUsers.value.splice(index, 1)
  }
}

// 导出单个用户的工单
const exportUserData = async (userId, username) => {
  try {
    const response = await fetch(`/api/users/${userId}/workorders/export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const workOrders = await response.json();
    
    const exportData = workOrders.map(order => ({
      '区域': order.区域 || order.area || '',
      '行车': order.行车 || order.crane || '',
      '设备状况': order.设备状况 || order.equipmentStatus || '',
      '开始时间': order.开始时间 || order.startTime || '',
      '结束时间': order.结束时间 || order.endTime || '',
      '时长(小时)': order.时长 || order.duration || '',
      '班次': order.班次 || order.shift || '',
      '作业类型': order.作业类型 || order.workType || '',
      '作业属性': order.作业属性 || order.workProperty || '',
      '故障类型': order.故障类型 || order.faultType || '',
      '是否消耗备件': order.是否消耗备件 || order.hasSpareParts ? '是' : '否',
      '备件名称': order.备件名称 || order.sparePartsName || '',
      '备件规格': order.备件规格 || order.sparePartsSpecification || '',
      '备件数量': order.备件数量 || order.sparePartsQuantity || '',
      '备件单位': order.备件单位 || order.sparePartsUnit || '',
      '状态': order.状态 || order.status || '',
      '创建人': order.创建人 || (order.creator?.username) || '',
      '备注': order.备注 || order.remarks || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    ws['!cols'] = [
      { wch: 10 }, // 区域
      { wch: 10 }, // 行车
      { wch: 30 }, // 设备状况
      { wch: 20 }, // 开始时间
      { wch: 20 }, // 结束时间
      { wch: 10 }, // 时长
      { wch: 8 },  // 班次
      { wch: 12 }, // 作业类型
      { wch: 12 }, // 作业属性
      { wch: 12 }, // 故障类型
      { wch: 12 }, // 是否消耗备件
      { wch: 15 }, // 备件名称
      { wch: 10 }, // 状态
      { wch: 10 }, // 创建人
      { wch: 30 }  // 备注
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${username}的工单`);
    XLSX.writeFile(wb, `${username}工单报表.xlsx`);

  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败: ' + error.message);
  }
};

onMounted(() => {
  fetchUsers()
})
</script>