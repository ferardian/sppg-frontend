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
        v-if="!hasSPPGData && !showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
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
    <div v-if="showAddForm" class="card mb-4 shadow-sm border-0" ref="sppgFormCard">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-building me-2"></i>
          {{ editingId ? 'Edit Data SPPG' : 'Tambah Data SPPG' }}
        </h5>
        <button 
          type="button" 
          class="btn btn-outline-secondary btn-sm rounded-circle" 
          @click="cancelAdd"
          title="Tutup Form"
          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
        >
          <i class="bi bi-x-lg"></i>
        </button>
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
                ref="namaSppgInput"
                v-model="form.nama_sppg"
                type="text"
                class="form-control"
                placeholder="Masukkan nama SPPG"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Alamat Lengkap</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="3"
                placeholder="Masukkan alamat lengkap"
                required
              ></textarea>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Provinsi</label>
              <input
                v-model="form.provinsi"
                type="text"
                class="form-control"
                placeholder="Provinsi"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Kabupaten/Kota</label>
              <input
                v-model="form.kabupaten_kota"
                type="text"
                class="form-control"
                placeholder="Kabupaten/Kota"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Kecamatan</label>
              <input
                v-model="form.kecamatan"
                type="text"
                class="form-control"
                placeholder="Kecamatan"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Desa/Kelurahan</label>
              <input
                v-model="form.desa_kelurahan"
                type="text"
                class="form-control"
                placeholder="Desa/Kelurahan"
                required
              >
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
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" @click="cancelAdd" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-primary px-4" :disabled="loading">
              <i v-if="loading" class="bi bi-arrow-repeat me-2 spin"></i>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ loading ? 'Menyimpan...' : 'Simpan Data' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data cards (List SPPG) -->
    <div v-if="hasSPPGData && !showAddForm" class="row">
      <div v-for="item in sppgData" :key="item.id_sppg" class="col-md-12">
        <div class="card border-0 shadow-sm overflow-hidden mb-4 plumpy-card">
          <div class="card-body p-0">
            <div class="row g-0">
              <div class="col-md-1 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center py-4">
                <i class="bi bi-building text-primary fs-1"></i>
              </div>
              <div class="col-md-11 p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span class="badge bg-primary bg-opacity-10 text-primary mb-2 px-3">
                      {{ item.kode_sppg }}
                    </span>
                    <h4 class="fw-bold text-dark mb-1">{{ item.nama_sppg }}</h4>
                    <p class="text-muted mb-0"><i class="bi bi-geo-alt me-1"></i> {{ item.alamat }}</p>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="editSPPG(item)">
                      <i class="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3" @click="deleteSPPG(item.id_sppg)">
                      <i class="bi bi-trash me-1"></i> Hapus
                    </button>
                  </div>
                </div>
                <hr class="my-3 opacity-10">
                <div class="row g-3">
                  <div class="col-md-3">
                    <div class="small text-muted text-uppercase fw-bold mb-1">Wilayah</div>
                    <div class="fw-semibold">{{ item.kecamatan }}, {{ item.kabupaten_kota }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="small text-muted text-uppercase fw-bold mb-1">Provinsi</div>
                    <div class="fw-semibold">{{ item.provinsi }}</div>
                  </div>
                  <div class="col-md-3">
                    <div class="small text-muted text-uppercase fw-bold mb-1">Status</div>
                    <span class="badge rounded-pill px-3" :class="item.status === 'aktif' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'">
                      {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import sppgService from '@/services/sppgService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

export default {
  name: 'SPPGView',
  setup() {
    const toast = useToast()
    
    // State management
    const showAddForm = ref(false)
    const sppgData = ref([])
    const loading = ref(false)
    const error = ref('')
    
    // Refs for UI
    const sppgFormCard = ref(null)
    const namaSppgInput = ref(null)

    // Form data
    const form = ref({
      kode_sppg: '',
      nama_sppg: '',
      alamat: '',
      provinsi: '',
      kabupaten_kota: '',
      kecamatan: '',
      desa_kelurahan: '',
      status: ''
    })

    const editingId = ref(null)

    // Computed properties
    const hasSPPGData = computed(() => sppgData.value.length > 0)

    // Methods
    const fetchSPPGData = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await sppgService.getAll()
        sppgData.value = response.data || response || []
      } catch (err) {
        error.value = 'Gagal memuat data SPPG: ' + (err.message || 'Terjadi kesalahan sistem')
      } finally {
        loading.value = false
      }
    }

    const saveSPPG = async () => {
      try {
        loading.value = true
        if (editingId.value) {
          await sppgService.update(editingId.value, form.value)
          toast.success('Data SPPG berhasil diperbarui!')
        } else {
          await sppgService.create(form.value)
          toast.success('Data SPPG berhasil ditambahkan!')
        }
        resetForm()
        showAddForm.value = false
        await fetchSPPGData()
      } catch (err) {
        toast.error('Gagal menyimpan data SPPG: ' + (err.message || 'Terjadi kesalahan sistem'))
      } finally {
        loading.value = false
      }
    }

    const editSPPG = (item) => {
      form.value = { ...item }
      editingId.value = item.id_sppg
      showAddForm.value = true
      nextTick(() => {
        if (sppgFormCard.value) sppgFormCard.value.scrollIntoView({ behavior: 'smooth' })
        if (namaSppgInput.value) namaSppgInput.value.focus()
      })
    }

    const deleteSPPG = async (id) => {
      const result = await Swal.fire({
        title: 'Hapus Data SPPG?',
        text: 'Tindakan ini tidak dapat dibatalkan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        try {
          loading.value = true
          await sppgService.delete(id)
          toast.success('Data SPPG berhasil dihapus')
          await fetchSPPGData()
        } catch (err) {
          toast.error('Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan sistem'))
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
        desa_kelurahan: '',
        status: ''
      }
    }

    onMounted(fetchSPPGData)

    return {
      showAddForm, sppgData, loading, error, hasSPPGData, form, editingId,
      fetchSPPGData, saveSPPG, editSPPG, deleteSPPG, cancelAdd, resetForm,
      sppgFormCard, namaSppgInput
    }
  }
}
</script>

<style scoped>
.spin { animation: fa-spin 2s infinite linear; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } }

.plumpy-card {
    border-radius: 1.25rem !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plumpy-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
}
</style>