<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold">行车运用表配置</h2>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- 文件上传区域 -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <div class="flex flex-col items-center justify-center pt-7">
              <ArrowUpTrayIcon class="w-8 h-8 text-gray-400" />
              <p class="pt-1 text-sm text-gray-600">点击或拖拽文件到这里上传</p>
              <p class="text-xs text-gray-500">支持 .xlsx, .xls 格式</p>
            </div>
            <input
              type="file"
              @change="handleFileUpload"
              @drop.prevent="handleDrop"
              @dragover.prevent
              accept=".xlsx,.xls"
              class="hidden"
            />
          </label>
        </div>
        <p v-if="debugInfo" :class="['mt-2 text-sm', debugInfo.includes('错误') ? 'text-red-600' : 'text-gray-600']">
          {{ debugInfo }}
        </p>
      </div>

      <!-- 数据预览表格 -->
      <div v-if="tableData.length" class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-medium">数据预览</h3>
          <span class="text-sm text-gray-500">共 {{ tableData.length }} 条记录</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                序号
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                区域
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                行车号
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in tableData" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.区域 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.设备名称 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="deleteRow(index)"
                  class="text-red-600 hover:text-red-900 mr-3"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
                <button
                  @click="editRow(item, index)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="p-4 border-t flex space-x-4">
        <button
          @click="generateMapping"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!tableData.length"
        >
          生成映射
        </button>

        <button
          @click="applyMapping"
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!mappingResult"
        >
          运用映射
        </button>
      </div>

      <!-- 映射结果 -->
      <div v-if="mappingResult" class="p-4 border-t">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium">生成的映射代码：</h3>
          <button
            @click="copyToClipboard"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded inline-flex items-center"
          >
            <DocumentDuplicateIcon class="w-4 h-4 mr-1" />
            复制代码
          </button>
        </div>
        <pre class="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap text-sm">{{ mappingResult }}</pre>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editingItem" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-medium mb-4">编辑记录</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              区域
            </label>
            <input
              v-model="editingItem.区域"
              type="text"
              class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              行车号
            </label>
            <input
              v-model="editingItem.设备名称"
              type="text"
              class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="cancelEdit"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="saveEdit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import {
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import { message } from 'ant-design-vue'

import { useCraneMappingStore } from '../store/craneMapping'

const tableData = ref([])
const mappingResult = ref('')
const debugInfo = ref('')
const editingItem = ref(null)
const editingIndex = ref(-1)

// 用来存储所有行车设备的数组
const carArray = ref([])

// 文件上传处理
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  processFile(file)
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (!file) return
  processFile(file)
}

const processFile = (file) => {
  debugInfo.value = '正在处理文件...'
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const rawData = XLSX.utils.sheet_to_json(firstSheet)
      console.log('原始Excel数据:', rawData)

      const newData = rawData
        .map(row => ({
          区域: row['区域'] || row['区域名称'] || row['area'] || row['Area'],
          设备名称: row['设备名称'] || row['设备'] || row['行车'] || row['行车号']
        }))
        .filter(row => row.区域 && row.设备名称)

      if (newData.length === 0) {
        debugInfo.value = '错误：未找到有效数据。请确保Excel文件包含正确的列名'
        return
      }

      // 合并新数据到现有数据，而不是覆盖
      tableData.value = [...tableData.value, ...newData]
      debugInfo.value = `成功导入 ${newData.length} 条记录`
    } catch (error) {
      console.error('处理文件时出错:', error)
      debugInfo.value = `错误：${error.message}`
    }
  }

  reader.onerror = () => {
    debugInfo.value = '错误：文件读取失败'
  }

  reader.readAsArrayBuffer(file)
}

// 行操作
const deleteRow = (index) => {
  tableData.value.splice(index, 1)
  if (tableData.value.length === 0) {
    mappingResult.value = ''
  }
}

const editRow = (item, index) => {
  editingItem.value = { ...item }
  editingIndex.value = index
}

const saveEdit = () => {
  if (editingIndex.value > -1) {
    tableData.value[editingIndex.value] = { ...editingItem.value }
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingItem.value = null
  editingIndex.value = -1
}

// 生成映射
// 在 setup 中获取 store 实例
const craneMappingStore = useCraneMappingStore()

// 修改 generateMapping 函数
const generateMapping = () => {
  try {
    debugInfo.value = '开始生成映射...'

    if (!tableData.value.length) {
      debugInfo.value = '错误：没有可用的数据'
      return
    }

    // 生成 carArray
    const newCarArray = Array.from(new Set(tableData.value.map(item => item.设备名称)))

    // 按区域分组生成映射
    const newMapping = {}
    tableData.value.reduce((acc, curr) => {
      if (!acc[curr.区域]) {
        acc[curr.区域] = []
      }
      if (!acc[curr.区域].includes(curr.设备名称)) {
        acc[curr.区域].push(curr.设备名称)
      }
      return acc
    }, newMapping)

    // 更新 store 中的数据
    craneMappingStore.updateMappings(newCarArray, newMapping)

    // 生成代码预览
    const codeString = `// 所有行车的数组
const carArray = ${JSON.stringify(newCarArray, null, 2)};

// 区域和行车的映射关系
const areaCarMapping = ${JSON.stringify(newMapping, null, 2)};`

    mappingResult.value = codeString
    debugInfo.value = '映射生成成功！'

  } catch (error) {
    console.error('生成映射时出错:', error)
    debugInfo.value = `错误：${error.message}`
  }
}

// 复制代码
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(mappingResult.value)
    debugInfo.value = '代码已复制到剪贴板'
  } catch (err) {
    debugInfo.value = '复制失败，请手动复制'
  }
}

const applyMapping = () => {
  try {
    craneMappingStore.applyMappings()
    message.success('映射已成功运用')
  } catch (error) {
    message.error('运用映射失败：' + error.message)
  }
}

</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>