import apiClient from './api'

class FinanceService {
    async getLedgerData(params) {
        try {
            const response = await apiClient.get('/finance', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching finance data:', error)
            throw error
        }
    }

    async getAccounts() {
        try {
            const response = await apiClient.get('/finance/accounts')
            return response.data
        } catch (error) {
            console.error('Error fetching accounts:', error)
            throw error
        }
    }

    async createTransaction(data) {
        try {
            const response = await apiClient.post('/finance/transaction', data)
            return response.data
        } catch (error) {
            console.error('Error creating transaction:', error)
            throw error
        }
    }

    async createTransfer(data) {
        try {
            const response = await apiClient.post('/finance/transfer', data)
            return response.data
        } catch (error) {
            console.error('Error creating transfer:', error)
            throw error
        }
    }

    async updateTransaction(id, data) {
        try {
            const response = await apiClient.put(`/finance/transaction/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating transaction:', error)
            throw error
        }
    }

    async deleteTransaction(id) {
        try {
            const response = await apiClient.delete(`/finance/transaction/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting transaction:', error)
            throw error
        }
    }
}

export default new FinanceService()
