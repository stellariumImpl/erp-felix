// src/store/craneMapping.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCraneMappingStore = defineStore('craneMapping', () => {
  // 从 localStorage 初始化数据
  const initialCarArray = JSON.parse(localStorage.getItem('carArray') || '[]')
  const initialAreaMapping = JSON.parse(localStorage.getItem('areaCarMapping') || '{}')

  const carArray = ref(initialCarArray)
  const areaCarMapping = ref(initialAreaMapping)

  // 监听数据变化，自动保存到 localStorage
  watch([carArray, areaCarMapping], ([newCarArray, newAreaMapping]) => {
    localStorage.setItem('carArray', JSON.stringify(newCarArray))
    localStorage.setItem('areaCarMapping', JSON.stringify(newAreaMapping))
  }, { deep: true })

  // 计算反向映射
  const carToAreaMapping = computed(() => {
    return Object.entries(areaCarMapping.value).reduce((acc, [area, cars]) => {
      cars.forEach(car => {
        acc[car] = area
      })
      return acc
    }, {})
  })

  const updateMappings = (newCarArray, newMapping) => {
    carArray.value = newCarArray
    areaCarMapping.value = newMapping
  }

  const applyMappings = () => {
    return {
      carArray: carArray.value,
      areaCarMapping: areaCarMapping.value,
      carToAreaMapping: carToAreaMapping.value
    }
  }

  // 清除映射数据
  const clearMappings = () => {
    carArray.value = []
    areaCarMapping.value = {}
    localStorage.removeItem('carArray')
    localStorage.removeItem('areaCarMapping')
  }

  return {
    carArray,
    areaCarMapping,
    carToAreaMapping,
    updateMappings,
    applyMappings,
    clearMappings
  }
})