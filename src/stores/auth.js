import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import menuPermissionService from '@/services/menuPermissionService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const isAuthenticated = ref(!!token.value)
  const permissions = ref(JSON.parse(localStorage.getItem('user_permissions') || '[]'))

  // Getters
  const userName = computed(() => user.value?.name || 'User')
  
  const hasAccess = (menuKey) => {
    // Dashboard is always visible
    if (menuKey === 'dashboard') return true
    
    // Admin always has access (case-insensitive check)
    const role = user.value?.role?.toLowerCase()
    if (role === 'admin') return true
    
    return permissions.value.includes(menuKey)
  }

  // Actions
  const setAuth = async (authData) => {
    user.value = authData.user
    token.value = authData.token
    isAuthenticated.value = true

    // Save to localStorage
    localStorage.setItem('auth_token', authData.token)
    localStorage.setItem('user_data', JSON.stringify(authData.user))
    
    // Fetch and save permissions
    await fetchPermissions()
  }

  const fetchProfile = async () => {
    try {
        const res = await api.get('/auth/profile')
        user.value = res.data.data.user
        localStorage.setItem('user_data', JSON.stringify(user.value))
    } catch (e) {
        console.error('Failed to fetch profile', e)
    }
  }

  const fetchPermissions = async () => {
    try {
        const res = await menuPermissionService.getMyPermissions()
        permissions.value = res.data.data || []
        localStorage.setItem('user_permissions', JSON.stringify(permissions.value))
    } catch (e) {
        console.error('Failed to fetch permissions', e)
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    permissions.value = []

    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_permissions')
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_data')
    const savedPerms = localStorage.getItem('user_permissions')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      if (savedPerms) {
        permissions.value = JSON.parse(savedPerms)
      }
      
      // If role is missing, fetch profile to update data
      if (!user.value?.role) {
        fetchProfile()
      }
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    permissions,

    // Getters
    userName,
    hasAccess,

    // Actions
    setAuth,
    clearAuth,
    initializeAuth,
    fetchPermissions
  }
})