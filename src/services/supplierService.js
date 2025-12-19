import apiClient from './api'

class SupplierService {
  async getAll() {
    try {
      const response = await apiClient.get('/supplier')
      return response.data
    } catch (error) {
      console.error('Error fetching supplier data:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const response = await apiClient.get(`/supplier/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching supplier with id ${id}:`, error)
      throw error
    }
  }

  async create(data) {
    try {
      const response = await apiClient.post('/supplier', data)
      return response.data
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  }

  async update(id, data) {
    try {
      const response = await apiClient.put(`/supplier/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating supplier with id ${id}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      const response = await apiClient.delete(`/supplier/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting supplier with id ${id}:`, error)
      throw error
    }
  }
}

export default new SupplierService()