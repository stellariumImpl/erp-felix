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
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue';

import axios from 'axios';


const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'submit'])

// 区域和行车的映射关系
const areaCarMapping = {
  '区域1': ['1', '2', '3', '4'],
  '区域2': ['5', '6', '7', '8']
}

// 创建反向映射（根据行车找区域）
const carToAreaMapping = Object.entries(areaCarMapping).reduce((acc, [area, cars]) => {
  cars.forEach(car => {
    acc[car] = area
  })
  return acc
}, {})

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
  remarks: ''
});

// 过滤行车列表
const filteredCranes = computed(() => {
  const searchTerm = craneSearchInput.value.toLowerCase()
  let availableCranes = []
  
  if (formData.area) {
    availableCranes = areaCarMapping[formData.area] || []
  } else {
    availableCranes = Object.values(areaCarMapping).flat()
  }
  
  return availableCranes.filter(crane => 
    crane.toLowerCase().includes(searchTerm)
  )
})

// 处理行车输入
const handleCraneInput = () => {
  formData.crane = craneSearchInput.value
  if (carToAreaMapping[craneSearchInput.value]) {
    const area = carToAreaMapping[craneSearchInput.value]
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
}, { immediate: true })

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

const handleSubmit = async () => {
  try {
    // 验证时长不能为负
    if (formData.duration < 0) {
      message.error('时长不能为负');
      return;
    }

    // 验证备件数量不能为负
    if (formData.hasSpareParts && formData.sparePartsQuantity < 0) {
      message.error('备件数量不能为负');
      return;
    }

    isSubmitting.value = true;
    const payload = {
      ...formData,
      ...handleSparePartsFields()
    };
    emit('submit', payload);
    closeModal();
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close')
}
</script>