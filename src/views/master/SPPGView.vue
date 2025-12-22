<template>
  <div>
    <!-- Header dengan tombol tambah bersyarat -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-building text-primary me-2"></i>
          Data SPPG
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data Satuan Pemberdayaan Pangan dan Gizi</p>
      </div>
      <button
        v-if="!hasSPPGData"
        class="btn btn-primary btn-lg rounded-pill px-4"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddForm = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah SPPG
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data SPPG...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchSPPGData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasSPPGData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-building text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data SPPG</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data Satuan Pemberdayaan Pangan dan Gizi pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah SPPG Pertama
        </button>
      </div>
    </div>

    <!-- Form tambah SPPG -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Data SPPG' : 'Tambah Data SPPG' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveSPPG">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kode SPPG</label>
              <input
                v-model="form.kode_sppg"
                type="text"
                class="form-control"
                placeholder="Contoh: SPPG-001"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama SPPG</label>
              <input
                v-model="form.nama_sppg"
                type="text"
                class="form-control"
                placeholder="Masukkan nama SPPG"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Alamat</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="3"
                placeholder="Masukkan alamat lengkap"
                required
              ></textarea>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Provinsi</label>
              <input
                v-model="form.provinsi"
                type="text"
                class="form-control"
                placeholder="Masukkan provinsi"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Kabupaten/Kota</label>
              <input
                v-model="form.kabupaten_kota"
                type="text"
                class="form-control"
                placeholder="Masukkan kabupaten/kota"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Kode Pos</label>
              <input
                v-model="form.kode_pos"
                type="text"
                class="form-control"
                placeholder="Masukkan kode pos"
              >
            </div>
            <div class="col-md-4 mb-3">
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
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Masukkan email"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama PIC</label>
              <input
                v-model="form.nama_pic"
                type="text"
                class="form-control"
                placeholder="Masukkan nama PIC"
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Telepon PIC</label>
              <input
                v-model="form.telepon_pic"
                type="tel"
                class="form-control"
                placeholder="Masukkan telepon PIC"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Kapasitas Layanan</label>
              <input
                v-model="form.kapasitas_layanan"
                type="number"
                class="form-control"
                placeholder="Masukkan kapasitas layanan"
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Operasional</label>
              <input
                v-model="form.tanggal_operasional"
                type="date"
                class="form-control"
              >
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Latitude</label>
              <input
                v-model="form.latitude"
                type="text"
                class="form-control"
                placeholder="Contoh: -6.2088"
              >
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Longitude</label>
              <input
                v-model="form.longitude"
                type="text"
                class="form-control"
                placeholder="Contoh: 106.8456"
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Visi</label>
              <textarea
                v-model="form.visi"
                class="form-control"
                rows="2"
                placeholder="Masukkan visi SPPG"
              ></textarea>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Misi</label>
              <textarea
                v-model="form.misi"
                class="form-control"
                rows="3"
                placeholder="Masukkan misi SPPG"
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

    <!-- Tabel data SPPG -->
    <div v-if="hasSPPGData" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-building me-2"></i>
            Data SPPG
          </h5>
          <span class="badge bg-white text-primary">
            {{ sppgData.length }} Data
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
                  <i class="bi bi-building me-1"></i>Nama SPPG
                </th>
                <th class="border-0">
                  <i class="bi bi-geo-alt me-1"></i>Alamat
                </th>
                <th class="border-0">
                  <i class="bi bi-map me-1"></i>Kabupaten/Kota
                </th>
                <th class="border-0">
                  <i class="bi bi-telephone me-1"></i>Telepon
                </th>
                <th class="border-0">
                  <i class="bi bi-envelope me-1"></i>Email
                </th>
                <th class="border-0 text-center" style="width: 120px;">
                  <i class="bi bi-gear me-1"></i>Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sppg in sppgData" :key="sppg.id_sppg" class="align-middle">
                <td>
                  <span class="fw-bold text-danger px-2 py-1" style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                    {{ sppg.kode_sppg }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ sppg.nama_sppg }}</div>
                  <small class="text-muted">{{ sppg.provinsi }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                    <span>{{ sppg.alamat }}</span>
                  </div>
                </td>
                <td>
                  <span class="fw-bold text-primary px-2 py-1" style="background-color: #cfe2ff; border: 1px solid #9ec5fe; border-radius: 4px;">
                    {{ sppg.kabupaten_kota }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-telephone-fill text-success me-2"></i>
                    <span>{{ sppg.telepon }}</span>
                  </div>
                </td>
                <td>
                  <div v-if="sppg.email" class="d-flex align-items-center">
                    <i class="bi bi-envelope-fill text-primary me-2"></i>
                    <a :href="`mailto:${sppg.email}`" class="text-primary text-decoration-none">
                      {{ sppg.email }}
                    </a>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editSPPG(sppg)"
                      :title="'Edit ' + sppg.nama_sppg"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteSPPG(sppg.id_sppg)"
                      :title="'Hapus ' + sppg.nama_sppg"
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
import sppgService from '@/services/sppgService'

export default {
  name: 'SPPGView',
  setup() {
    // State management
    const showAddForm = ref(false)
    const sppgData = ref([])
    const loading = ref(false)
    const error = ref('')

    // Form data
    const form = ref({
      kode_sppg: '',
      nama_sppg: '',
      alamat: '',
      provinsi: '',
      kabupaten_kota: '',
      kecamatan: '',
      kelurahan: '',
      kode_pos: '',
      telepon: '',
      email: '',
      nama_pic: '',
      telepon_pic: '',
      kapasitas_layanan: '',
      tanggal_operasional: '',
      latitude: '',
      longitude: '',
      visi: '',
      misi: ''
    })

    const editingId = ref(null)

    // Computed properties
    const hasSPPGData = computed(() => {
      return sppgData.value.length > 0
    })

      // Methods
    const fetchSPPGData = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await sppgService.getAll()
        // Handle different response structures
        sppgData.value = response.data || response.data?.data || response || []
        console.log('SPPG data fetched:', sppgData.value)
      } catch (err) {
        error.value = 'Gagal memuat data SPPG: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching SPPG data:', err)
      } finally {
        loading.value = false
      }
    }

    const saveSPPG = async () => {
      try {
        loading.value = true

        // Validasi maksimal 1 data SPPG
        if (!editingId.value && sppgData.value.length >= 1) {
          alert('Sistem hanya memperbolehkan maksimal 1 data SPPG. Silakan hapus data yang ada terlebih dahulu.')
          return
        }

        let response
        if (editingId.value) {
          response = await sppgService.update(editingId.value, form.value)
          const index = sppgData.value.findIndex(sppg => sppg.id_sppg === editingId.value)
          if (index !== -1) {
            sppgData.value[index] = response.data || response
          }
        } else {
          response = await sppgService.create(form.value)
          sppgData.value.push(response.data || response)
        }

        // Reset form
        resetForm()
        showAddForm.value = false

        console.log('SPPG saved:', response)
      } catch (err) {
        console.error('Error saving SPPG:', err)
        alert('Gagal menyimpan data SPPG')
      } finally {
        loading.value = false
      }
    }

    const editSPPG = (sppg) => {
      // Isi form dengan data yang akan diedit
      form.value = { ...sppg }
      editingId.value = sppg.id_sppg
      showAddForm.value = true
      console.log('Edit SPPG:', sppg)
    }

    const deleteSPPG = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus data SPPG ini?')) {
        try {
          loading.value = true
          await sppgService.delete(id)
          sppgData.value = sppgData.value.filter(sppg => sppg.id_sppg !== id)
          console.log('SPPG deleted with id:', id)
        } catch (err) {
          console.error('Error deleting SPPG:', err)
          alert('Gagal menghapus data SPPG')
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

    const resetForm = () => {
      form.value = {
        kode_sppg: '',
        nama_sppg: '',
        alamat: '',
        provinsi: '',
        kabupaten_kota: '',
        kecamatan: '',
        kelurahan: '',
        kode_pos: '',
        telepon: '',
        email: '',
        nama_pic: '',
        telepon_pic: '',
        kapasitas_layanan: '',
        tanggal_operasional: '',
        latitude: '',
        longitude: '',
        visi: '',
        misi: ''
      }
    }

      // Lifecycle
    onMounted(() => {
      console.log('🔴 SPPGView component mounted successfully!')
      fetchSPPGData()
    })

    return {
      // State
      showAddForm,
      sppgData,
      form,
      loading,
      error,

      // Computed
      hasSPPGData,

      // Methods
      fetchSPPGData,
      saveSPPG,
      editSPPG,
      deleteSPPG,
      cancelAdd,
      resetForm
    }
  }
}
</script>

<style scoped>
/* Custom styles untuk SPPG view */

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

.bg-opacity-10 {
  opacity: 0.15 !important;
}

/* Specific badge styling */
.badge.bg-primary.bg-opacity-10 {
  background-color: #dc3545 !important;
  color: #ffffff !important;
  font-weight: 700;
  border: 1px solid #dc3545 !important;
}

.badge.bg-info.bg-opacity-10 {
  background-color: #0d6efd !important;
  color: #ffffff !important;
  font-weight: 700;
  border: 1px solid #0d6efd !important;
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
</style>