<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-basket text-primary me-2"></i>
          Data Bahan Baku
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data bahan baku SPPG</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        @click="showAddForm = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Bahan Baku
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data bahan baku...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchBahanBakuData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasBahanBakuData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-basket text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Bahan Baku</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data bahan baku pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Bahan Baku Pertama
        </button>
      </div>
    </div>

    <!-- Form tambah bahan baku -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Data Bahan Baku' : 'Tambah Data Bahan Baku' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveBahanBaku">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kode Bahan Baku</label>
              <input
                v-model="form.kode_bahan_baku"
                type="text"
                class="form-control"
                placeholder="Kode otomatis"
                :readonly="!editingId"
                required
              >
              <small class="text-muted">Kode otomatis dengan format B000001</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Bahan Baku</label>
              <input
                v-model="form.nama_bahan_baku"
                type="text"
                class="form-control"
                placeholder="Masukkan nama bahan baku"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kategori</label>
              <select
                v-model="form.kategori"
                class="form-select"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="Sayuran">Sayuran</option>
                <option value="Buah">Buah</option>
                <option value="Daging">Daging</option>
                <option value="Ikan">Ikan</option>
                <option value="Telur">Telur</option>
                <option value="Susu">Susu</option>
                <option value="Biji-bijian">Biji-bijian</option>
                <option value="Umbi-umbian">Umbi-umbian</option>
                <option value="Minyak">Minyak</option>
                <option value="Bumbu">Bumbu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Satuan</label>
              <select
                v-model="form.satuan"
                class="form-select"
                required
              >
                <option value="">Pilih Satuan</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Mililiter (ml)</option>
                <option value="buah">Buah</option>
                <option value="butir">Butir</option>
                <option value="ons">Ons</option>
                <option value="pack">Pack</option>
                <option value="karung">Karung</option>
                <option value="kotak">Kotak</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Stok Minimal</label>
              <input
                v-model="form.stok_minimal"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="Masukkan stok minimal"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Harga</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  v-model="form.harga"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="Masukkan harga per satuan"
                >
              </div>
              <small class="text-muted">Harga per satuan dasar (misal: per kg, per liter, per pcs)</small>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Status</label>
              <select
                v-model="form.status"
                class="form-select"
                required
              >
                <option value="">Pilih Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Keterangan</label>
              <textarea
                v-model="form.keterangan"
                class="form-control"
                rows="3"
                placeholder="Masukkan keterangan (opsional)"
              ></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="cancelAdd" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <i v-if="loading" class="bi bi-arrow-repeat me-2 spin"></i>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabel data bahan baku -->
    <div v-if="hasBahanBakuData" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-basket me-2"></i>
            Data Bahan Baku
          </h5>
          <span class="badge bg-white text-primary">
            {{ bahanBakuData.length }} Data
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0">
                  <i class="bi bi-hash me-1"></i>Kode
                </th>
                <th class="border-0">
                  <i class="bi bi-tag me-1"></i>Nama Bahan Baku
                </th>
                <th class="border-0">
                  <i class="bi bi-grid me-1"></i>Kategori
                </th>
                <th class="border-0">
                  <i class="bi bi-speedometer me-1"></i>Satuan
                </th>
                <th class="border-0">
                  <i class="bi bi-exclamation-triangle me-1"></i>Stok Minimal
                </th>
                <th class="border-0">
                  <i class="bi bi-currency-exchange me-1"></i>Harga
                </th>
                <th class="border-0">
                  <i class="bi bi-bar-chart me-1"></i>Stok Akhir
                </th>
                <th class="border-0">
                  <i class="bi bi-toggle-on me-1"></i>Status
                </th>
                <th class="border-0 text-center" style="width: 120px;">
                  <i class="bi bi-gear me-1"></i>Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bahanBakuData" :key="item.id_bahan_baku" class="align-middle">
                <td>
                  <span class="fw-bold text-primary px-2 py-1" style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px;">
                    {{ item.kode_bahan_baku }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nama_bahan_baku }}</div>
                  <small class="text-muted">{{ item.keterangan || '-' }}</small>
                </td>
                <td>
                  <span class="badge bg-info px-2 py-1">
                    {{ item.kategori }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-speedometer2 text-success me-2"></i>
                    <span>{{ item.satuan }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-diamond text-warning me-2"></i>
                    <span class="fw-semibold">{{ item.stok_minimal }} {{ item.satuan }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-cash-coin text-success me-2"></i>
                    <span class="fw-semibold text-success" v-if="item.harga">
                      {{ formatCurrency(item.harga) }}
                    </span>
                    <span class="text-muted" v-else>
                      <small>Belum ada harga</small>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i :class="getStokStatusClass(item.stok_akhir, item.stok_minimal)" class="me-2"></i>
                    <span class="fw-semibold" :class="getStokTextColor(item.stok_akhir, item.stok_minimal)">
                      {{ formatNumber(item.stok_akhir || 0) }} {{ item.satuan }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge px-2 py-1" :class="item.status === 'aktif' ? 'bg-success' : 'bg-warning'">
                    {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editBahanBaku(item)"
                      :title="'Edit ' + item.nama_bahan_baku"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteBahanBaku(item.id_bahan_baku)"
                      :title="'Hapus ' + item.nama_bahan_baku"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import bahanBakuService from '@/services/bahanBakuService'
import stokOpnameService from '@/services/stokOpnameService'

export default {
  name: 'BahanBakuView',
  setup() {
    // State management
    const showAddForm = ref(false)
    const bahanBakuData = ref([])
    const loading = ref(false)
    const error = ref('')

    // Form data
    const form = ref({
      kode_bahan_baku: '',
      nama_bahan_baku: '',
      kategori: '',
      satuan: '',
      stok_minimal: '',
      harga: '',
      status: '',
      keterangan: ''
    })

    const editingId = ref(null)

    // Computed properties
    const hasBahanBakuData = computed(() => {
      return bahanBakuData.value.length > 0
    })

    // Methods
    const fetchBahanBakuData = async () => {
      try {
        loading.value = true
        error.value = ''

        // Fetch both bahan baku data and current stock
        const [bahanBakuResponse, stokResponse] = await Promise.all([
          bahanBakuService.getAll(),
          stokOpnameService.getLatestStock().catch(() => ({ data: [] }))
        ])

        // Handle different response structures
        let bahanBaku = bahanBakuResponse.data || bahanBakuResponse.data?.data || bahanBakuResponse || []
        const latestStocks = stokResponse.data || stokResponse.data?.data || []

        // Merge current stock data into bahan baku data
        bahanBakuData.value = bahanBaku.map(bahan => {
          const latestStock = latestStocks.find(stock => stock.id_bahan_baku === bahan.id_bahan_baku)
          return {
            ...bahan,
            stok_akhir: latestStock ? parseFloat(latestStock.stok_akhir) || 0 : 0
          }
        })

        console.log('Bahan Baku data fetched with stock:', bahanBakuData.value)
      } catch (err) {
        error.value = 'Gagal memuat data bahan baku: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching bahan baku data:', err)
      } finally {
        loading.value = false
      }
    }

    const saveBahanBaku = async () => {
      try {
        loading.value = true

        console.log('Form data to be saved:', form.value)

        let response
        if (editingId.value) {
          response = await bahanBakuService.update(editingId.value, form.value)
          const index = bahanBakuData.value.findIndex(item => item.id_bahan_baku === editingId.value)
          if (index !== -1) {
            bahanBakuData.value[index] = response.data || response
          }
        } else {
          response = await bahanBakuService.create(form.value)
          console.log('Create response:', response)

          // Add the new item to the array
          const newItem = response.data || response
          if (newItem) {
            bahanBakuData.value.push(newItem)
            console.log('Updated bahanBakuData:', bahanBakuData.value)
          }
        }

        // Reset form and close
        resetForm()
        showAddForm.value = false
        editingId.value = null

        console.log('Bahan Baku saved successfully:', response)

        // Optional: Refresh data to ensure sync
        await fetchBahanBakuData()
      } catch (err) {
        console.error('Error saving bahan baku:', err)
        if (err.response?.data?.errors) {
          console.error('Validation errors:', err.response.data.errors)
          const errorMessages = Object.values(err.response.data.errors).flat()
          alert('Validasi gagal: ' + errorMessages.join(', '))
        } else {
          alert('Gagal menyimpan data bahan baku: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        loading.value = false
      }
    }

    const editBahanBaku = (item) => {
      // Isi form dengan data yang akan diedit
      console.log('Original bahan baku data:', item)
      console.log('Form before edit:', form.value)

      // Pastikan semua field terisi dengan data dari API
      form.value = {
        kode_bahan_baku: item.kode_bahan_baku || '',
        nama_bahan_baku: item.nama_bahan_baku || '',
        kategori: item.kategori || '',
        satuan: item.satuan || '',
        stok_minimal: item.stok_minimal || '',
        harga: item.harga || '',
        status: item.status || '',
        keterangan: item.keterangan || ''
      }

      editingId.value = item.id_bahan_baku
      showAddForm.value = true
      console.log('Form after edit:', form.value)
    }

    const deleteBahanBaku = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus data bahan baku ini?')) {
        try {
          loading.value = true
          await bahanBakuService.delete(id)
          bahanBakuData.value = bahanBakuData.value.filter(item => item.id_bahan_baku !== id)
          console.log('Bahan Baku deleted with id:', id)
        } catch (err) {
          console.error('Error deleting bahan baku:', err)
          alert('Gagal menghapus data bahan baku')
        } finally {
          loading.value = false
        }
      }
    }

    const cancelAdd = () => {
      resetForm()
      showAddForm.value = false
      editingId.value = null
    }

    // Watch for showAddForm changes to generate kode automatically
    watch(showAddForm, (newValue) => {
      if (newValue && !editingId.value) {
        // Generate kode when opening form for new data
        form.value.kode_bahan_baku = generateKodeBahanBaku()
      }
    })

  const generateKodeBahanBaku = () => {
      // Get the latest kode from existing data to determine next number
      const latestKode = bahanBakuData.value.reduce((max, item) => {
        const currentNum = parseInt(item.kode_bahan_baku?.replace('B', '') || '0')
        return currentNum > max ? currentNum : max
      }, 0)

      const nextNumber = latestKode + 1
      return `B${nextNumber.toString().padStart(6, '0')}`
    }

    const resetForm = () => {
      form.value = {
        kode_bahan_baku: '',
        nama_bahan_baku: '',
        kategori: '',
        satuan: '',
        stok_minimal: '',
        harga: '',
        status: '',
        keterangan: ''
      }
    }

    // Helper methods for stock display
    const formatNumber = (num) => {
      return num ? parseFloat(num).toLocaleString('id-ID') : '0'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const getStokStatusClass = (stokAkhir, stokMinimal) => {
      const stok = parseFloat(stokAkhir) || 0
      const minimal = parseFloat(stokMinimal) || 0

      if (stok === 0) return 'bi bi-exclamation-triangle-fill text-danger'
      if (stok <= minimal) return 'bi bi-exclamation-triangle-fill text-warning'
      return 'bi bi-check-circle-fill text-success'
    }

    const getStokTextColor = (stokAkhir, stokMinimal) => {
      const stok = parseFloat(stokAkhir) || 0
      const minimal = parseFloat(stokMinimal) || 0

      if (stok === 0) return 'text-danger'
      if (stok <= minimal) return 'text-warning'
      return 'text-success'
    }

    // Lifecycle
    onMounted(() => {
      console.log('🟢 BahanBakuView component mounted successfully!')
      fetchBahanBakuData()
    })

    return {
      // State
      showAddForm,
      bahanBakuData,
      form,
      loading,
      error,
      editingId,

      // Computed
      hasBahanBakuData,

      // Methods
      fetchBahanBakuData,
      saveBahanBaku,
      editBahanBaku,
      deleteBahanBaku,
      cancelAdd,
      resetForm,
      generateKodeBahanBaku,
      formatNumber,
      formatCurrency,
      getStokStatusClass,
      getStokTextColor
    }
  }
}
</script>

<style scoped>
/* Custom styles untuk Bahan Baku view */

/* Gradient backgrounds */
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Table styling */
.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
  border-color: #f1f3f5;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  padding: 0.5em 0.75em;
  font-weight: 500;
}

/* Card improvements */
.card {
  transition: all 0.3s ease;
  border: none;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
  transform: translateY(-2px);
}

/* Header styling */
.text-dark {
  color: #1a1a1a !important;
}

.text-muted {
  color: #6c757d !important;
}

/* Button styling */
.btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline-primary:hover {
  background-color: #667eea;
  border-color: #667eea;
  transform: scale(1.1);
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  transform: scale(1.1);
}

.btn-rounded-pill {
  border-radius: 50px;
}

/* Form styling */
.form-control {
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.form-select {
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Loading spinner animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Table responsiveness */
.table-responsive {
  overflow-x: auto;
  border-radius: 0 0 12px 12px;
}

/* Icon styling */
.bi {
  font-size: 1rem;
}

/* Action buttons */
.btn-sm {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Loading overlay */
.loading-overlay {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

/* Card header improvements */
.card-header {
  border-bottom: none;
}

/* Data cell improvements */
.fw-semibold {
  font-weight: 600;
}

/* Empty state improvements */
.card.border-0 {
  border: none;
}

/* Alert improvements */
.alert {
  border-radius: 12px;
  border: none;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .btn-lg {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>