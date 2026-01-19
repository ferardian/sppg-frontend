import apiClient from './api'

const stokOpnameService = {
  // Get all stok opname records
  async getAll() {
    try {
      const response = await apiClient.get('/stok-opname')
      return response.data
    } catch (error) {
      console.error('Error fetching stok opname:', error)
      throw error
    }
  },

  // Get stok opname by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/stok-opname/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching stok opname:', error)
      throw error
    }
  },

  // Create new stok opname
  async create(data) {
    try {
      const response = await apiClient.post('/stok-opname', data)
      return response.data
    } catch (error) {
      console.error('Error creating stok opname:', error)
      throw error
    }
  },

  // Update stok opname
  async update(id, data) {
    try {
      const response = await apiClient.put(`/stok-opname/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating stok opname:', error)
      throw error
    }
  },

  // Delete stok opname
  async delete(id) {
    try {
      const response = await apiClient.delete(`/stok-opname/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting stok opname:', error)
      throw error
    }
  },

  // Get bahan baku list
  async getBahanBaku() {
    try {
      const response = await apiClient.get('/bahan-baku')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching bahan baku:', error)
      throw error
    }
  },

  // Get bahan baku with current stock
  async getBahanBakuStock() {
    try {
      const response = await apiClient.get('/bahan-baku', { params: { per_page: 9999 } })
      console.log('Raw bahan-baku response:', response)

      // Transform data to include stok from stok_akhir of latest transaction
      const stokResponse = await apiClient.get('/stok-opname/latest-stock')
      console.log('Raw latest-stock response:', stokResponse)

      // Handle API response structure properly - data is in response.data.data
      const bahanBaku = response.data?.data || response.data || []
      const latestStocks = stokResponse.data?.data || stokResponse.data || []

      console.log('Extracted bahanBaku data:', bahanBaku)
      console.log('Extracted latestStocks data:', latestStocks)

      // Ensure bahanBaku is an array
      if (!Array.isArray(bahanBaku)) {
        console.warn('bahanBaku is not an array:', bahanBaku)
        return { data: [] }
      }

      // Merge stok data
      const mergedData = bahanBaku.map(bahan => {
        const latestStock = latestStocks.find(stock => stock.id_bahan_baku === bahan.id_bahan_baku)
        return {
          ...bahan,
          stok: latestStock ? parseFloat(latestStock.stok_akhir) || 0 : 0
        }
      })

      console.log('Merged data with stock:', mergedData)
      return { data: mergedData }
    } catch (error) {
      console.error('Error fetching bahan baku stock:', error)
      console.error('Error details:', error.response?.data)
      // Fallback to regular getBahanBaku
      try {
        const response = await apiClient.get('/bahan-baku', { params: { per_page: 9999 } })
        const bahanBaku = response.data?.data || response.data || []
        if (!Array.isArray(bahanBaku)) {
          return { data: [] }
        }
        return { data: bahanBaku.map(bahan => ({ ...bahan, stok: 0 })) }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        return { data: [] }
      }
    }
  },

  // Get supplier list
  async getSuppliers() {
    try {
      const response = await apiClient.get('/supplier')
      console.log('Raw suppliers response:', response)
      const data = response.data?.data || response.data || []
      console.log('Extracted suppliers data:', data)
      return { data }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      console.error('Supplier error details:', error.response?.data)
      return { data: [] }
    }
  },

  // Get pegawai list
  async getPegawai() {
    try {
      const response = await apiClient.get('/pegawai')
      console.log('Raw pegawai response:', response)
      const data = response.data?.data || response.data || []
      console.log('Extracted pegawai data:', data)
      return { data }
    } catch (error) {
      console.error('Error fetching pegawai:', error)
      console.error('Pegawai error details:', error.response?.data)
      return { data: [] }
    }
  },

  // Get latest stock for all bahan baku
  async getLatestStock() {
    try {
      const response = await apiClient.get('/stok-opname/latest-stock')
      return response.data
    } catch (error) {
      console.error('Error fetching latest stock:', error)
      throw error
    }
  },

  // Get transaction types
  getTransactionTypes() {
    return [
      { value: 'masuk', label: 'Stok Masuk' },
      { value: 'keluar', label: 'Stok Keluar' },
      { value: 'penyesuaian', label: 'Penyesuaian Stok' }
    ]
  }
}

export default stokOpnameService