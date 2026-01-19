<template>
  <div class="salary-log-view">
    <!-- Header Section with Stats -->
    <div class="row mb-4">
        <div class="col-md-8">
            <h3 class="fw-bold text-dark mb-1">Laporan Gaji Relawan</h3>
            <p class="text-muted">Kelola dan pantau gaji harian relawan dengan mudah.</p>
        </div>
        <div class="col-md-4 text-md-end">
             <div class="card border-0 bg-primary text-white shadow-sm overflow-hidden">
                <div class="card-body p-3 position-relative">
                    <i class="bi bi-wallet2 position-absolute top-50 end-0 translate-middle-y me-3 opacity-25" style="font-size: 3rem;"></i>
                    <h6 class="text-white-50 text-uppercase small ls-1 mb-1">Total Periode Ini</h6>
                    <h3 class="mb-0 fw-bold">{{ formatCurrency(calculateGrandTotalSalary()) }}</h3>
                </div>
             </div>
        </div>
    </div>

    <!-- Controls & Actions -->
    <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
            <!-- Period Selection -->
            <div class="mb-3">
                <label class="form-label fw-semibold mb-2">
                    <i class="bi bi-calendar-range me-2"></i>
                    Pilih Periode Penggajian
                </label>
                <div class="row g-2">
                    <div class="col-12 col-md-5">
                        <input type="date" class="form-control" 
                               v-model="startDate"
                               placeholder="Tanggal Mulai">
                    </div>
                    <div class="col-12 col-md-2 d-flex align-items-center justify-content-center">
                        <span class="text-muted fw-bold">s/d</span>
                    </div>
                    <div class="col-12 col-md-5">
                        <input type="date" class="form-control" 
                               v-model="endDate"
                               placeholder="Tanggal Akhir">
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap gap-2 justify-content-end">
                <button class="btn btn-primary flex-fill flex-md-grow-0 px-4" 
                        @click="loadPeriodData" 
                        :disabled="loading || !startDate || !endDate">
                    <i class="bi bi-eye me-2"></i>
                    {{ loading ? 'Memuat...' : 'Tampilkan' }}
                </button>
                
                <!-- Show these buttons only when data loaded -->
                <template v-if="dataLoaded">
                    <button class="btn btn-outline-danger flex-fill flex-md-grow-0 px-3" 
                            @click="confirmResetPeriod">
                        <i class="bi bi-trash me-2"></i>
                        <span class="d-none d-sm-inline">Reset Periode</span>
                        <span class="d-inline d-sm-none">Reset</span>
                    </button>
                    <button class="btn btn-outline-primary flex-fill flex-md-grow-0 px-3" 
                            @click="showRateModal = true">
                        <i class="bi bi-gear-fill me-2"></i>
                        <span class="d-none d-sm-inline">Atur Gaji</span>
                        <span class="d-inline d-sm-none">Atur</span>
                    </button>
                    <button class="btn btn-outline-success flex-fill flex-md-grow-0 px-3" 
                            @click="exportData">
                        <i class="bi bi-file-earmark-excel me-2"></i>
                        <span class="d-none d-sm-inline">Export Data</span>
                        <span class="d-inline d-sm-none">Export</span>
                    </button>
                    <button class="btn btn-success flex-fill flex-md-grow-0 px-4" 
                            @click="saveData" 
                            :disabled="loading">
                        <i class="bi bi-check-lg me-2"></i>
                        {{ loading ? 'Menyimpan...' : 'Simpan' }}
                    </button>
                </template>
            </div>
        </div>
    </div>

    <!-- Empty State - Before Period Selected -->
    <div v-if="!dataLoaded" class="card shadow border-0 rounded-4 overflow-hidden">
        <div class="card-body text-center py-5">
            <div class="mb-4">
                <i class="bi bi-calendar-check text-primary" style="font-size: 5rem; opacity: 0.3;"></i>
            </div>
            <h4 class="text-dark mb-3">Pilih Periode untuk Memulai</h4>
            <p class="text-muted mb-0">Silakan pilih tanggal mulai dan tanggal akhir periode penggajian,<br>kemudian klik tombol <strong>"Tampilkan"</strong> untuk melihat data.</p>
        </div>
    </div>

    <!-- Modern Data Table -->
    <div v-if="dataLoaded" class="card shadow border-0 rounded-4 overflow-hidden">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table mb-0 align-middle custom-table">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4 text-secondary text-uppercase py-3" style="width: 250px;">Relawan</th>
                            <!-- Dynamic Date Headers -->
                            <th v-for="d in dateHeaders" :key="d.date" class="text-center py-3" style="min-width: 100px;">
                                <div class="d-flex flex-column align-items-center">
                                    <span class="fw-bold text-dark small">{{ d.dayName }}</span>
                                    <span class="badge bg-white text-secondary border rounded-pill fw-normal mt-1">{{ d.formattedDate }}</span>
                                    <span v-if="d.isDouble" class="badge bg-warning text-dark position-absolute top-0 start-100 translate-middle badge-pill shadow-sm" style="font-size: 0.6rem;">2x</span>
                                </div>
                            </th>
                            <th class="text-center bg-light-subtle text-secondary text-uppercase" style="width: 100px;">Hadir</th>
                            <th class="text-end pe-4 bg-light-subtle text-secondary text-uppercase" style="width: 150px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(emp, idx) in employees" :key="emp.id_pegawai" class="transition-hover">
                            <td class="ps-4">
                                <div class="d-flex flex-column">
                                    <span class="fw-bold text-dark">{{ emp.nama_lengkap }}</span>
                                    <span class="small text-muted">{{ emp.jabatan }}</span>
                                </div>
                            </td>
                            
                            <!-- Date Cells -->
                            <td v-for="d in dateHeaders" :key="d.date" class="p-1 text-center" @click="togglePresence(emp, d)" style="cursor: pointer;">
                                <div class="input-wrapper mx-auto d-flex align-items-center justify-content-center" 
                                    :class="{'has-value': getAmount(emp.id_pegawai, d.date) > 0, 'double-pay': d.isDouble && getAmount(emp.id_pegawai, d.date) > 0}">
                                    
                                    <span v-if="getAmount(emp.id_pegawai, d.date) > 0" class="fw-bold small">
                                        {{ formatCurrencySimple(getAmount(emp.id_pegawai, d.date)) }}
                                    </span>
                                    <span v-else class="text-muted opacity-25 small">-</span>
                                </div>
                            </td>

                            <!-- Totals -->
                            <td class="text-center fw-bold text-primary bg-light-subtle">{{ calculateTotalPresence(emp.id_pegawai) }}</td>
                            <td class="text-end pe-4 fw-bold text-dark bg-light-subtle">{{ formatCurrency(calculateTotalSalary(emp.id_pegawai)) }}</td>
                        </tr>
                        
                        <!-- Footer Totals -->
                        <tr class="bg-light fw-bold">
                            <td class="ps-4 py-3 text-uppercase text-secondary small ls-1">Total Harian</td>
                            <td v-for="d in dateHeaders" :key="'tot-'+d.date" class="text-center py-3 text-secondary small">
                                {{ formatCurrencySimple(calculateDailyTotal(d.date)) }}
                            </td>
                            <td class="text-center py-3 text-primary">{{ calculateGrandTotalPresence() }}</td>
                            <td class="text-end pe-4 py-3 text-success fs-5">{{ formatCurrency(calculateGrandTotalSalary()) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Reset Period Confirmation Modal -->
    <div v-if="showResetModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-danger text-white border-0">
                    <h5 class="modal-title">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Konfirmasi Hapus Data
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="showResetModal = false"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="alert alert-warning border-0 mb-3">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>PERINGATAN!</strong> Tindakan ini tidak dapat dibatalkan.
                    </div>
                    
                    <p class="mb-3">Anda akan menghapus <strong>SEMUA</strong> data gaji untuk periode:</p>
                    
                    <div class="card bg-light border-0 mb-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                                <span class="badge bg-primary fs-6 px-3 py-2">{{ startDate }}</span>
                                <i class="bi bi-arrow-right"></i>
                                <span class="badge bg-primary fs-6 px-3 py-2">{{ endDate }}</span>
                            </div>
                            
                            <div class="row text-center">
                                <div class="col-6">
                                    <div class="border-end">
                                        <h3 class="text-danger mb-0">{{ employees.length }}</h3>
                                        <small class="text-muted">Pegawai</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <h3 class="text-danger mb-0">{{ dateHeaders.length }}</h3>
                                    <small class="text-muted">Hari Kerja</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-muted small mb-0">
                        <i class="bi bi-lightbulb me-1"></i>
                        Setelah reset, Anda masih perlu klik tombol <strong>"Simpan"</strong> untuk menyimpan perubahan ke database.
                    </p>
                </div>
                <div class="modal-footer border-0 bg-light">
                    <button type="button" class="btn btn-secondary" @click="showResetModal = false">
                        <i class="bi bi-x-circle me-2"></i>
                        Batal
                    </button>
                    <button type="button" class="btn btn-danger" @click="resetPeriod">
                        <i class="bi bi-trash me-2"></i>
                        Ya, Hapus Semua Data
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Rate Configuration Modal -->
     <div v-if="showRateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Atur Nominal Gaji per Jabatan</h5>
                    <button type="button" class="btn-close" @click="showRateModal = false"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted small mb-3">Masukkan nominal gaji harian untuk setiap jabatan. Nominal ini akan digunakan saat Anda mengisi absen.</p>
                    <div class="table-responsive" style="max-height: 400px;">
                         <table class="table table-sm table-borderless align-middle">
                            <thead class="bg-light sticky-top">
                                <tr>
                                    <th>Jabatan</th>
                                    <th>Nominal (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="rate in rateList" :key="rate.jabatan">
                                    <td class="fw-semibold">{{ rate.jabatan }}</td>
                                    <td>
                                        <input type="number" class="form-control form-control-sm" v-model="rate.amount" step="5000">
                                    </td>
                                </tr>
                            </tbody>
                         </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" @click="showRateModal = false">Batal</button>
                    <button type="button" class="btn btn-primary" @click="saveRates" :disabled="loading">Simpan Konfigurasi</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import salaryLogService from '@/services/salaryLogService'
import { useToast } from 'vue-toastification'

export default {
  name: 'SalaryLogView',
  setup() {
    const toast = useToast()
    const loading = ref(false)
    const employees = ref([])
    const logs = ref({})
    const rates = ref({}) // Map: jabatan -> amount
    const rateList = ref([]) // Array for editing: { jabatan, amount }
    const showRateModal = ref(false)
    const hasChanges = ref(false)
    const dataLoaded = ref(false)
    
    // Default range logic
    const d = new Date()
    const day = d.getDay()
    // Align to start of week (Monday)
    const diff = d.getDate() - day + (day == 0 ? -6 : 1) 
    const start = new Date(d.setDate(diff))
    const end = new Date(start)
    end.setDate(end.getDate() + 13)

    const startDate = ref(start.toISOString().split('T')[0])
    const endDate = ref(end.toISOString().split('T')[0])

    const dateHeaders = computed(() => {
        if (!startDate.value || !endDate.value) return []
        
        const start = new Date(startDate.value)
        const end = new Date(endDate.value)
        const days = []
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push({
                date: d.toISOString().split('T')[0],
                dayName: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d),
                formattedDate: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d),
                isDouble: d.getDay() === 4 // 4 is Thursday
            })
        }
        return days
    })


    const loadPeriodData = async () => {
        loading.value = true
        dataLoaded.value = false
        
        try {
            const res = await salaryLogService.getSalaryLogs({
                start_date: startDate.value,
                end_date: endDate.value
            })
            
            employees.value = res.data.pegawai
            rates.value = res.data.rates || {}
            
            // Extract distinct Jabatans for modal
            const distinctJabatans = [...new Set(res.data.pegawai.map(p => p.jabatan))].filter(Boolean).sort()
            
            rateList.value = distinctJabatans.map(j => ({
                jabatan: j,
                amount: rates.value[j] ? parseFloat(rates.value[j]) : 0
            }))
            
            // Map existing logs
            const fetchedLogs = {}
            if (res.data.logs) {
                 for (const pid in res.data.logs) {
                     fetchedLogs[pid] = {}
                     for (const d in res.data.logs[pid]) {
                         fetchedLogs[pid][d] = res.data.logs[pid][d].amount
                     }
                 }
            }
            
            // AUTO-FILL: Fill all cells with default rates for all employees
            const autoFilledLogs = {}
            
            employees.value.forEach(emp => {
                const pid = emp.id_pegawai
                const baseRate = parseFloat(rates.value[emp.jabatan] || 0)
                
                if (!autoFilledLogs[pid]) autoFilledLogs[pid] = {}
                
                // Fill each date in the period
                dateHeaders.value.forEach(dayInfo => {
                    // Get day of week (0 = Sunday, 6 = Saturday)
                    const dayOfWeek = new Date(dayInfo.date).getDay()
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
                    
                    // Check if already has saved data with value > 0
                    const savedValue = fetchedLogs[pid]?.[dayInfo.date]
                    const hasSavedData = savedValue !== undefined && savedValue > 0
                    
                    if (hasSavedData) {
                        // Use existing data (only if > 0)
                        autoFilledLogs[pid][dayInfo.date] = savedValue
                    } else if (isWeekend) {
                        // Weekend: always leave as 0 (no auto-fill)
                        autoFilledLogs[pid][dayInfo.date] = 0
                    } else if (baseRate > 0) {
                        // Weekday: Auto-fill with rate (apply 2x for Thursday)
                        const multiplier = dayInfo.isDouble ? 2 : 1
                        autoFilledLogs[pid][dayInfo.date] = baseRate * multiplier
                    } else {
                        // No rate defined, leave as 0
                        autoFilledLogs[pid][dayInfo.date] = 0
                    }
                })
            })
            
            logs.value = autoFilledLogs
            dataLoaded.value = true
            
            // Check if there are any non-zero values (auto-filled data)
            let hasAutoFilledData = false
            for (const pid in autoFilledLogs) {
                for (const date in autoFilledLogs[pid]) {
                    if (autoFilledLogs[pid][date] > 0) {
                        hasAutoFilledData = true
                        break
                    }
                }
                if (hasAutoFilledData) break
            }
            
            // If auto-filled data exists and no saved logs, mark as changed
            hasChanges.value = hasAutoFilledData && (!res.data.logs || Object.keys(res.data.logs).length === 0)
            
            toast.success(`Data periode ${startDate.value} s/d ${endDate.value} berhasil dimuat`)
        } catch (e) {
            console.error(e)
            toast.error("Gagal memuat data")
        } finally {
            loading.value = false
        }
    }

    const fetchData = async () => {
        loading.value = true
        try {
            const res = await salaryLogService.getSalaryLogs({
                start_date: startDate.value,
                end_date: endDate.value
            })
            employees.value = res.data.pegawai
            // Initialize logs properly so reactivity works if keys are missing
            // But we can just use the response mapped
            
            // To ensure local edits work, we might need a deep copy or just use the response
            // The response structure from backend is logs[pegawai_id][date] = { amount, note }
            // Let's flatten/simplify for the view to logs[pegawai_id][date] = amount.
            // And keep a separate changes tracker.
            
            const fetchedLogs = {}
            if (res.data.logs) {
                 for (const pid in res.data.logs) {
                     fetchedLogs[pid] = {}
                     for (const d in res.data.logs[pid]) {
                         fetchedLogs[pid][d] = res.data.logs[pid][d].amount
                     }
                 }
            }
            logs.value = fetchedLogs
            
            // Handle Rates
            rates.value = res.data.rates || {}
            
            // Extract distinct Jabatans from employees for the Rate Modal
            const distinctJabatans = [...new Set(res.data.pegawai.map(p => p.jabatan))].filter(Boolean).sort()
            
            rateList.value = distinctJabatans.map(j => ({
                jabatan: j,
                amount: rates.value[j] ? parseFloat(rates.value[j]) : 0
            }))
            
            hasChanges.value = false
        } catch (e) {
            toast.error("Gagal memuat data")
        } finally {
            loading.value = false
        }
    }

    const getAmount = (pegawaiId, date) => {
        if (!logs.value[pegawaiId]) return 0
        return logs.value[pegawaiId][date] || 0
    }

    // Toggle Presence Logic
    const togglePresence = (emp, dayInfo) => {
        const pid = emp.id_pegawai
        const currentDate = dayInfo.date
        const currentAmount = getAmount(pid, currentDate)
        
        if (currentAmount > 0) {
            // Already present? Remove it (toggle off)
             if (!logs.value[pid]) logs.value[pid] = {}
             logs.value[pid][currentDate] = 0
             hasChanges.value = true
        } else {
            // Not present? Set amount based on rate
            const baseRate = parseFloat(rates.value[emp.jabatan] || 0)
            
            if (baseRate <= 0) {
                toast.warning(`Nominal gaji untuk jabatan "${emp.jabatan}" belum diatur. Silakan atur di tombol "Atur Gaji".`)
                return
            }

            const multiplier = dayInfo.isDouble ? 2 : 1
            const finalAmount = baseRate * multiplier
            
            if (!logs.value[pid]) logs.value[pid] = {}
            logs.value[pid][currentDate] = finalAmount
            hasChanges.value = true
        }
    }
    
    const saveRates = async () => {
        try {
            loading.value = true
            await salaryLogService.saveRates(rateList.value)
            toast.success("Konfigurasi gaji disimpan")
            showRateModal.value = false
            fetchData() // Refresh to update local rates map
        } catch (e) {
            toast.error("Gagal menyimpan konfigurasi")
        } finally {
            loading.value = false
        }
    }

    const formatDisplay = (val) => {
        if (!val) return ''
        return new Intl.NumberFormat('id-ID').format(val)
    }

    const calculateTotalPresence = (pegawaiId) => {
        if (!logs.value[pegawaiId]) return 0
        let count = 0
        // Only count dates in current header range to be accurate to view
        dateHeaders.value.forEach(h => {
             if (logs.value[pegawaiId][h.date] > 0) count++
        })
        return count
    }

    const calculateTotalSalary = (pegawaiId) => {
        if (!logs.value[pegawaiId]) return 0
        let sum = 0
        dateHeaders.value.forEach(h => {
             sum += (logs.value[pegawaiId][h.date] || 0)
        })
        return sum
    }

    const calculateDailyTotal = (date) => {
        let sum = 0
        employees.value.forEach(emp => {
            if (logs.value[emp.id_pegawai]) {
                sum += (logs.value[emp.id_pegawai][date] || 0)
            }
        })
        return sum
    }
    
    const calculateGrandTotalPresence = () => {
        let total = 0
        employees.value.forEach(emp => {
            total += calculateTotalPresence(emp.id_pegawai)
        })
        return total
    }

    const calculateGrandTotalSalary = () => {
        let total = 0
        employees.value.forEach(emp => {
            const empTotal = calculateTotalSalary(emp.id_pegawai)
            total += empTotal
        })
        return total
    }

    const showResetModal = ref(false)

    const confirmResetPeriod = () => {
        showResetModal.value = true
    }

    const resetPeriod = () => {
        // Reset all logs to 0
        const emptyLogs = {}
        employees.value.forEach(emp => {
            const pid = emp.id_pegawai
            emptyLogs[pid] = {}
            dateHeaders.value.forEach(d => {
                emptyLogs[pid][d.date] = 0
            })
        })
        
        logs.value = emptyLogs
        hasChanges.value = true
        showResetModal.value = false
        
        toast.success(`Data periode ${startDate.value} s/d ${endDate.value} telah direset. Klik "Simpan" untuk menyimpan perubahan.`)
    }

    const saveData = async () => {
        loading.value = true
        try {
            const items = []
            // Iterate over all data in logs and prepare for bulk save
            // We only need to save what's in the current range
             employees.value.forEach(emp => {
                const pid = emp.id_pegawai
                if (logs.value[pid]) {
                    dateHeaders.value.forEach(h => {
                        const amount = logs.value[pid][h.date]
                        // We save even if 0, to effectively "delete" or zero it out if it was previously set
                        // Optimization: You could track only dirty cells, but bulk upsert is safe enough.
                        if (amount !== undefined) {
                            items.push({
                                pegawai_id: pid,
                                date: h.date,
                                amount: amount
                            })
                        }
                    })
                }
            })

            await salaryLogService.saveBulkLogs(items)
            toast.success("Berhasil disimpan via Bulk Upsert") // Technical term removed for user? "Berhasil disimpan"
            hasChanges.value = false
            // Optional: Refresh to conform data
        } catch (e) {
            toast.error("Gagal menyimpan")
        } finally {
            loading.value = false
        }
    }
    
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
    }

    const formatCurrencySimple = (val) => {
        if(!val) return '-'
        // Short format for daily totals columns to save space if needed, or just normal
        return new Intl.NumberFormat('id-ID').format(val)
    }

    const exportData = () => {
        // Build CSV Content
        let csv = 'No,Nama Relawan,Jabatan,'
        
        // Date Headers
        const dates = dateHeaders.value.map(d => `${d.dayName} ${d.formattedDate}`)
        csv += dates.join(',') + ',Total Hadir,Total Gaji\n'

        // Rows
        employees.value.forEach((emp, index) => {
            let row = `${index + 1},"${emp.nama_lengkap}","${emp.jabatan}",`
            // Amounts
            const amounts = dateHeaders.value.map(d => getAmount(emp.id_pegawai, d.date))
            row += amounts.join(',') + ','
            // Totals
            row += `${calculateTotalPresence(emp.id_pegawai)},"${calculateTotalSalary(emp.id_pegawai)}"\n`
            csv += row
        })

        // Footer Totals
        let footer = 'TOTAL,,PER HARI,'
        const dailyTotals = dateHeaders.value.map(d => calculateDailyTotal(d.date))
        footer += dailyTotals.join(',') + ','
        footer += `${calculateGrandTotalPresence()},"${calculateGrandTotalSalary()}"\n`
        csv += footer

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        if (link.download !== undefined) {
             const url = URL.createObjectURL(blob)
             link.setAttribute('href', url)
             link.setAttribute('download', `Laporan_Gaji_${startDate.value}_${endDate.value}.csv`)
             link.style.visibility = 'hidden'
             document.body.appendChild(link)
             link.click()
             document.body.removeChild(link)
        }
    }

    onMounted(() => {
        // Don't auto-load data, wait for user to select period and click "Tampilkan"
    })

    return {
        startDate, endDate,
        employees, dateHeaders,
        getAmount, formatDisplay, togglePresence,
        calculateTotalPresence, calculateTotalSalary,
        calculateDailyTotal, calculateGrandTotalPresence, calculateGrandTotalSalary,
        formatCurrency, formatCurrencySimple,
        saveData, fetchData, loading, hasChanges,
        exportData, 
        showRateModal, rateList, saveRates,
        dataLoaded, loadPeriodData,
        confirmResetPeriod, showResetModal, resetPeriod
    }
  }
}
</script>

<style scoped>
.custom-table th {
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}
.custom-table td {
    font-size: 0.85rem;
}
.input-wrapper {
    background-color: transparent;
    border-radius: 6px;
    width: 80px;
    transition: all 0.2s;
    border: 1px solid transparent;
}
.input-wrapper:hover, .input-wrapper:focus-within {
    background-color: #fff;
    border-color: #dee2e6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.input-wrapper.has-value {
    background-color: #f8fcf9;
    font-weight: 500;
    color: #198754;
}
.salary-input {
    font-size: 0.85rem;
    background-color: transparent;
    padding: 4px 0;
}
.salary-input:focus {
    /* remove default outline as we style wrapper */
    box-shadow: none; 
}
.salary-input::placeholder {
    color: #dee2e6;
}
.transition-hover:hover {
    background-color: #fafbfd;
}
</style>
