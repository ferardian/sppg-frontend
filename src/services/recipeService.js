import apiClient from './api'

const recipeService = {
  // Get recipe items for a specific menu
  async getRecipeItems(idMenu) {
    try {
      const response = await apiClient.get('/recipes', {
        params: { id_menu: idMenu }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching recipe items:', error)
      throw error
    }
  },

  // Get recipe statistics
  async getStatistics() {
    try {
      const response = await apiClient.get('/recipes/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching recipe statistics:', error)
      throw error
    }
  },

  // Get menu with complete recipe
  async getMenuRecipe(idMenu) {
    try {
      const response = await apiClient.get(`/recipes/menu/${idMenu}`)
      return response.data
    } catch (error) {
      console.error('Error fetching menu recipe:', error)
      throw error
    }
  },

  // Add recipe item to menu
  async addRecipeItem(data) {
    try {
      const response = await apiClient.post('/recipes', data)
      return response.data
    } catch (error) {
      console.error('Error adding recipe item:', error)
      throw error
    }
  },

  // Update recipe item
  async updateRecipeItem(id, data) {
    try {
      const response = await apiClient.put(`/recipes/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating recipe item:', error)
      throw error
    }
  },

  // Delete recipe item
  async deleteRecipeItem(id) {
    try {
      const response = await apiClient.delete(`/recipes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting recipe item:', error)
      throw error
    }
  },

  // Get available ingredients
  async getAvailableIngredients() {
    try {
      const response = await apiClient.get('/recipes/ingredients/available')
      return response.data
    } catch (error) {
      console.error('Error fetching available ingredients:', error)
      throw error
    }
  },

  // Get unit options
  getUnitOptions() {
    return [
      { value: 'gram', label: 'Gram (g)', type: 'weight' },
      { value: 'kg', label: 'Kilogram (kg)', type: 'weight' },
      { value: 'ml', label: 'Milliliter (ml)', type: 'volume' },
      { value: 'liter', label: 'Liter (L)', type: 'volume' },
      { value: 'pcs', label: 'Pieces (pcs)', type: 'unit' },
      { value: 'bungkus', label: 'Bungkus', type: 'unit' },
      { value: 'sdm', label: 'Sendok Makan (sdm)', type: 'volume' },
      { value: 'sdt', label: 'Sendok Teh (sdt)', type: 'volume' }
    ]
  },

  // Get waste factor options
  getWasteFactorOptions() {
    return [
      { value: 1.0, label: '0% - Tanpa Waste', description: 'Tidak ada pemborosan' },
      { value: 1.05, label: '5% - Waste Minimal', description: 'Pemborosan sangat minim' },
      { value: 1.10, label: '10% - Waste Rendah', description: 'Pemborosan rendah' },
      { value: 1.15, label: '15% - Waste Sedang', description: 'Pemborosan sedang' },
      { value: 1.20, label: '20% - Waste Standar', description: 'Standar industri' },
      { value: 1.25, label: '25% - Waste Tinggi', description: 'Pemborosan tinggi' },
      { value: 1.30, label: '30% - Waste Sangat Tinggi', description: 'Pemborosan sangat tinggi' }
    ]
  },

  // Format amount with unit
  formatAmount(amount, unit) {
    if (!amount || amount === 0) return '0'

    switch (unit) {
      case 'gram':
        if (amount >= 1000) {
          return `${(amount / 1000).toFixed(2)} kg`
        }
        return `${Math.round(amount)} g`
      case 'ml':
        if (amount >= 1000) {
          return `${(amount / 1000).toFixed(2)} L`
        }
        return `${Math.round(amount)} ml`
      case 'kg':
        return `${amount.toFixed(2)} kg`
      case 'liter':
        return `${amount.toFixed(2)} L`
      default:
        return `${amount.toFixed(2)} ${unit}`
    }
  },

  // Calculate total amount with waste factor
  calculateTotalAmount(amountPerPortion, totalPortions, wasteFactor = 1.2) {
    return amountPerPortion * totalPortions * wasteFactor
  },

  // Validate recipe item data
  validateRecipeItem(item) {
    const errors = {}

    if (!item.id_bahan_baku) {
      errors.id_bahan_baku = 'Bahan baku harus dipilih'
    }

    // Validate amount based on type
    if (item.is_fixed_amount) {
      if (!item.fixed_amount || item.fixed_amount <= 0) {
        errors.fixed_amount = 'Jumlah tetap harus lebih dari 0'
      }
      // Only check if jumlah_per_porsi has a meaningful value (not 0, 0.00, or empty string)
      if (item.jumlah_per_porsi && item.jumlah_per_porsi !== '0' && item.jumlah_per_porsi !== '0.00' && parseFloat(item.jumlah_per_porsi) > 0) {
        errors.jumlah_per_porsi = 'Untuk bahan tetap, jumlah per porsi harus 0'
      }
    } else {
      if (!item.jumlah_per_porsi || item.jumlah_per_porsi <= 0 || item.jumlah_per_porsi === '0' || item.jumlah_per_porsi === '0.00') {
        errors.jumlah_per_porsi = 'Jumlah per porsi harus lebih dari 0'
      }
      if (item.fixed_amount && item.fixed_amount !== '0' && item.fixed_amount !== '0.00' && parseFloat(item.fixed_amount) > 0) {
        errors.fixed_amount = 'Untuk bahan per porsi, jumlah tetap harus 0'
      }
    }

    if (!item.satuan) {
      errors.satuan = 'Satuan harus dipilih'
    }

    if (!item.waste_factor || item.waste_factor < 1 || item.waste_factor > 2) {
      errors.waste_factor = 'Waste factor harus antara 1.0 - 2.0'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

export default recipeService