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
            // For FormData (file upload), we MUST use POST with _method spoofing for Laravel to read files correctly
            if (data instanceof FormData) {
                const response = await apiClient.post(`/finance/transaction/${id}`, data)
                return response.data
            }
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

    async exportEvidence(params) {
        // We use a direct window open or hidden link for downloads to handle binary properly with auth
        // but since we need auth header, we can also fetch as blob
        try {
            const token = localStorage.getItem('auth_token')
            const queryParams = new URLSearchParams(params).toString()
            const url = `${apiClient.defaults.baseURL}/finance/export-evidence?${queryParams}`
            
            // Create a temporary link and trigger download with the token in URL if possible, 
            // or use axios to get blob (safer for auth)
            const response = await apiClient.get(`/finance/export-evidence?${queryParams}`, {
                responseType: 'blob'
            })
            
            const blob = new Blob([response.data], { type: 'application/zip' })
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', `Bukti_Nota_${params.year}_${params.month}.zip`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(downloadUrl)
        } catch (error) {
            console.error('Error exporting evidence:', error)
            throw error
        }
    }
}

export default new FinanceService()
