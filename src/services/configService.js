import api from './api'

export default {
    async getSPPGProfile() {
        try {
            const response = await api.get('/sppg')
            // Assuming the first SPPG in the list is the main one for this instance
            if (response.data.success && response.data.data.length > 0) {
                return {
                    success: true,
                    data: response.data.data[0]
                }
            }
            return { success: false, message: 'No SPPG data found' }
        } catch (error) {
            console.error('Failed to fetch SPPG profile:', error)
            throw error
        }
    }
}
