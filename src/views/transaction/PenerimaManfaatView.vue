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
        class="btn btn-primary rounded-pill px-4"
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
        <div class="mb-4 text-primary opacity-25">
          <i class="bi bi-person-check" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark fw-bold">Belum Ada Data Penerima Manfaat</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data penerima manfaat pertama Anda</p>
        <button class="btn btn-primary rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Penerima Pertama
        </button>
      </div>
    </div>

    <!-- Tabel Data -->
    <div v-if="hasPenerimaManfaatData && !showAddForm" class="card border-0 shadow-sm overflow-hidden">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <h5 class="mb-0 fw-bold text-dark">
              Data Penerima Manfaat
            </h5>
            <span class="badge bg-primary-light">
              {{ filteredPenerimaManfaatData.length }} Data
            </span>
          </div>
          
          <div class="d-flex gap-2">
            <div class="input-group input-group-sm" style="max-width: 250px;">
              <span class="input-group-text bg-light border-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-light border-0" 
                placeholder="Cari..." 
                v-model="searchQuery"
              >
            </div>
            <button class="btn btn-light btn-sm rounded-3" @click="fetchPenerimaManfaatData" title="Refresh Data">
              <i class="bi bi-arrow-clockwise text-primary"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive table-scrollable">
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
                  <i class="bi bi-pie-chart me-1"></i>Porsi (B/K)
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
              <tr v-if="filteredPenerimaManfaatData.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="text-muted">
                    <i class="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                    <p class="mb-0">Data tidak ditemukan</p>
                  </div>
                </td>
              </tr>
              <tr v-for="item in filteredPenerimaManfaatData" :key="item.id_penerima">
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
                  <div class="d-flex flex-column gap-1">
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary text-start">
                      B: <strong>{{ item.porsi_besar || 0 }}</strong>
                    </span>
                    <span class="badge bg-info bg-opacity-10 text-info border border-info text-start">
                      K: <strong>{{ item.porsi_kecil || 0 }}</strong>
                    </span>
                  </div>
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
    <div v-if="showAddForm" class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown" ref="penerimaFormCard">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-person-plus me-2"></i>
          {{ editingId ? 'Edit' : 'Tambah' }} Penerima Manfaat
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
        <form @submit.prevent="savePenerimaManfaat">
          <!-- Row 1: Identitas Lembaga -->
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold">Kode Lembaga *</label>
              <input
                v-model="form.kode_lembaga"
                type="text"
                class="form-control bg-light"
                readonly
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Nama Lembaga *</label>
              <input
                ref="namaLembagaInput"
                v-model="form.nama_lembaga"
                type="text"
                class="form-control"
                placeholder="Contoh: SD N 1 Pekalongan"
                required
              >
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold">NPSN/NSS</label>
              <input
                v-model="form.npsn_nss"
                type="text"
                class="form-control"
                placeholder="Masukkan NPSN/NSS"
              >
            </div>
          </div>

          <!-- Row 2: Penanggung Jawab & Kontak -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Jenis Penerima *</label>
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
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Kepala Sekolah *</label>
              <input
                v-model="form.kepala_sekolah"
                type="text"
                class="form-control"
                placeholder="Nama Kepala Sekolah"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Telepon</label>
              <input
                v-model="form.telepon"
                type="text"
                class="form-control"
                placeholder="Nomor Telepon"
              >
            </div>
          </div>

          <!-- Row 3: Administrasi -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="Alamat Email"
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Tanggal Daftar *</label>
              <input
                v-model="form.tanggal_daftar"
                type="date"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Status *</label>
              <select v-model="form.status" class="form-select" required>
                <option value="">Pilih Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="meninggal">Meninggal</option>
                <option value="pindah">Pindah</option>
              </select>
            </div>
          </div>

          <!-- Row 4: Alamat -->
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label fw-bold">Alamat Lengkap *</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="2"
                placeholder="Masukkan alamat lengkap lembaga"
                required
              ></textarea>
            </div>
          </div>

          <!-- Row 5: Lokasi -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Kecamatan *</label>
              <input
                v-model="form.kecamatan"
                type="text"
                class="form-control"
                placeholder="Kecamatan"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Kabupaten/Kota *</label>
              <input
                v-model="form.kabupaten_kota"
                type="text"
                class="form-control"
                placeholder="Kabupaten/Kota"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label fw-bold">Provinsi *</label>
              <input
                v-model="form.provinsi"
                type="text"
                class="form-control"
                placeholder="Provinsi"
                required
              >
            </div>
          </div>

          <!-- Row 6: Statistik & Gizi -->
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold">Jumlah Siswa</label>
              <input
                v-model="form.jumlah_siswa"
                type="number"
                class="form-control"
                placeholder="Jumlah Siswa"
                min="0"
              >
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold text-primary">Porsi Besar</label>
              <input v-model="form.porsi_besar" type="number" class="form-control border-primary border-opacity-25" min="0" placeholder="0">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold text-info">Porsi Kecil</label>
              <input v-model="form.porsi_kecil" type="number" class="form-control border-info border-opacity-25" min="0" placeholder="0">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label fw-bold">Status Gizi Umum *</label>
              <select v-model="form.status_gizi_umum" class="form-select" required>
                <option value="">Pilih Status Gizi</option>
                <option value="baik">Baik</option>
                <option value="cukup">Cukup</option>
                <option value="kurang">Kurang</option>
                <option value="buruk">Buruk</option>
              </select>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-outline-secondary px-4" @click="cancelAdd">
              Batal
            </button>
            <button type="submit" class="btn btn-primary px-4 shadow-sm" :disabled="loading">
              <i class="bi bi-check-circle me-2"></i>
              {{ loading ? 'Menyimpan...' : (editingId ? 'Update Data' : 'Simpan Data') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-show="false">
         <!-- Hidden dummy to keep nextNumber logic compatible if needed, though we removed porsi_sedang -->
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import penerimaManfaatService from '@/services/penerimaManfaatService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

export default {
  name: 'PenerimaManfaatView',
  setup() {
    // Toast notification
    const toast = useToast()
    
    // State management
    const showAddForm = ref(false)
    const penerimaManfaatData = ref([])
    const jenisPenerimaList = ref([])
    const jenisPorsiList = ref([])
    const loading = ref(false)
    const error = ref('')
    const editingId = ref(null)
    const searchQuery = ref('')
    const namaLembagaInput = ref(null)
    
    // Ref for form card (for auto-scroll)
    const penerimaFormCard = ref(null)

    // Form data
    const form = ref({
      id_jenis_penerima: '',
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
      porsi_besar: 0,
      porsi_kecil: 0,
      status_gizi_umum: '',
      tanggal_daftar: '',
      status: '',
    })

    // Computed properties
    const hasPenerimaManfaatData = computed(() => {
      return penerimaManfaatData.value && penerimaManfaatData.value.length > 0
    })

    const filteredPenerimaManfaatData = computed(() => {
      if (!searchQuery.value) {
        return penerimaManfaatData.value
      }
      
      const query = searchQuery.value.toLowerCase()
      return penerimaManfaatData.value.filter(item => {
        return (
          (item.nama_lembaga && item.nama_lembaga.toLowerCase().includes(query)) ||
          (item.kode_lembaga && item.kode_lembaga.toLowerCase().includes(query)) ||
          (item.kepala_sekolah && item.kepala_sekolah.toLowerCase().includes(query)) ||
          (item.kabupaten_kota && item.kabupaten_kota.toLowerCase().includes(query)) ||
          (item.alamat && item.alamat.toLowerCase().includes(query))
        )
      })
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
        error.value = 'Gagal memuat data penerima manfaat: ' + (err.message || 'Terjadi kesalahan sistem')
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
        const isEditing = !!editingId.value

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

        // Show success toast
        if (isEditing) {
          toast.success('Penerima manfaat berhasil diperbarui!')
        } else {
          toast.success('Penerima manfaat berhasil ditambahkan!')
        }
      } catch (err) {
        console.error('Error saving penerima manfaat:', err)

        // Handle validation errors from Laravel (err is already error.response.data due to interceptor)
        if (err.errors) {
          console.error('Validation errors:', err.errors)
          const errorMessages = Object.values(err.errors).flat()
          toast.error('Validasi gagal: ' + errorMessages.join(', '), { timeout: 7000 })
        } else {
          toast.error('Gagal menyimpan data penerima manfaat: ' + (err.message || 'Terjadi kesalahan sistem'), { timeout: 5000 })
        }
      } finally {
        loading.value = false
      }
    }

    const editPenerimaManfaat = (item) => {
      console.log('Original penerima manfaat data:', item)

      form.value = {
        id_jenis_penerima: item.id_jenis_penerima || '',
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
        porsi_besar: item.porsi_besar || 0,
        porsi_kecil: item.porsi_kecil || 0,
        status_gizi_umum: item.status_gizi_umum || '',
        tanggal_daftar: item.tanggal_daftar ? item.tanggal_daftar.split('T')[0].split(' ')[0] : '',
        status: item.status || '',
      }

      editingId.value = item.id_penerima
      showAddForm.value = true
      
      // Auto focus and scroll
      nextTick(() => {
        if (penerimaFormCard.value) {
          penerimaFormCard.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        if (namaLembagaInput.value) {
          namaLembagaInput.value.focus()
        }
      })
    }

    const deletePenerimaManfaat = async (id) => {
      // Find the penerima data to show in confirmation
      const penerima = penerimaManfaatData.value.find(item => item.id_penerima === id)
      
      const result = await Swal.fire({
        title: 'Hapus Penerima Manfaat?',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>Anda akan menghapus:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p style="margin: 5px 0;"><strong>Kode:</strong> ${penerima?.kode_lembaga || '-'}</p>
              <p style="margin: 5px 0;"><strong>Nama Lembaga:</strong> ${penerima?.nama_lembaga || '-'}</p>
              <p style="margin: 5px 0;"><strong>Jenis:</strong> ${penerima?.nama_jenis_penerima || '-'}</p>
              <p style="margin: 5px 0;"><strong>Lokasi:</strong> ${penerima?.kabupaten_kota || '-'}</p>
            </div>
            <p style="margin-top: 15px; color: #dc3545;"><strong>⚠️ Data yang dihapus tidak dapat dikembalikan!</strong></p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        width: '500px'
      })
      
      if (result.isConfirmed) {
        try {
          loading.value = true
          await penerimaManfaatService.delete(id)
          await fetchPenerimaManfaatData()
          // Regenerate preview kode after deletion
          generatePreviewKodeLembaga()
          toast.success('Penerima manfaat berhasil dihapus!')
        } catch (err) {
          console.error('Error deleting penerima manfaat:', err)
          toast.error('Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan sistem'))
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
        porsi_besar: 0,
        porsi_kecil: 0,
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
        fetchJenisPenerima()
      ])
      // Generate preview kode after data is loaded
      generatePreviewKodeLembaga();
    })

    return {
      showAddForm,
      penerimaFormCard,
      penerimaManfaatData,
      jenisPenerimaList,
      jenisPorsiList,
      loading,
      error,
      editingId,
      searchQuery,
      filteredPenerimaManfaatData,
      form,
      hasPenerimaManfaatData,
      fetchPenerimaManfaatData,
      savePenerimaManfaat,
      editPenerimaManfaat,
      deletePenerimaManfaat,
      cancelAdd,
      penerimaFormCard,
      namaLembagaInput
    }
  }
}
</script>

<style scoped>
.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table thead th:first-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.table thead th:last-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
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

/* Scrollable Table Styles */
.table-scrollable {
  max-height: 70vh;
  overflow-y: auto;
}

.table-scrollable thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Optional: adds subtle shadow to header */
}
</style>