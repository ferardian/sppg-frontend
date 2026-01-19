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
        
        <!-- Add Button -->
        <button class="btn btn-primary rounded-pill px-4 flex-grow-1 flex-md-grow-0" @click="showAddModal = true">
          <i class="bi bi-plus-circle me-2"></i>
          <span class="d-none d-sm-inline">Tambah Transaksi</span>
          <span class="d-inline d-sm-none">Tambah</span>
        </button>
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
                                    <div class="d-flex justify-content-between">
                                        <span>{{ item.description }}</span>
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

                         <div class="row" v-if="form.mode !== 'transfer'">
                             <div class="col-md-6 mb-3">
                                <label class="form-label">Kategori (Opsional)</label>
                                <input type="text" class="form-control" v-model="form.category" placeholder="Operasional">
                            </div>
                             <div class="col-md-6 mb-3">
                                <label class="form-label">Banyak (Qty)</label>
                                <input type="number" class="form-control" v-model="form.quantity" min="1" placeholder="1">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                            Simpan Transaksi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import financeService from '@/services/financeService'
import { useToast } from 'vue-toastification'

export default {
  name: 'FinanceView',
  setup() {
    const toast = useToast()
    const loading = ref(false)
    const accounts = ref([])
    const groupedTransactions = ref({})
    const showAddModal = ref(false)
    
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
        quantity: ''
    })

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
            const payload = {
                date: form.value.date,
                description: form.value.description,
                amount: form.value.amount,
                admin_fee: form.value.admin_fee,
                category: form.value.category,
                quantity: form.value.quantity
            }

            if (form.value.mode === 'transfer') {
                 Object.assign(payload, {
                    type: 'transfer',
                    from_account_id: form.value.from_account_id,
                    to_account_id: form.value.to_account_id
                 })
                 // Rename for API consistency if needed, but the API expects slightly diff structure for transfer helper
                 // Actually, update uses generic structure, createTransfer uses specific. 
                 // Let's align: Update uses general update endpoint. Create uses specific.
            } else {
                 Object.assign(payload, {
                    type: form.value.mode, // 'in' or 'out'
                    account_id: form.value.account_id
                 })
            }

            if (form.value.id) {
                // UPDATE MODE
                // For update, we map fields to what the API expects
                const updatePayload = {
                    ...payload,
                    account_id: form.value.mode === 'transfer' ? form.value.from_account_id : form.value.account_id,
                    related_account_id: form.value.mode === 'transfer' ? form.value.to_account_id : null
                }
                
                await financeService.updateTransaction(form.value.id, updatePayload)
                toast.success("Transaksi berhasil diperbarui")

            } else {
                // CREATE MODE
                if (form.value.mode === 'transfer') {
                    await financeService.createTransfer({
                        ...payload,
                        from_account_id: form.value.from_account_id,
                        to_account_id: form.value.to_account_id
                    })
                } else {
                    await financeService.createTransaction({
                        ...payload,
                        type: form.value.mode,
                        account_id: form.value.account_id
                    })
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
            to_account_id: item.type === 'transfer' ? item.related_account_id : ''
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
            category: '',
            quantity: ''
        }
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
        updateCurrencyValue
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
</style>
