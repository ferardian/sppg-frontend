<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()

onMounted(() => {
  configStore.fetchConfig()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

/* Remove default margins */
#app {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* Reset Bootstrap defaults */
.row {
  margin: 0;
}

.container-fluid {
  padding: 0;
}

/* Full width utility */
.w-full {
  width: 100% !important;
}
</style>
