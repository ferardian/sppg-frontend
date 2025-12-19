import apiClient from './api'

class PegawaiService {
  // Get all pegawai data
  async getAll() {
    try {
      const response = await apiClient.get('/pegawai')
      return response.data
    } catch (error) {
      console.error('Error fetching pegawai data:', error)
      throw error
    }
  }

  // Get pegawai by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/pegawai/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching pegawai by ID:', error)
      throw error
    }
  }

  // Create new pegawai
  async create(data) {
    try {
      console.log('Creating pegawai with data:', data)
      const response = await apiClient.post('/pegawai', data)
      return response.data
    } catch (error) {
      console.error('Error creating pegawai:', error.response?.data || error)
      throw error
    }
  }

  // Update pegawai
  async update(id, data) {
    try {
      const response = await apiClient.put(`/pegawai/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating pegawai:', error)
      throw error
    }
  }

  // Delete pegawai
  async delete(id) {
    try {
      await apiClient.delete(`/pegawai/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting pegawai:', error)
      throw error
    }
  }
}

export default new PegawaiService()