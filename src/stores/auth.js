import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const isAuthenticated = ref(!!token.value)

  // Getters
  const userName = computed(() => user.value?.name || 'User')

  // Actions
  const setAuth = (authData) => {
    user.value = authData.user
    token.value = authData.token
    isAuthenticated.value = true

    // Save to localStorage
    localStorage.setItem('auth_token', authData.token)
    localStorage.setItem('user_data', JSON.stringify(authData.user))
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false

    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_data')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Getters
    userName,

    // Actions
    setAuth,
    clearAuth,
    initializeAuth
  }
})