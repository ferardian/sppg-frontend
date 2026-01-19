<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-people text-primary me-2"></i>
          Data Pegawai
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data pegawai SPPG</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="openAddForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Pegawai
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data pegawai...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchPegawaiData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasPegawaiData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-people text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Pegawai</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data pegawai pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="openAddForm">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Pegawai Pertama
        </button>
      </div>
    </div>

    <!-- Form tambah pegawai -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Data Pegawai' : 'Tambah Data Pegawai' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="savePegawai">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">NIP</label>
              <input
                v-model="form.nip"
                type="text"
                class="form-control"
                placeholder="Otomatis (PGWxxxx)"
                readonly
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Lengkap</label>
              <input
                v-model="form.nama_lengkap"
                type="text"
                class="form-control"
                placeholder="Masukkan nama lengkap"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Masukkan email"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Telepon</label>
              <input
                v-model="form.telepon"
                type="tel"
                class="form-control"
                placeholder="Masukkan nomor telepon"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Jabatan</label>
              <v-select
                v-model="form.jabatan"
                :options="jabatanList"
                placeholder="Pilih Jabatan"
                class="style-chooser"
              ></v-select>
            </div>
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
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Bergabung</label>
              <input
                v-model="form.tanggal_bergabung"
                type="date"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Alamat</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="2"
                placeholder="Masukkan alamat"
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

    <!-- Tabel data pegawai -->
    <div v-if="hasPegawaiData" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="mb-0">
            <i class="bi bi-people me-2"></i>
            Data Pegawai
          </h5>
          <div class="d-flex align-items-center gap-2">
            <div class="input-group" style="width: 300px;">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Cari nama, NIP, atau jabatan..."
                v-model="searchQuery"
              >
            </div>
            <span class="badge bg-white text-primary">
              {{ filteredPegawai.length }} / {{ pegawaiData.length }} Data
            </span>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 600px; overflow-y: auto;">
          <table class="table table-hover mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th class="border-0">
                  <i class="bi bi-hash me-1"></i>NIP
                </th>
                <th class="border-0">
                  <i class="bi bi-person me-1"></i>Nama Lengkap
                </th>
                <th class="border-0">
                  <i class="bi bi-briefcase me-1"></i>Jabatan
                </th>
                <th class="border-0">
                  <i class="bi bi-telephone me-1"></i>Telepon
                </th>
                <th class="border-0">
                  <i class="bi bi-envelope me-1"></i>Email
                </th>
                <th class="border-0">
                  <i class="bi bi-toggle-on me-1"></i>Status Kepegawaian
                </th>
                <th class="border-0 text-center" style="width: 120px;">
                  <i class="bi bi-gear me-1"></i>Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredPegawai.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-1 d-block mb-2"></i>
                  Tidak ada data yang sesuai dengan pencarian "{{ searchQuery }}"
                </td>
              </tr>
              <tr v-for="pegawai in filteredPegawai" :key="pegawai.id_pegawai" class="align-middle">
                <td>
                  <span class="fw-bold text-primary px-2 py-1" style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px;">
                    {{ pegawai.nip }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ pegawai.nama_lengkap }}</div>
                </td>
                <td>
                  <span class="badge bg-info px-2 py-1">
                    {{ pegawai.jabatan }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-telephone-fill text-success me-2"></i>
                    <span>{{ pegawai.telepon }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-envelope-fill text-primary me-2"></i>
                    <a :href="`mailto:${pegawai.email}`" class="text-primary text-decoration-none">
                      {{ pegawai.email }}
                    </a>
                  </div>
                </td>
                <td>
                  <span class="badge px-2 py-1" :class="pegawai.status === 'aktif' ? 'bg-success' : 'bg-warning'">
                    {{ pegawai.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editPegawai(pegawai)"
                      :title="'Edit ' + pegawai.nama_lengkap"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deletePegawai(pegawai.id_pegawai)"
                      :title="'Hapus ' + pegawai.nama_lengkap"
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
import { ref, computed, onMounted } from 'vue'
import pegawaiService from '@/services/pegawaiService'
import jabatanService from '@/services/jabatanService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'PegawaiView',
  components: {
    vSelect
  },
  setup() {
    // State management
    const showAddForm = ref(false)
    const pegawaiData = ref([])
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')

    // Form data
    const form = ref({
      nip: '',
      nama_lengkap: '',
      email: '',
      telepon: '',
      jabatan: '',
      status: '',
      tanggal_bergabung: '',
      alamat: ''
    })

    const editingId = ref(null)
    const jabatanList = ref([])

    // Computed properties
    const hasPegawaiData = computed(() => {
      return pegawaiData.value.length > 0
    })

    const filteredPegawai = computed(() => {
      if (!searchQuery.value) {
        return pegawaiData.value
      }
      
      const query = searchQuery.value.toLowerCase()
      return pegawaiData.value.filter(pegawai => {
        return (
          pegawai.nama_lengkap?.toLowerCase().includes(query) ||
          pegawai.nip?.toLowerCase().includes(query) ||
          pegawai.jabatan?.toLowerCase().includes(query) ||
          pegawai.email?.toLowerCase().includes(query) ||
          pegawai.telepon?.toLowerCase().includes(query)
        )
      })
    })

    // Methods
    const fetchJabatanData = async () => {
      try {
        const response = await jabatanService.getAll()
        jabatanList.value = (response.data || []).map(j => j.nama_jabatan)
      } catch (err) {
        console.error('Error fetching jabatan data:', err)
      }
    }

    const fetchPegawaiData = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await pegawaiService.getAll()
        // Handle different response structures
        pegawaiData.value = response.data || response.data?.data || response || []
        console.log('Pegawai data fetched:', pegawaiData.value)
      } catch (err) {
        error.value = 'Gagal memuat data pegawai: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching pegawai data:', err)
      } finally {
        loading.value = false
      }
    }

    const savePegawai = async () => {
      try {
        loading.value = true

        console.log('Form data to be saved:', form.value)

        let response
        if (editingId.value) {
          response = await pegawaiService.update(editingId.value, form.value)
          const index = pegawaiData.value.findIndex(pegawai => pegawai.id_pegawai === editingId.value)
          if (index !== -1) {
            pegawaiData.value[index] = response.data || response
          }
        } else {
          response = await pegawaiService.create(form.value)
          pegawaiData.value.push(response.data || response)
        }

        // Reset form
        resetForm()
        showAddForm.value = false

        console.log('Pegawai saved:', response)
      } catch (err) {
        console.error('Error saving pegawai:', err)
        if (err.response?.data?.errors) {
          console.error('Validation errors:', err.response.data.errors)
          const errorMessages = Object.values(err.response.data.errors).flat()
          alert('Validasi gagal: ' + errorMessages.join(', '))
        } else {
          alert('Gagal menyimpan data pegawai: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        loading.value = false
      }
    }

    const editPegawai = (pegawai) => {
      // Isi form dengan data yang akan diedit
      console.log('Original pegawai data:', pegawai)
      console.log('Form before edit:', form.value)

      // Format tanggal untuk HTML date input
      let formattedDate = ''
      if (pegawai.tanggal_bergabung) {
        const date = new Date(pegawai.tanggal_bergabung)
        formattedDate = date.toISOString().split('T')[0] // Format: yyyy-MM-dd
      }

      // Pastikan semua field terisi dengan data dari API
      form.value = {
        nip: pegawai.nip || '',
        nama_lengkap: pegawai.nama_lengkap || '',
        email: pegawai.email || '',
        telepon: pegawai.telepon || '',
        jabatan: pegawai.jabatan || '',
        status: pegawai.status || '',
        tanggal_bergabung: formattedDate,
        alamat: pegawai.alamat || ''
      }

      editingId.value = pegawai.id_pegawai
      showAddForm.value = true
      console.log('Form after edit:', form.value)
    }

    const deletePegawai = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
        try {
          loading.value = true
          await pegawaiService.delete(id)
          pegawaiData.value = pegawaiData.value.filter(pegawai => pegawai.id_pegawai !== id)
          console.log('Pegawai deleted with id:', id)
        } catch (err) {
          console.error('Error deleting pegawai:', err)
          alert('Gagal menghapus data pegawai')
        } finally {
          loading.value = false
        }
      }
    }

    const generateNIP = () => {
      // Find the highest existing NIP starting with PGW
      const existingNips = pegawaiData.value
        .map(p => p.nip)
        .filter(nip => nip && nip.startsWith('PGW'))
        .map(nip => parseInt(nip.replace('PGW', '')) || 0)
        .sort((a, b) => b - a)
      
      const nextNum = existingNips.length > 0 ? existingNips[0] + 1 : 1
      const nextNip = `PGW${String(nextNum).padStart(4, '0')}`
      
      form.value.nip = nextNip
      console.log('Generated NIP:', nextNip)
    }

    const openAddForm = () => {
      resetForm()
      generateNIP()
      showAddForm.value = true
      editingId.value = null
    }

    const cancelAdd = () => {
      resetForm()
      showAddForm.value = false
      editingId.value = null
    }

    const resetForm = () => {
      form.value = {
        nip: '',
        nama_lengkap: '',
        email: '',
        telepon: '',
        jabatan: '',
        status: '',
        tanggal_bergabung: '',
        alamat: ''
      }
    }

    // Lifecycle
    onMounted(() => {
      console.log('🟢 PegawaiView component mounted successfully!')
      fetchJabatanData()
      fetchPegawaiData()
    })

    return {
      // State
      showAddForm,
      pegawaiData,
      form,
      loading,
      error,
      searchQuery,
      editingId, // Added editingId to export

      // Computed
      hasPegawaiData,
      filteredPegawai,

      // Methods
      fetchJabatanData,
      fetchPegawaiData,
      savePegawai,
      editPegawai,
      deletePegawai,
      cancelAdd,
      resetForm,
      openAddForm,
      jabatanList
    }
  }
}
</script>

<style scoped>
/* Custom styles untuk Pegawai view */

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
  color: #2c3e50 !important;
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

/* Link styling */
.text-decoration-none:hover {
  text-decoration: underline !important;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  background-color: transparent !important;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Sticky table header */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa !important;
}

/* Search input styling */
.input-group-text {
  border-right: 0;
}

.form-control.border-start-0:focus {
  border-left: 0;
  box-shadow: none;
}

.input-group:focus-within .input-group-text {
  border-color: #667eea;
}

.input-group:focus-within .form-control {
  border-color: #667eea;
}
</style>