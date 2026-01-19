import apiClient from './api'

class SalaryLogService {
    async getSalaryLogs(params) {
        // params: { start_date, end_date }
        try {
            const response = await apiClient.get('/salary-logs', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching salary logs:', error)
            throw error
        }
    }

    async saveBulkLogs(items) {
        // items: array of { pegawai_id, date, amount, note }
        try {
            const response = await apiClient.post('/salary-logs/bulk', { items })
            return response.data
        } catch (error) {
            console.error('Error saving salary logs:', error)
            throw error
        }
    }

    async saveRates(rates) {
        try {
            const response = await apiClient.post('/salary-rates', { rates })
            return response.data
        } catch (error) {
            console.error('Error saving rates:', error)
            throw error
        }
    }
}

export default new SalaryLogService()
