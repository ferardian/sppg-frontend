import apiClient from './api'

class AuthService {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)

      if (response.data.success) {
        const { token, user } = response.data.data

        // Store token and user data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))

        return {
          success: true,
          data: {
            token,
            user
          }
        }
      }

      return response.data
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login gagal',
        errors: error.errors || {}
      }
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile')
      return response.data
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Gagal mengambil data profil'
      }
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  getCurrentUser() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  getToken() {
    return localStorage.getItem('auth_token')
  }

  hasRole(role) {
    const user = this.getCurrentUser()
    return user && user.role === role
  }
}

export default new AuthService()