import apiClient from './api'

class MenuService {
  async getAll(params) {
    try {
      const response = await apiClient.get('/menu', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching menu data:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const response = await apiClient.get(`/menu/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching menu with id ${id}:`, error)
      throw error
    }
  }

  async create(data) {
    try {
      const response = await apiClient.post('/menu', data)
      return response.data
    } catch (error) {
      console.error('Error creating menu:', error)
      throw error
    }
  }

  async update(id, data) {
    try {
      const response = await apiClient.put(`/menu/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating menu with id ${id}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      const response = await apiClient.delete(`/menu/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting menu with id ${id}:`, error)
      throw error
    }
  }

  async addBahanBaku(menuId, bahanBakuData) {
    try {
      const response = await apiClient.post(`/menu/${menuId}/bahan-baku`, bahanBakuData)
      return response.data
    } catch (error) {
      console.error(`Error adding bahan baku to menu ${menuId}:`, error)
      throw error
    }
  }

  async removeBahanBaku(menuId, bahanBakuId) {
    try {
      const response = await apiClient.delete(`/menu/${menuId}/bahan-baku/${bahanBakuId}`)
      return response.data
    } catch (error) {
      console.error(`Error removing bahan baku from menu ${menuId}:`, error)
      throw error
    }
  }

  async getJenisPorsi() {
    try {
      const response = await apiClient.get('/jenis-porsi')
      return response.data
    } catch (error) {
      console.error('Error fetching jenis porsi:', error)
      throw error
    }
  }
}

export default new MenuService()