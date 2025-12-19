import apiClient from './api'

const distribusiMakananService = {
  // Get all distribusi makanan records
  async getAll() {
    try {
      const response = await apiClient.get('/distribusi-makanan')
      return response.data
    } catch (error) {
      console.error('Error fetching distribusi makanan:', error)
      throw error
    }
  },

  // Get distribusi makanan by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/distribusi-makanan/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching distribusi makanan:', error)
      throw error
    }
  },

  // Create new distribusi makanan
  async create(data) {
    try {
      const response = await apiClient.post('/distribusi-makanan', data)
      return response.data
    } catch (error) {
      console.error('Error creating distribusi makanan:', error)
      throw error
    }
  },

  // Update distribusi makanan
  async update(id, data) {
    try {
      const response = await apiClient.put(`/distribusi-makanan/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating distribusi makanan:', error)
      throw error
    }
  },

  // Delete distribusi makanan
  async delete(id) {
    try {
      const response = await apiClient.delete(`/distribusi-makanan/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting distribusi makanan:', error)
      throw error
    }
  },

  // Get penerima manfaat list
  async getPenerimaManfaat() {
    try {
      const response = await apiClient.get('/penerima-manfaat')
      console.log('Raw penerima-manfaat response:', response)
      const data = response.data?.data || response.data || []
      console.log('Extracted penerima-manfaat data:', data)
      return { data }
    } catch (error) {
      console.error('Error fetching penerima manfaat:', error)
      console.error('Penerima manfaat error details:', error.response?.data)
      return { data: [] }
    }
  },

  // Get menu list
  async getMenu() {
    try {
      const response = await apiClient.get('/menu')
      console.log('Raw menu response:', response)
      const data = response.data?.data || response.data || []
      console.log('Extracted menu data:', data)
      return { data }
    } catch (error) {
      console.error('Error fetching menu:', error)
      console.error('Menu error details:', error.response?.data)
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

  // Get jenis porsi list
  async getJenisPorsi() {
    try {
      const response = await apiClient.get('/jenis-porsi')
      console.log('Raw jenis-porsi response:', response)
      const data = response.data?.data || response.data || []
      console.log('Extracted jenis-porsi data:', data)
      return { data }
    } catch (error) {
      console.error('Error fetching jenis porsi:', error)
      console.error('Jenis porsi error details:', error.response?.data)
      return { data: [] }
    }
  },

  // Get waktu makan options
  getWaktuMakanOptions() {
    return [
      { value: 'sarapan', label: 'Sarapan' },
      { value: 'makan_siang', label: 'Makan Siang' },
      { value: 'makan_malam', label: 'Makan Malam' },
      { value: 'snack', label: 'Snack' }
    ]
  },

  // Get status distribusi options
  // Get distribusi summary for specific date
  async getSummary(tanggal) {
    try {
      const response = await apiClient.get('/distribusi-makanan/summary', {
        params: { tanggal }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching distribusi summary:', error)
      throw error
    }
  },

  // Get weekly summary
  async getWeeklySummary() {
    try {
      const response = await apiClient.get('/distribusi-makanan/weekly-summary')
      return response.data
    } catch (error) {
      console.error('Error fetching weekly summary:', error)
      throw error
    }
  },

  getStatusDistribusiOptions() {
    return [
      { value: 'direncanakan', label: 'Direncanakan', color: 'primary' },
      { value: 'disajikan', label: 'Disajikan', color: 'info' },
      { value: 'selesai', label: 'Selesai', color: 'success' },
      { value: 'batal', label: 'Dibatalkan', color: 'danger' }
    ]
  }
}

export default distribusiMakananService