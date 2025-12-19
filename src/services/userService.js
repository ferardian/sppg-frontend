import apiClient from './api'

const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await apiClient.get('/users')
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Get pegawai list for user creation
  async getPegawaiList() {
    try {
      const response = await apiClient.get('/users/pegawai-list')
      return response.data
    } catch (error) {
      console.error('Error fetching pegawai list:', error)
      throw error
    }
  },

  // Get available roles
  getRoles() {
    return [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' },
      { value: 'operator', label: 'Operator' },
      { value: 'viewer', label: 'Viewer' }
    ]
  }
}

export default userService