import apiClient from './api'

class BahanBakuService {
  // Get all bahan baku data
  async getAll() {
    try {
      const response = await apiClient.get('/bahan-baku')
      return response.data
    } catch (error) {
      console.error('Error fetching bahan baku data:', error)
      throw error
    }
  }

  // Get bahan baku by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/bahan-baku/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching bahan baku by ID:', error)
      throw error
    }
  }

  // Create new bahan baku
  async create(data) {
    try {
      console.log('Creating bahan baku with data:', data)
      const response = await apiClient.post('/bahan-baku', data)
      return response.data
    } catch (error) {
      console.error('Error creating bahan baku:', error.response?.data || error)
      throw error
    }
  }

  // Update bahan baku
  async update(id, data) {
    try {
      const response = await apiClient.put(`/bahan-baku/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating bahan baku:', error)
      throw error
    }
  }

  // Delete bahan baku
  async delete(id) {
    try {
      await apiClient.delete(`/bahan-baku/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting bahan baku:', error)
      throw error
    }
  }
}

export default new BahanBakuService()