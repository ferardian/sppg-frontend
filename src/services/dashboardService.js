import api from './api'

export default {
    // Get dashboard statistics (cards)
    getStatistics() {
        return api.get('/dashboard/statistics')
    },

    // Get monthly distribution data for chart
    getMonthlyDistribution() {
        return api.get('/dashboard/monthly-distribution')
    },

    // Get recent distributions list
    getRecentDistributions() {
        return api.get('/dashboard/recent-distributions')
    },

    // Get recent activities list
    getRecentActivities() {
        return api.get('/dashboard/recent-activities')
    },

    // General stats endpoint (if needed fallback)
    getStats() {
        return api.get('/dashboard/stats')
    }
}
