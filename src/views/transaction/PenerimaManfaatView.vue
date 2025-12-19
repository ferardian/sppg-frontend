<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-person-check text-primary me-2"></i>
          Data Penerima Manfaat
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data penerima manfaat SPPG</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        @click="showAddForm = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Penerima
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data penerima manfaat...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchPenerimaManfaatData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasPenerimaManfaatData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-person-check text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Penerima Manfaat</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data penerima manfaat pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Penerima Pertama
        </button>
      </div>
    </div>

    <!-- Tabel Data -->
    <div v-if="hasPenerimaManfaatData && !showAddForm" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-person-check me-2"></i>
            Data Penerima Manfaat
          </h5>
          <span class="badge bg-white text-primary">
            {{ penerimaManfaatData.length }} Data
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0">
                  <i class="bi bi-hash me-1"></i>ID
                </th>
                <th class="border-0">
                  <i class="bi bi-building me-1"></i>Nama Lembaga
                </th>
                <th class="border-0">
                  <i class="bi bi-tag me-1"></i>Jenis Penerima
                </th>
                <th class="border-0">
                  <i class="bi bi-fork-knife me-1"></i>Jenis Porsi
                </th>
                <th class="border-0">
                  <i class="bi bi-geo-alt me-1"></i>Lokasi
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
              <tr v-for="item in penerimaManfaatData" :key="item.id_penerima">
                <td class="align-middle">
                  <span class="badge bg-light text-dark">{{ item.id_penerima }}</span>
                </td>
                <td class="align-middle">
                  <div>
                    <strong>{{ item.nama_lembaga }}</strong>
                    <br>
                    <small class="text-muted">{{ item.kode_lembaga }}</small>
                  </div>
                </td>
                <td class="align-middle">
                  <span class="badge bg-info text-white">
                    {{ item.nama_jenis_penerima }}
                  </span>
                </td>
                <td class="align-middle">
                  <span class="badge bg-warning text-dark">
                    {{ item.nama_jenis_porsi }}
                  </span>
                </td>
                <td class="align-middle">
                  <div>
                    <strong>{{ item.kepala_sekolah }}</strong>
                    <br>
                    <small class="text-muted">{{ item.kabupaten_kota }}</small>
                    <br>
                    <small class="text-muted" v-if="item.jumlah_siswa">{{ item.jumlah_siswa }} siswa</small>
                  </div>
                </td>
                <td class="align-middle">
                  <span
                    :class="{
                      'badge bg-success': item.status === 'aktif',
                      'badge bg-secondary': item.status === 'nonaktif',
                      'badge bg-danger': item.status === 'meninggal',
                      'badge bg-warning text-dark': item.status === 'pindah'
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="align-middle">
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editPenerimaManfaat(item)"
                      :title="'Edit ' + item.nama_lembaga"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deletePenerimaManfaat(item.id_penerima)"
                      :title="'Hapus ' + item.nama_lembaga"
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

    <!-- Form Tambah/Edit -->
    <div v-if="showAddForm" class="card border-0 shadow-sm">
      <div class="card-header bg-gradient-success text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-plus-circle me-2"></i>
            {{ editingId ? 'Edit' : 'Tambah' }} Penerima Manfaat
          </h5>
          <button class="btn btn-light btn-sm" @click="cancelAdd">
            <i class="bi bi-x-lg me-1"></i>
            Batal
          </button>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="savePenerimaManfaat">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Kode Lembaga *</label>
              <input
                v-model="form.kode_lembaga"
                type="text"
                class="form-control"
                :placeholder="editingId ? form.kode_lembaga : 'PM00001 (contoh)'"
                readonly
                :class="{ 'bg-light': !editingId }"
              >
              <small class="text-muted" v-if="!editingId">Format: PM00001, PM00002, dst.</small>
              <small class="text-muted" v-else>Kode lembaga tidak dapat diubah</small>
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">Nama Lembaga *</label>
              <input
                v-model="form.nama_lembaga"
                type="text"
                class="form-control"
                placeholder="Masukkan nama lembaga (contoh: SD N 1 Pekalongan)"
                required
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Jenis Penerima * <small class="text-muted">({{ jenisPenerimaList.length }} items)</small></label>
              <select v-model="form.id_jenis_penerima" class="form-select" required>
                <option value="">Pilih Jenis Penerima</option>
                <option
                  v-for="jenis in jenisPenerimaList"
                  :key="jenis.id_jenis_penerima"
                  :value="jenis.id_jenis_penerima"
                >
                  {{ jenis.nama_jenis }}
                </option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Jenis Porsi * <small class="text-muted">({{ jenisPorsiList.length }} items)</small></label>
              <select v-model="form.id_jenis_porsi" class="form-select" required>
                <option value="">Pilih Jenis Porsi</option>
                <option
                  v-for="jenis in jenisPorsiList"
                  :key="jenis.id_jenis_porsi"
                  :value="jenis.id_jenis_porsi"
                >
                  {{ jenis.nama_porsi }}
                </option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">NPSN/NSS</label>
              <input
                v-model="form.npsn_nss"
                type="text"
                class="form-control"
                placeholder="Masukkan NPSN/NSS"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Kepala Sekolah *</label>
              <input
                v-model="form.kepala_sekolah"
                type="text"
                class="form-control"
                placeholder="Masukkan nama kepala sekolah"
                required
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Alamat *</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="3"
                placeholder="Masukkan alamat lengkap lembaga"
                required
              ></textarea>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Kecamatan *</label>
              <input
                v-model="form.kecamatan"
                type="text"
                class="form-control"
                placeholder="Masukkan kecamatan"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Kabupaten/Kota *</label>
              <input
                v-model="form.kabupaten_kota"
                type="text"
                class="form-control"
                placeholder="Masukkan kabupaten/kota"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Provinsi *</label>
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
              <label class="form-label">Jumlah Siswa</label>
              <input
                v-model="form.jumlah_siswa"
                type="number"
                class="form-control"
                placeholder="Masukkan jumlah siswa"
                min="1"
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Status Gizi Umum *</label>
              <select v-model="form.status_gizi_umum" class="form-select" required>
                <option value="">Pilih Status Gizi Umum</option>
                <option value="baik">Baik</option>
                <option value="cukup">Cukup</option>
                <option value="kurang">Kurang</option>
                <option value="buruk">Buruk</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Status *</label>
              <select v-model="form.status" class="form-select" required>
                <option value="">Pilih Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="meninggal">Meninggal</option>
                <option value="pindah">Pindah</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Telepon</label>
              <input
                v-model="form.telepon"
                type="text"
                class="form-control"
                placeholder="Masukkan telepon lembaga"
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Masukkan email lembaga"
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Tanggal Daftar *</label>
              <input
                v-model="form.tanggal_daftar"
                type="date"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="cancelAdd">
              <i class="bi bi-x-lg me-1"></i>
              Batal
            </button>
            <button type="submit" class="btn btn-success" :disabled="loading">
              <i class="bi bi-check-lg me-1"></i>
              {{ loading ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import penerimaManfaatService from '@/services/penerimaManfaatService'

export default {
  name: 'PenerimaManfaatView',
  setup() {
    // State management
    const showAddForm = ref(false)
    const penerimaManfaatData = ref([])
    const jenisPenerimaList = ref([])
    const jenisPorsiList = ref([])
    const loading = ref(false)
    const error = ref('')
    const editingId = ref(null)

    // Form data
    const form = ref({
      id_jenis_penerima: '',
      id_jenis_porsi: '',
      kode_lembaga: '',
      nama_lembaga: '',
      npsn_nss: '',
      alamat: '',
      telepon: '',
      email: '',
      kepala_sekolah: '',
      kecamatan: '',
      kabupaten_kota: '',
      provinsi: '',
      jumlah_siswa: '',
      status_gizi_umum: '',
      tanggal_daftar: '',
      status: '',
    })

    // Computed properties
    const hasPenerimaManfaatData = computed(() => {
      return penerimaManfaatData.value && penerimaManfaatData.value.length > 0
    })

    // Methods
    const fetchPenerimaManfaatData = async () => {
      try {
        loading.value = true
        error.value = ''

        const response = await penerimaManfaatService.getAll()
        penerimaManfaatData.value = response.data

        console.log('Penerima manfaat data loaded:', response.data)
      } catch (err) {
        console.error('Error fetching penerima manfaat:', err)
        error.value = 'Gagal memuat data penerima manfaat: ' + (err.response?.data?.message || err.message)
      } finally {
        loading.value = false
      }
    }

    const fetchJenisPenerima = async () => {
      try {
        const response = await penerimaManfaatService.getJenisPenerima()
        console.log('🟢 Jenis Penerima Response:', response)
        jenisPenerimaList.value = response.data || response
        console.log('🟢 Jenis Penerima List:', jenisPenerimaList.value)
      } catch (err) {
        console.error('Error fetching jenis penerima:', err)
      }
    }

    const fetchJenisPorsi = async () => {
      try {
        const response = await penerimaManfaatService.getJenisPorsi()
        console.log('🟢 Jenis Porsi Response:', response)
        jenisPorsiList.value = response.data || response
        console.log('🟢 Jenis Porsi List:', jenisPorsiList.value)
      } catch (err) {
        console.error('Error fetching jenis pori:', err)
      }
    }

    const savePenerimaManfaat = async () => {
      try {
        loading.value = true

        if (editingId.value) {
          await penerimaManfaatService.update(editingId.value, form.value)
        } else {
          await penerimaManfaatService.create(form.value)
        }

        await fetchPenerimaManfaatData()
        resetForm()
        showAddForm.value = false
        editingId.value = null

        // Generate new preview kode for next entry
        generatePreviewKodeLembaga()

        alert(`Penerima manfaat berhasil ${editingId.value ? 'diupdate' : 'ditambahkan'}!`)
      } catch (err) {
        console.error('Error saving penerima manfaat:', err)

        if (err.response?.status === 422) {
          const errors = err.response.data.errors
          const errorMessages = Object.values(errors).flat()
          alert('Validasi gagal: ' + errorMessages.join(', '))
        } else {
          alert('Gagal menyimpan data penerima manfaat: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        loading.value = false
      }
    }

    const editPenerimaManfaat = (item) => {
      console.log('Original penerima manfaat data:', item)

      form.value = {
        id_jenis_penerima: item.id_jenis_penerima || '',
        id_jenis_porsi: item.id_jenis_porsi || '',
        kode_lembaga: item.kode_lembaga || '',
        nama_lembaga: item.nama_lembaga || '',
        npsn_nss: item.npsn_nss || '',
        alamat: item.alamat || '',
        telepon: item.telepon || '',
        email: item.email || '',
        kepala_sekolah: item.kepala_sekolah || '',
        kecamatan: item.kecamatan || '',
        kabupaten_kota: item.kabupaten_kota || '',
        provinsi: item.provinsi || '',
        jumlah_siswa: item.jumlah_siswa || '',
        status_gizi_umum: item.status_gizi_umum || '',
        tanggal_daftar: item.tanggal_daftar || '',
        status: item.status || '',
      }

      editingId.value = item.id_penerima
      showAddForm.value = true
    }

    const deletePenerimaManfaat = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus data penerima manfaat ini?')) {
        try {
          loading.value = true
          await penerimaManfaatService.delete(id)
          await fetchPenerimaManfaatData()
          // Regenerate preview kode after deletion
          generatePreviewKodeLembaga()
          alert('Penerima manfaat berhasil dihapus!')
        } catch (err) {
          console.error('Error deleting penerima manfaat:', err)
          alert('Gagal menghapus data: ' + (err.response?.data?.message || err.message))
        } finally {
          loading.value = false
        }
      }
    }

    const cancelAdd = () => {
      showAddForm.value = false
      editingId.value = null
      resetForm()
      // Generate preview kode for new entry
      generatePreviewKodeLembaga()
    }

    const resetForm = () => {
      form.value = {
        id_jenis_penerima: '',
        id_jenis_porsi: '',
        kode_lembaga: '',
        nama_lembaga: '',
        npsn_nss: '',
        alamat: '',
        telepon: '',
        email: '',
        kepala_sekolah: '',
        kecamatan: '',
        kabupaten_kota: '',
        provinsi: '',
        jumlah_siswa: '',
        status_gizi_umum: '',
        tanggal_daftar: '',
        status: '',
      }
    }

    // Generate preview kode lembaga for new entries
    const generatePreviewKodeLembaga = () => {
      if (!editingId.value && penerimaManfaatData.value.length > 0) {
        // Find the highest existing PM code
        const existingCodes = penerimaManfaatData.value
          .map(item => item.kode_lembaga)
          .filter(kode => kode && kode.startsWith('PM'))
          .map(kode => parseInt(kode.substring(2)) || 0)
          .sort((a, b) => b - a);

        const nextNumber = existingCodes.length > 0 ? existingCodes[0] + 1 : 1;
        form.value.kode_lembaga = 'PM' + String(nextNumber).padStart(5, '0');
      } else if (!editingId.value) {
        // No existing data, start with PM00001
        form.value.kode_lembaga = 'PM00001';
      }
    };

    // Lifecycle
    onMounted(async () => {
      console.log('🔵 PenerimaManfaatView component mounted successfully!')
      await Promise.all([
        fetchPenerimaManfaatData(),
        fetchJenisPenerima(),
        fetchJenisPorsi()
      ])
      // Generate preview kode after data is loaded
      generatePreviewKodeLembaga();
    })

    return {
      // State
      showAddForm,
      penerimaManfaatData,
      jenisPenerimaList,
      jenisPorsiList,
      loading,
      error,
      editingId,
      form,

      // Computed
      hasPenerimaManfaatData,

      // Methods
      fetchPenerimaManfaatData,
      savePenerimaManfaat,
      editPenerimaManfaat,
      deletePenerimaManfaat,
      cancelAdd,
    }
  }
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.btn {
  border-radius: 6px;
}

.badge {
  font-size: 0.85em;
}

.card {
  border-radius: 12px;
}
</style>