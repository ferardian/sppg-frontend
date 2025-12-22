import { defineStore } from 'pinia'
import configService from '@/services/configService'

export const useConfigStore = defineStore('config', {
    state: () => ({
        sppgName: 'SPPG', // Default name
        sppgAddress: '',
        isLoading: false
    }),

    actions: {
        async fetchConfig() {
            this.isLoading = true
            try {
                const response = await configService.getSPPGProfile()
                if (response.success && response.data) {
                    this.sppgName = response.data.nama_sppg || 'SPPG'
                    this.sppgAddress = response.data.alamat || ''
                }
            } catch (error) {
                console.error('Error loading config:', error)
            } finally {
                this.isLoading = false
            }
        }
    }
})
