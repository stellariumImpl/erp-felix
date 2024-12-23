<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 背景遮罩 -->
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>

    <!-- Modal 内容 -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl relative">
        <!-- Modal 头部 -->
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-semibold">{{ editMode ? '编辑工单' : '创建工单' }}</h3>
        </div>

        <!-- Modal 表单内容 -->
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- 区域 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">区域</label>
              <select
                v-model="formData.area"
                required
                :disabled="areaLocked"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择区域</option>
                <option v-for="area in Object.keys(areaCarMapping)" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>
            </div>

            <!-- 行车 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">行车</label>
              <div class="relative">
                <input
                  v-model="craneSearchInput"
                  type="text"
                  required
                  @input="handleCraneInput"
                  @focus="showCraneSuggestions = true"
                  @blur="handleCraneBlur"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="输入行车编号"
                />
                <!-- 行车建议列表 -->
                <div
                  v-if="showCraneSuggestions && filteredCranes.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto"
                >
                  <ul class="py-1">
                    <li
                      v-for="crane in filteredCranes"
                      :key="crane"
                      @mousedown="selectCrane(crane)"
                      class="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {{ crane }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 原有的其他字段保持不变 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700">设备运行状况</label>
              <textarea
                v-model="formData.equipmentStatus"
                rows="3"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- 开始时间 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">开始时间</label>
              <input
                v-model="formData.startTime"
                type="datetime-local"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @input="calculateDuration"
              />
            </div>

            <!-- 结束时间 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">结束时间</label>
              <input
                v-model="formData.endTime"
                type="datetime-local"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @input="calculateDuration"
              />
            </div>

            <!-- 时长（自动计算） -->
            <div>
              <label class="block text-sm font-medium text-gray-700">时长（小时）</label>
              <input
                v-model="formData.duration"
                type="text"
                readonly
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
              />
            </div>

            <!-- 班次 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">班次</label>
              <select
                v-model="formData.shift"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择班次</option>
                <option value="早班">早班</option>
                <option value="晚班">晚班</option>
                <option value="早/晚">早/晚</option>
              </select>
            </div>

            <!-- 作业类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">作业类型</label>
              <select
                v-model="formData.workType"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择作业类型</option>
                <option value="type1">类型1</option>
                <option value="type2">类型2</option>
              </select>
            </div>

            <!-- 作业属性 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">作业属性</label>
              <select
                v-model="formData.workProperty"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择作业属性</option>
                <option value="property1">属性1</option>
                <option value="property2">属性2</option>
              </select>
            </div>

            <!-- 故障类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">故障类型</label>
              <select
                v-model="formData.faultType"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">请选择故障类型</option>
                <option value="fault1">故障1</option>
                <option value="fault2">故障2</option>
              </select>
            </div>

            <!-- 消耗备件 -->
            <div class="col-span-2 space-y-2">
              <label class="flex items-center">
                <input
                  v-model="formData.hasSpareParts"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm font-medium text-gray-700">是否消耗备件</span>
              </label>

              <div v-if="formData.hasSpareParts" class="flex items-center mt-4">
                <input
                  v-model="formData.sparePartsName"
                  type="text"
                  placeholder="请输入备件名称"
                  class="mr-2 w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />

                <input
                  v-model="formData.sparePartsSpecification"
                  type="text"
                  placeholder="请输入备件规格"
                  class="mr-2 w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />

                <input
                  v-model.number="formData.sparePartsQuantity"
                  type="number"
                  placeholder="请输入备件数量"
                  class="mr-2 w-44 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />

                <select
                  v-model="formData.sparePartsUnit"
                  class="w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">请选择单位</option>
                  <option value="米">米</option>
                  <option value="个">个</option>
                  <option value="件">件</option>
                  <option value="组">组</option>
                </select>
              </div>
            </div>

            <!-- 审批状态区域 -->
            <div class="col-span-2" v-if="editMode">
              <div class="border rounded-lg p-4 bg-gray-50">
                <h4 class="font-medium mb-2">审批信息</h4>

                <!-- 状态显示 -->
                <div class="flex items-center mb-4">
                  <span class="text-sm font-medium text-gray-700 mr-4">当前状态：</span>
                  <span
                    :class="[
    'px-2 py-1 text-sm rounded-full',
    formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : '',
    formData.status === 'success' ? 'bg-green-100 text-green-800' : '',
    formData.status === 'cancel' ? 'bg-red-100 text-red-800' : ''
  ]"
                  >
  {{ statusText }}
