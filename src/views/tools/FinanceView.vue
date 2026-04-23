<template>
  <div class="finance-view">
    <!-- Header Section -->
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 class="mb-0 text-dark">
            <i class="bi bi-wallet2 text-primary me-2"></i>
            Buku Kas & Keuangan
          </h3>
          <p class="text-muted mb-0 mt-1 small">Dicatat manual seperti Petty Cash spreadsheet</p>
        </div>
      </div>
      
      <!-- Controls Row -->
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <!-- Month & Year Selectors -->
        <div class="d-flex gap-2 flex-grow-1 flex-md-grow-0">
          <select class="form-select" v-model="selectedMonth" @change="fetchData" style="min-width: 120px;">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
          <select class="form-select" v-model="selectedYear" @change="fetchData" style="min-width: 100px;">
            <option v-for="y in 5" :key="y" :value="2024 + y - 1">{{ 2024 + y - 1 }}</option>
          </select>
        </div>
        
        <!-- Add & Export Buttons -->
        <div class="d-flex gap-2 flex-grow-1 flex-md-grow-0">
          <button class="btn btn-primary rounded-pill px-4" @click="showAddModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            <span class="d-none d-sm-inline">Tambah Transaksi</span>
            <span class="d-inline d-sm-none">Tambah</span>
          </button>
          
          <div class="dropdown">
            <button 
              class="btn btn-outline-secondary rounded-pill px-3 dropdown-toggle" 
              type="button" 
              @click.stop="showExportMenu = !showExportMenu"
              :class="{ show: showExportMenu }"
            >
              <i class="bi bi-download me-1"></i> Export
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0" :class="{ show: showExportMenu }" style="display: block; visibility: visible; transform: translateY(10px); z-index: 9999;" v-if="showExportMenu">
              <li>
                <a class="dropdown-item py-2" href="#" @click.prevent="exportToExcel">
                  <i class="bi bi-file-earmark-excel text-success me-2"></i> Excel (.xlsx)
                </a>
              </li>
              <li>
                <a class="dropdown-item py-2" href="#" @click.prevent="exportToPDF">
                  <i class="bi bi-file-earmark-pdf text-danger me-2"></i> PDF (Cetak)
                </a>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item py-2" href="#" @click.prevent="exportToZip">
                  <i class="bi bi-file-earmark-zip text-warning me-2"></i> ZIP Bukti Nota (.zip)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Accounts Summary Card (Top Row) -->
    <div class="row mb-4">
        <div v-for="acc in accounts" :key="acc.id" class="col-md-3">
            <div class="card border-0 shadow-sm" :class="acc.type === 'cash' ? 'bg-gradient-success text-white' : 'bg-white'">
                <div class="card-body p-3">
                    <h6 class="mb-1 opacity-75">{{ acc.name }}</h6>
                    <h4 class="mb-0 fw-bold">{{ formatCurrency(acc.current_balance) }}</h4>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Spreadsheet Table -->
    <div class="card shadow-sm border-0">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-bordered mb-0 spreadsheet-table">
                    <thead class="table-primary text-center align-middle sticky-top">
                        <tr>
                            <th rowspan="2" style="width: 120px;">TANGGAL</th>
                            <th rowspan="2">KETERANGAN</th>
                            <th rowspan="2" style="width: 80px;">BANYAK</th>
                            <th rowspan="2" style="width: 80px;">AKSI</th>
                            <!-- Dynamic Columns for Accounts -->
                            <th v-for="acc in accounts" :key="acc.id" :colspan="acc.name === 'LIVIN' ? 4 : 2">
                                {{ acc.name }}
                            </th>
                        </tr>
                        <tr>
                            <!-- Subheaders for each account -->
                            <template v-for="acc in accounts" :key="'sub-'+acc.id">
                                <th class="text-success">HARGA</th> <!-- In/Out combined or just 'Harga' -->
                                <th v-if="acc.name === 'LIVIN'" class="text-danger" style="width: 100px;">ADMIN</th>
                                <th v-if="acc.name === 'LIVIN'" class="text-dark" style="width: 150px;">TOTAL</th>
                                <th class="text-primary" style="width: 150px;">SALDO</th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(dateGroup, date) in groupedTransactions" :key="date">
                            <!-- First Row of Date Group -->
                            <tr v-for="(item, index) in dateGroup" :key="item.id">
                                <!-- Date Column (Merged) -->
                                <td v-if="index === 0" :rowspan="dateGroup.length" class="text-center align-middle fw-bold bg-white">
                                    {{ formatDate(date) }}
                                </td>
                                
                                <!-- Description -->
                                <td>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <span>{{ item.description }}</span>
                                            <span v-if="item.evidence_path" class="ms-2 text-primary cursor-pointer" @click="previewEvidence(item)" title="Lihat Bukti Nota">
                                                <i class="bi bi-image"></i>
                                            </span>
                                        </div>
                                        <span v-if="item.category" class="badge bg-light text-secondary ms-2">{{ item.category }}</span>
                                    </div>
                                    <div v-if="item.type === 'transfer'" class="small text-muted fst-italic">
                                        Transfer ke {{ item.related_account?.name }}
                                    </div>
                                </td>

                                <!-- Quantity -->
                                <td class="text-center">{{ item.quantity || '-' }}</td>

                                <!-- Actions -->
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary border-0" @click="editTransaction(item)" title="Edit">
                                            <i class="bi bi-pencil-square"></i>
                                        </button>
                                        <button class="btn btn-outline-danger border-0" @click="deleteTransaction(item.id)" title="Hapus">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>

                                <!-- Dynamic Account Cells -->
                                <template v-for="acc in accounts" :key="'cell-'+acc.id">
                                    <!-- Logic: Is this transaction related to this account? -->
                                    <template v-if="item.account_id === acc.id || item.related_account_id === acc.id">
                                        <!-- Amount / Harga -->
                                        <td class="text-end" :class="getTransactionColor(item, acc)">
                                            {{ formatTransactionAmount(item, acc) }}
                                        </td>
                                        
                                        <!-- LIVIN Admin Fee -->
                                        <td v-if="acc.name === 'LIVIN'" class="text-end text-danger">
                                            {{ (item.account_id === acc.id && item.admin_fee > 0) ? formatCurrency(item.admin_fee) : '' }}
                                        </td>
                                        
                                        <!-- LIVIN Total -->
                                        <td v-if="acc.name === 'LIVIN'" class="text-end fw-semibold">
                                             {{ (item.account_id === acc.id) ? formatTotal(item) : '' }}
                                        </td>
                                        
                                        <!-- Running Balance (Simplified for now - Using current, ideally needs historical calculation) -->
                                        <td class="text-end text-muted small bg-light">
                                            <!-- Note: Real spreadsheet needs recursive calculation. For now showing placeholder/current -->
                                            -
                                        </td>
                                    </template>
                                    <template v-else>
                                        <td></td> <!-- Empty -->
                                        <td v-if="acc.name === 'LIVIN'"></td>
                                        <td v-if="acc.name === 'LIVIN'"></td>
                                        <td class="bg-light"></td>
                                    </template>
                                </template>
                            </tr>
                        </template>
                        <tr v-if="Object.keys(groupedTransactions).length === 0">
                            <td :colspan="3 + accounts.length * 3" class="text-center py-5 text-muted">
                                Belum ada transaksi bulan ini
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showAddModal" class="modal-backdrop fade show"></div>
    <div v-if="showAddModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Catat Transaksi</h5>
                    <button type="button" class="btn-close" @click="showAddModal = false"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                         <h6 class="text-primary fw-bold mb-0">
                             {{ form.id ? 'Edit Transaksi' : 'Transaksi Baru' }}
                         </h6>
                         <span v-if="form.id" class="badge bg-warning text-dark">Mode Edit</span>
                    </div>

                    <ul class="nav nav-pills mb-3 nav-fill">
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: form.mode === 'out'}" @click="form.mode = 'out'" href="#">Pengeluaran</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: form.mode === 'in'}" @click="form.mode = 'in'" href="#">Pemasukan</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: form.mode === 'transfer'}" @click="form.mode = 'transfer'" href="#">Transfer / Tarik Tunai</a>
                        </li>
                    </ul>

                    <form @submit.prevent="submitTransaction">
                        <div class="mb-3">
                            <label class="form-label">Tanggal</label>
                            <input type="date" class="form-control" v-model="form.date" required>
                        </div>
                        
                        <!-- Account Selection -->
                        <div v-if="form.mode !== 'transfer'" class="mb-3">
                            <label class="form-label">Akun</label>
                            <select class="form-select" v-model="form.account_id" required>
                                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                            </select>
                        </div>

                        <!-- Transfer Logic -->
                        <div v-else class="row mb-3">
                            <div class="col-6">
                                <label class="form-label">Dari</label>
                                <select class="form-select" v-model="form.from_account_id" required>
                                    <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label class="form-label">Ke</label>
                                <select class="form-select" v-model="form.to_account_id" required>
                                    <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Keterangan</label>
                            <input type="text" class="form-control" v-model="form.description" placeholder="Contoh: Bensin, Token Listrik" required>
                        </div>

                        <div class="row">
                             <div class="col-md-6 mb-3">
                                <label class="form-label">Nominal (Rp)</label>
                                <div class="input-group">
                                    <span class="input-group-text">Rp</span>
                                    <input type="text" class="form-control" 
                                        :value="displayAmount" 
                                        @input="e => updateCurrencyValue(e, 'amount')"
                                        placeholder="0" required>
                                </div>
                            </div>
                             <div class="col-md-6 mb-3" v-if="form.mode !== 'in'">
                                <label class="form-label">Biaya Admin (Rp)</label>
                                <div class="input-group">
                                    <span class="input-group-text">Rp</span>
                                    <input type="text" class="form-control" 
                                        :value="displayAdminFee" 
                                        @input="e => updateCurrencyValue(e, 'admin_fee')"
                                        placeholder="0">
                                </div>
                            </div>
                        </div>

                         <div class="mb-3">
                            <label class="form-label">Foto Bukti Nota (Opsional)</label>
                            <input type="file" class="form-control" @change="onFileSelected" accept="image/*,.pdf">
                            <div v-if="form.id && itemBeingEdited?.evidence_path" class="form-text text-success">
                                <i class="bi bi-check-circle-fill me-1"></i> Sudah ada bukti nota. Pilih file baru untuk mengganti.
                            </div>
                         </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" :disabled="loading">
                            <i class="bi bi-save me-2"></i>
                            {{ form.id ? 'Perbarui' : 'Simpan' }} Transaksi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Evidence Preview Modal -->
    <div v-if="previewUrl" class="modal-backdrop fade show" @click="previewUrl = null"></div>
    <div v-if="previewUrl" class="modal fade show d-block" tabindex="-1" @click="previewUrl = null">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 bg-transparent shadow-none" @click.stop>
                <div class="modal-header border-0 p-0 mb-2">
                    <button type="button" class="btn-close btn-close-white ms-auto" @click="previewUrl = null"></button>
                </div>
                <div class="modal-body p-0 text-center">
                    <img :src="previewUrl" class="img-fluid rounded shadow-lg" style="max-height: 85vh;" alt="Evidence Preview">
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import financeService from '@/services/financeService'
import apiClient from '@/services/api'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'FinanceView',
  setup() {
    const toast = useToast()
    const loading = ref(false)
    const accounts = ref([])
    const groupedTransactions = ref({})
    const showAddModal = ref(false)
    const showExportMenu = ref(false)
    
    // Filters
    const selectedMonth = ref(new Date().getMonth() + 1)
    const selectedYear = ref(new Date().getFullYear())

    // Form
    const form = ref({
        id: null,
        mode: 'out', // in, out, transfer
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        admin_fee: 0,
        account_id: '',
        from_account_id: '',
        to_account_id: '',
        category: '',
        quantity: '',
        evidence_file: null
    })

    const itemBeingEdited = ref(null)
    const previewUrl = ref(null)

    const onFileSelected = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        // If it's not an image (e.g. PDF), don't compress
        if (!file.type.startsWith('image/')) {
            form.value.evidence_file = file
            return
        }

        // Compress image
        try {
            loading.value = true
            const compressedFile = await compressImage(file)
            form.value.evidence_file = compressedFile
        } catch (e) {
            console.error('Compression failed:', e)
            form.value.evidence_file = file // Fallback to original
        } finally {
            loading.value = false
        }
    }

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (e) => {
                const img = new Image()
                img.src = e.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    // Max dimensions
                    const MAX_WIDTH = 1280
                    const MAX_HEIGHT = 1280

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Convert to blob with 0.7 quality
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        })
                        resolve(compressedFile)
                    }, 'image/jpeg', 0.7)
                }
                img.onerror = reject
            }
            reader.onerror = reject
        })
    }

    const previewEvidence = (item) => {
        let baseUrl = apiClient.defaults.baseURL || ''
        
        // If relative path, prepend the likely backend host
        if (baseUrl.startsWith('/')) {
            const host = import.meta.env.VITE_API_HOST || 'http://localhost:8000'
            baseUrl = host + baseUrl
        }
        
        baseUrl = baseUrl.replace('/api/v1', '').replace('/api', '')
        previewUrl.value = `${baseUrl}/storage/${item.evidence_path}`
        console.log('Previewing evidence at:', previewUrl.value)
    }

    // Computed properties for display
    const displayAmount = computed(() => {
        if (!form.value.amount) return ''
        return new Intl.NumberFormat('id-ID').format(form.value.amount)
    })

    const displayAdminFee = computed(() => {
        if (!form.value.admin_fee) return ''
        return new Intl.NumberFormat('id-ID').format(form.value.admin_fee)
    })

    const updateCurrencyValue = (event, field) => {
        // Remove non-numeric characters
        const cleanVal = event.target.value.replace(/\D/g, '')
        // Update the form model with the number
        form.value[field] = cleanVal ? parseInt(cleanVal) : ''
        
        // Force the input display to update even if the visual value hasn't "changed" in Vue's eyes (e.g. typing 'a')
        // We do this by forcing a re-render of the value binding via nextTick or simply letting Vue handle the :value binding
        // But simply relying on :value binding sometimes behaves weirdly with cursor position.
        // For simple currency, replacing the input value directly is often smoother for UX
        const formatted = cleanVal ? new Intl.NumberFormat('id-ID').format(cleanVal) : ''
        event.target.value = formatted
    }

    const fetchAccounts = async () => {
        try {
            const res = await financeService.getAccounts()
            accounts.value = res.data
            // Set default account if available
            if(accounts.value.length > 0) {
                form.value.account_id = accounts.value[0].id
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchData = async () => {
        try {
            loading.value = true
            const res = await financeService.getLedgerData({
                month: selectedMonth.value,
                year: selectedYear.value
            })
            groupedTransactions.value = res.data.transactions
            // Also refresh accounts to update balances
            accounts.value = res.data.accounts
        } catch (e) {
            toast.error("Gagal memuat data keuangan")
        } finally {
            loading.value = false
        }
    }

    const submitTransaction = async () => {
        loading.value = true
        try {
            const formData = new FormData()
            formData.append('date', form.value.date)
            formData.append('description', form.value.description)
            formData.append('amount', form.value.amount)
            formData.append('admin_fee', form.value.admin_fee || 0)
            formData.append('category', form.value.category || '')
            formData.append('quantity', form.value.quantity || '')
            
            if (form.value.evidence_file) {
                formData.append('evidence', form.value.evidence_file)
            }

            if (form.value.mode === 'transfer') {
                formData.append('type', 'transfer')
                formData.append('from_account_id', form.value.from_account_id)
                formData.append('to_account_id', form.value.to_account_id)
            } else {
                formData.append('type', form.value.mode)
                formData.append('account_id', form.value.account_id)
            }

            if (form.value.id) {
                // UPDATE MODE - Laravel spoofing
                formData.append('_method', 'PUT')
                if (form.value.mode === 'transfer') {
                    formData.append('account_id', form.value.from_account_id)
                    formData.append('related_account_id', form.value.to_account_id)
                }

                await financeService.updateTransaction(form.value.id, formData)
                toast.success("Transaksi berhasil diperbarui")

            } else {
                // CREATE MODE
                if (form.value.mode === 'transfer') {
                    await financeService.createTransfer(formData)
                } else {
                    await financeService.createTransaction(formData)
                }
                toast.success("Transaksi berhasil disimpan")
            }
            
            showAddModal.value = false
            resetForm()
            fetchData()
        } catch (e) {
            console.error(e)
            toast.error("Gagal menyimpan transaksi")
        } finally {
            loading.value = false
        }
    }

    const editTransaction = (item) => {
        itemBeingEdited.value = item
        form.value = {
            id: item.id,
            mode: item.type, // 'in', 'out', 'transfer'
            date: item.date,
            description: item.description,
            amount: parseFloat(item.amount),
            admin_fee: parseFloat(item.admin_fee || 0),
            category: item.category,
            quantity: item.quantity,
            // Account mapping
            account_id: item.account_id,
            from_account_id: item.type === 'transfer' ? item.account_id : '',
            to_account_id: item.type === 'transfer' ? item.related_account_id : '',
            evidence_file: null
        }
        showAddModal.value = true
    }

    const deleteTransaction = async (id) => {
        if(!confirm('Apakah anda yakin ingin menghapus transaksi ini? Saldo akan dikembalikan otomatis.')) return;

        try {
            loading.value = true
            await financeService.deleteTransaction(id)
            toast.success("Transaksi berhasil dihapus")
            fetchData()
        } catch(e) {
             toast.error("Gagal menghapus transaksi")
        } finally {
            loading.value = false
        }
    }

    const resetForm = () => {
        form.value = {
            id: null,
            mode: 'out',
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            admin_fee: 0,
            account_id: accounts.value[0]?.id || '',
            from_account_id: '',
            to_account_id: '',
            category: '',
            quantity: '',
            evidence_file: null
        }
        itemBeingEdited.value = null
    }

    // formatting helpers
    const formatCurrency = (val) => {
        if (!val) return 'Rp 0'
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
    }

    const formatDate = (dateStr) => {
        const options = { weekday: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }

    const getMonthName = (m) => {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return months[m-1];
    }

    const getTransactionColor = (item, acc) => {
        // If it's this account
        if (item.account_id === acc.id) {
             if (item.type === 'in') return 'text-primary fw-bold'; // Income
             if (item.type === 'out') return 'text-danger'; // Expense
             if (item.type === 'transfer') return 'text-danger'; // Outgoing transfer
        }
        // If it's related account (receiving transfer)
        if (item.related_account_id === acc.id && item.type === 'transfer') {
            return 'text-success fw-bold'; // Incoming transfer
        }
        return '';
    }

    const formatTransactionAmount = (item, acc) => {
        let amount = parseFloat(item.amount);
        if (item.account_id === acc.id) {
            // It's the primary account involved
            return formatCurrency(amount);
        }
        if (item.related_account_id === acc.id) {
            // It's receiving the transfer
            return formatCurrency(amount);
        }
        return '';
    }
    
    const formatTotal = (item) => {
        return formatCurrency(parseFloat(item.amount) + parseFloat(item.admin_fee || 0))
    }

    const exportToExcel = () => {
        try {
            const data = []
            // Header
            const headers = ['Tanggal', 'Keterangan', 'Banyak']
            accounts.value.forEach(acc => {
                headers.push(`${acc.name} - Harga`)
                if (acc.name === 'LIVIN') {
                    headers.push(`${acc.name} - Admin`)
                    headers.push(`${acc.name} - Total`)
                }
            })
            data.push(headers)

            // Data rows
            Object.entries(groupedTransactions.value).forEach(([date, transactions]) => {
                transactions.forEach(item => {
                    const row = [date, item.description, item.quantity || '-']
                    
                    accounts.value.forEach(acc => {
                        const isRelated = item.account_id === acc.id || item.related_account_id === acc.id
                        if (isRelated) {
                            row.push(item.amount)
                            if (acc.name === 'LIVIN') {
                                row.push(item.admin_fee || 0)
                                row.push(parseFloat(item.amount) + parseFloat(item.admin_fee || 0))
                            }
                        } else {
                            row.push('')
                            if (acc.name === 'LIVIN') {
                                row.push('')
                                row.push('')
                            }
                        }
                    })
                    data.push(row)
                })
            })

            const ws = XLSX.utils.aoa_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Buku Kas")
            XLSX.writeFile(wb, `Buku_Kas_${selectedMonth.value}_${selectedYear.value}.xlsx`)
            toast.success("Excel berhasil diunduh")
        } catch (e) {
            console.error(e)
            toast.error("Gagal export Excel")
        }
    }

    const exportToPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            // Title & Header
            doc.setFontSize(18)
            doc.setTextColor(40)
            doc.text("LAPORAN BUKU KAS & KEUANGAN", 14, 15)
            
            doc.setFontSize(11)
            doc.setTextColor(100)
            doc.text(`Periode: ${getMonthName(selectedMonth.value)} ${selectedYear.value}`, 14, 22)
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 27)

            // Accounts Summary Section
            let startY = 35
            doc.setFontSize(10)
            doc.setTextColor(0)
            doc.text("RINGKASAN SALDO AKUN:", 14, startY)
            
            accounts.value.forEach((acc, i) => {
                doc.text(`${acc.name}: ${formatCurrency(acc.current_balance)}`, 14 + (i * 60), startY + 7)
            })

            // Table Data Preparation
            const head = []
            const firstHeaderRow = [
                { content: 'TANGGAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'KETERANGAN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'QTY', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            ]
            
            const secondHeaderRow = []

            accounts.value.forEach(acc => {
                const colSpan = acc.name === 'LIVIN' ? 3 : 1
                firstHeaderRow.push({ 
                    content: acc.name, 
                    colSpan: colSpan, 
                    styles: { halign: 'center' } 
                })
                
                if (acc.name === 'LIVIN') {
                    secondHeaderRow.push({ content: 'HARGA', styles: { halign: 'center' } })
                    secondHeaderRow.push({ content: 'ADMIN', styles: { halign: 'center' } })
                    secondHeaderRow.push({ content: 'TOTAL', styles: { halign: 'center' } })
                } else {
                    secondHeaderRow.push({ content: 'HARGA', styles: { halign: 'center' } })
                }
            })
            
            head.push(firstHeaderRow)
            head.push(secondHeaderRow)

            const body = []
            Object.entries(groupedTransactions.value).forEach(([date, transactions]) => {
                transactions.forEach((item, idx) => {
                    const row = []
                    row.push(idx === 0 ? formatDate(date) : '')
                    row.push(item.description)
                    row.push(item.quantity || '-')
                    
                    accounts.value.forEach(acc => {
                        const isPrimary = item.account_id === acc.id
                        const isRelated = item.related_account_id === acc.id
                        
                        if (isPrimary || isRelated) {
                            row.push(formatCurrency(item.amount).replace('Rp', '').trim())
                            if (acc.name === 'LIVIN') {
                                row.push(isPrimary ? formatCurrency(item.admin_fee || 0).replace('Rp', '').trim() : '')
                                row.push(isPrimary ? formatCurrency(parseFloat(item.amount) + parseFloat(item.admin_fee || 0)).replace('Rp', '').trim() : '')
                            }
                        } else {
                            row.push('')
                            if (acc.name === 'LIVIN') {
                                row.push('')
                                row.push('')
                            }
                        }
                    })
                    body.push(row)
                })
            })

            // Generate Table
            autoTable(doc, {
                head: head,
                body: body,
                startY: startY + 15,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 30 },
                didDrawPage: (data) => {
                    // Footer
                    const str = "Halaman " + doc.internal.getNumberOfPages()
                    doc.setFontSize(8)
                    doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10)
                }
            })

            doc.save(`Laporan_Buku_Kas_${selectedMonth.value}_${selectedYear.value}.pdf`)
            toast.success("PDF berhasil diunduh")
        } catch (e) {
            console.error(e)
            toast.error("Gagal export PDF")
        }
    }

    const exportToZip = async () => {
        try {
            loading.value = true
            await financeService.exportEvidence({
                month: selectedMonth.value,
                year: selectedYear.value
            })
            toast.success("ZIP bukti nota berhasil diunduh")
        } catch (e) {
            console.error(e)
            toast.error(e.message || "Gagal mengunduh ZIP bukti nota")
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        fetchAccounts().then(() => fetchData())
    })

    return {
        accounts,
        groupedTransactions,
        showAddModal,
        form,
        loading,
        selectedMonth,
        selectedYear,
        submitTransaction,
        formatCurrency,
        formatDate,
        getMonthName,
        fetchData,
        getTransactionColor,
        formatTransactionAmount,
        formatTotal,
        editTransaction,
        deleteTransaction,
        displayAmount,
        displayAdminFee,
        updateCurrencyValue,
        onFileSelected,
        previewEvidence,
        previewUrl,
        itemBeingEdited,
        exportToExcel,
        exportToPDF,
        exportToZip,
        showExportMenu
    }
  }
}
</script>

<style scoped>
.spreadsheet-table {
    font-size: 0.9rem;
}
.spreadsheet-table th {
    background-color: #f0f4f8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.spreadsheet-table td {
    vertical-align: middle;
}
.bg-gradient-success {
    background: linear-gradient(135deg, #42e695 0%, #3bb2b8 100%);
}
.modal-backdrop {
    opacity: 0.5;
    background-color: #000;
}
.cursor-pointer {
    cursor: pointer;
}
.cursor-pointer:hover {
    color: var(--primary-dark) !important;
}

@media print {
    .btn, .dropdown, .nav-pills, .mb-4 p, .mb-4 h3 i {
        display: none !important;
    }
    .finance-view {
        padding: 0 !important;
        margin: 0 !important;
    }
    .card {
        box-shadow: none !important;
        border: none !important;
    }
    .spreadsheet-table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 8pt !important;
    }
    .spreadsheet-table th, .spreadsheet-table td {
        border: 1px solid #000 !important;
        padding: 4px !important;
    }
    .spreadsheet-table th {
        background-color: #f0f0f0 !important;
        -webkit-print-color-adjust: exact;
    }
    @page {
        size: landscape;
        margin: 0.5cm;
    }
}
</style>
