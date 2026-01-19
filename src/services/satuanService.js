import api from './api'

export default {
    getAll() {
        return api.get('satuan')
    },
    getById(id) {
        return api.get(`satuan/${id}`)
    },
    create(data) {
        return api.post('satuan', data)
    },
    update(id, data) {
        return api.put(`satuan/${id}`, data)
    },
    delete(id) {
        return api.delete(`satuan/${id}`)
    }
}