</span>
                </div>

                <!-- 审批操作区域 -->
                <div v-if="canApprove && formData.status === 'pending'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">审批意见</label>
                    <textarea
                      v-model="formData.approveComment"
                      rows="2"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="请输入审批意见（选填）"
                    ></textarea>
                  </div>

                  <div class="flex space-x-4" v-if="canApprove && formData.status === 'pending'">
                    <button
                      type="button"
                      :disabled="isSubmitting"
                      @click="handleApprove('success')"
                      class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ isSubmitting ? '处理中...' : '通过' }}
                    </button>
                    <button
                      type="button"
                      :disabled="isSubmitting"
                      @click="handleApprove('cancel')"
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ isSubmitting ? '处理中...' : '拒绝' }}
                    </button>
                  </div>
                </div>

                <!-- 审批结果显示 -->
                <div v-if="formData.status !== 'pending'" class="mt-2">
                  <p class="text-sm text-gray-600">
                    审批人：{{ formData.approver?.username || formData?.approver?.username || '-' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    审批时间：{{ formatDate(formData.approveTime) }}
                  </p>
                  <p class="text-sm text-gray-600" v-if="formData.approveComment">
                    审批意见：{{ formData.approveComment }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <textarea
                v-model="formData.remarks"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ isSubmitting ? '提交中...' : (editMode ? '保存' : '提交') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, watch, computed} from 'vue'
import {message} from 'ant-design-vue';

import axios from 'axios';
import {useAuthStore} from '../../store/auth'

import {createWorkOrder, updateWorkOrder} from '../../api/workOrder';

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'submit'])


import { useCraneMappingStore } from '../../store/craneMapping'
import {storeToRefs} from "pinia";

const craneMappingStore = useCraneMappingStore()

// 直接使用 store 中的映射
const { areaCarMapping, carToAreaMapping } = storeToRefs(craneMappingStore)

const isSubmitting = ref(false)
const areaLocked = ref(false)
const craneSearchInput = ref('')
const showCraneSuggestions = ref(false)

// const formData = reactive({
//   area: '',
//   crane: '',
//   equipmentStatus: '',
//   startTime: '',
//   endTime: '',
//   duration: '',
//   shift: '',
//   workType: '',
//   workProperty: '',
//   faultType: '',
//   hasSpareParts: false,
//   sparePartsName: '',
//   remarks: ''
// })

const formData = reactive({
  area: '',
  crane: '',
  equipmentStatus: '',
  startTime: '',
  endTime: '',
  duration: '',
  shift: '',
  workType: '',
  workProperty: '',
  faultType: '',
  hasSpareParts: false,
  sparePartsName: '',
  sparePartsSpecification: '',
  sparePartsUnit: '',
  sparePartsQuantity: 0,
  remarks: '',
  status: 'pending', // 新增状态字段，默认为待审批
  approveComment: '',  // 审批意见
  approver: null,      // 审批人
  approveTime: null    // 审批时间
});

// 过滤行车列表
const filteredCranes = computed(() => {
  console.log('craneSearchInput:', craneSearchInput.value)
  const searchTerm = craneSearchInput.value?.toLowerCase() || ''
  let availableCranes = []

  if (formData.area) {
    console.log('当前选择区域:', formData.area)
    // 从 store 中获取映射
    const mapping = craneMappingStore.areaCarMapping
    console.log('区域映射:', mapping)
    availableCranes = mapping[formData.area] || []
    console.log('可用行车:', availableCranes)
  }

  return availableCranes.filter(crane => {
    // 添加空值检查
    if (!crane) return false
    // 确保 crane 是字符串
    const craneStr = String(crane)
    return craneStr.toLowerCase().includes(searchTerm)
  })
})

