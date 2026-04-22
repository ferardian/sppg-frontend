import api from './api'

const laporanSampahService = {
  getAll(params) {
    return api.get('/laporan-sampah', { params })
  },

  getById(id) {
    return api.get(`/laporan-sampah/${id}`)
  },

  create(data) {
    // Check if there's a file
    if (data.foto instanceof File) {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })
      return api.post('/laporan-sampah', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return api.post('/laporan-sampah', data)
  },

  update(id, data) {
    // Laravel workaround for PUT with FormData
    if (data.foto instanceof File) {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })
      formData.append('_method', 'PUT')
      return api.post(`/laporan-sampah/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return api.put(`/laporan-sampah/${id}`, data)
  },

  delete(id) {
    return api.delete(`/laporan-sampah/${id}`)
  },

  // Helpers for dropdowns
  getMenus() {
    return api.get('/menu')
  },

  getBahanBaku() {
    return api.get('/bahan-baku')
  },

  getPegawai() {
    return api.get('/users/pegawai-list')
  }
}

export default laporanSampahService
