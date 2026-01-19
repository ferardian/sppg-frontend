import api from '@/services/api'

const resource = '/jabatans'

export default {
    getAll() {
        return api.get(resource)
    },

    get(id) {
        return api.get(`${resource}/${id}`)
    },

    create(data) {
        return api.post(resource, data)
    },

    update(id, data) {
        return api.put(`${resource}/${id}`, data)
    },

    delete(id) {
        return api.delete(`${resource}/${id}`)
    }
}