// 处理行车输入
const handleCraneInput = () => {
  console.log('行车输入:', craneSearchInput.value)
  formData.crane = craneSearchInput.value

  // 从 store 中获取映射
  const carToAreaMap = craneMappingStore.carToAreaMapping
  if (carToAreaMap[craneSearchInput.value]) {
    const area = carToAreaMap[craneSearchInput.value]
    formData.area = area
    areaLocked.value = true
  } else {
    areaLocked.value = false
  }
}

// 选择行车
const selectCrane = (crane) => {
  craneSearchInput.value = crane
  formData.crane = crane
  showCraneSuggestions.value = false

  if (carToAreaMapping[crane]) {
    formData.area = carToAreaMapping[crane]
    areaLocked.value = true
  }
}

// 处理行车输入框失焦
const handleCraneBlur = () => {
  setTimeout(() => {
    showCraneSuggestions.value = false
  }, 200)
}

// 监听区域变化
watch(() => formData.area, (newArea) => {
  if (!areaLocked.value) {
    craneSearchInput.value = ''
    formData.crane = ''
  }
})

// 编辑模式的数据加载
watch(() => props.initialData, (newData) => {
  if (props.editMode && newData) {
    const formatDateTime = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toISOString().slice(0, 16)
    }

    Object.assign(formData, {
      ...newData,
      startTime: formatDateTime(newData.startTime),
      endTime: formatDateTime(newData.endTime)
    })
    craneSearchInput.value = newData.crane || ''
    if (carToAreaMapping[newData.crane]) {
      areaLocked.value = true
    }
  } else {
    Object.keys(formData).forEach(key => {
      formData[key] = typeof formData[key] === 'boolean' ? false : ''
    })
    craneSearchInput.value = ''
    areaLocked.value = false
  }
}, {immediate: true})

// 计算工时
const calculateDuration = () => {
  if (formData.startTime && formData.endTime) {
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    const diff = end - start
    formData.duration = (diff / (1000 * 60 * 60)).toFixed(2)
  }
}

const handleSparePartsFields = () => {
  if (!formData.hasSpareParts) {
    return {
      sparePartsName: undefined,
      sparePartsSpecification: undefined,
      sparePartsUnit: undefined,
      sparePartsQuantity: undefined
    };
  }
  return {
    sparePartsName: formData.sparePartsName,
    sparePartsSpecification: formData.sparePartsSpecification,
    sparePartsUnit: formData.sparePartsUnit,
    sparePartsQuantity: formData.sparePartsQuantity
  };
};

const authStore = useAuthStore()

// 状态文字映射
const statusText = computed(() => ({
  pending: '待审批',
  success: '已通过',
  cancel: '已拒绝'
}[formData.status]))

// 在组件中添加权限检查
const canApprove = computed(() => {
  const {userRole} = authStore;
  return ['admin', 'boss'].includes(userRole);
});

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 处理审批
const handleApprove = async (status) => {
  if (isSubmitting.value) {
    message.warning('正在处理中，请勿重复点击');
    return;
  }

  try {
    isSubmitting.value = true;
    const orderId = props.initialData._id;

    const response = await axios.put(
      `/api/workorders/${orderId}/approve`,
      {
        status,
        approveComment: formData.approveComment || ''
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data) {
      // 更新本地数据状态
      Object.assign(formData, response.data);
      message.success(`审批${status === 'success' ? '通过' : '拒绝'}成功`);

      // 通知父组件更新列表
      emit('refresh'); // 确保父组件有这个方法来刷新列表
      emit('close'); // 关闭模态框
    }
  } catch (error) {
    console.error('审批失败:', error);
    const errorMsg = error.response?.data?.message || '审批失败，请重试';
    message.error(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};


const handleSubmit = async () => {
  try {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    const submitData = {...formData};
    const url = props.editMode
      ? `/api/workorders/${props.initialData._id}`
      : '/api/workorders';

    const method = props.editMode ? 'PUT' : 'POST';

    const response = await axios({
      method,
      url,
      data: submitData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    message.success(props.editMode ? '更新成功' : '创建成功');

    emit('submit');
    emit('close');
  } catch (error) {
    console.error('操作失败:', error);
    message.error(error.response?.data?.message || '操作失败');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close')
}
</script>