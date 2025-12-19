import apiClient from './api'

class SPPGService {
  // Get all SPPG data
  async getAll() {
    try {
      const response = await apiClient.get('/sppg')
      return response.data
    } catch (error) {
      console.error('Error fetching SPPG data:', error)
      throw error
    }
  }

  // Get SPPG by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/sppg/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching SPPG by ID:', error)
      throw error
    }
  }

  // Create new SPPG
  async create(data) {
    try {
      const response = await apiClient.post('/sppg', data)
      return response.data
    } catch (error) {
      console.error('Error creating SPPG:', error)
      throw error
    }
  }

  // Update SPPG
  async update(id, data) {
    try {
      const response = await apiClient.put(`/sppg/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating SPPG:', error)
      throw error
    }
  }

  // Delete SPPG
  async delete(id) {
    try {
      await apiClient.delete(`/sppg/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting SPPG:', error)
      throw error
    }
  }
}

export default new SPPGService()