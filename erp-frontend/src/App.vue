<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup>
// 不需要其他代码,只需要渲染路由视图

import { useCraneMappingStore } from './store/craneMapping'
import {onMounted} from "vue";

// 在适当的生命周期钩子中
onMounted(() => {
  const craneMappingStore = useCraneMappingStore()
  // 如果存在保存的映射数据，则自动应用
  if (Object.keys(craneMappingStore.areaCarMapping).length > 0) {
    craneMappingStore.applyMappings()
  }
})
</script>