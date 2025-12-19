import apiClient from './api'

class PenerimaManfaatService {
  async getAll() {
    try {
      const response = await apiClient.get('/penerima-manfaat')
      return response.data
    } catch (error) {
      console.error('Error fetching penerima manfaat data:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const response = await apiClient.get(`/penerima-manfaat/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching penerima manfaat with id ${id}:`, error)
      throw error
    }
  }

  async create(data) {
    try {
      const response = await apiClient.post('/penerima-manfaat', data)
      return response.data
    } catch (error) {
      console.error('Error creating penerima manfaat:', error)
      throw error
    }
  }

  async update(id, data) {
    try {
      const response = await apiClient.put(`/penerima-manfaat/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating penerima manfaat with id ${id}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      const response = await apiClient.delete(`/penerima-manfaat/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting penerima manfaat with id ${id}:`, error)
      throw error
    }
  }

  async getJenisPenerima() {
    try {
      const response = await apiClient.get('/jenis-penerima')
      return response.data
    } catch (error) {
      console.error('Error fetching jenis penerima:', error)
      throw error
    }
  }

  async getJenisPorsi() {
    try {
      const response = await apiClient.get('/jenis-porsi')
      return response.data
    } catch (error) {
      console.error('Error fetching jenis pori:', error)
      throw error
    }
  }
}

export default new PenerimaManfaatService()