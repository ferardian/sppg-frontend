import api from './api'

export default {
    getAll() {
        return api.get('kategori-bahan')
    },
    getById(id) {
        return api.get(`kategori-bahan/${id}`)
    },
    create(data) {
        return api.post('kategori-bahan', data)
    },
    update(id, data) {
        return api.put(`kategori-bahan/${id}`, data)
    },
    delete(id) {
        return api.delete(`kategori-bahan/${id}`)
    }
}
