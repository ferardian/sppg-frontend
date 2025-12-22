import apiClient from './api'

const komposisiPanganService = {
    // Get list of food composition data with optional search and filter
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/komposisi-pangan', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching data komposisi pangan:', error)
            throw error
        }
    },

    // Get detail by ID
    async getById(id) {
        try {
            const response = await apiClient.get(`/komposisi-pangan/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching detail komposisi pangan:', error)
            throw error
        }
    }
}

export default komposisiPanganService
