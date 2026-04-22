<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 text-dark fw-bold">
          <i class="bi bi-trash3 text-danger me-2"></i>
          Laporan Sampah (Food Waste)
        </h4>
        <p class="text-muted mb-0 small">Pencatatan sisa makanan, produksi, dan kerusakan olah</p>
      </div>
      <button
        class="btn btn-danger btn-lg rounded-pill px-4 shadow-sm"
        @click="showAddForm = true"
        v-if="!showAddForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Catat Sampah Baru
      </button>
    </div>

    <!-- Stats Row -->
    <div v-if="!showAddForm" class="row g-3 mb-4">
       <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-3 border-start border-5 border-info">
             <div class="d-flex align-items-center">
                <div class="p-3 bg-info bg-opacity-10 rounded-3 me-3">
                   <i class="bi bi-people text-info fs-4"></i>
                </div>
                <div>
                   <h6 class="text-muted mb-1 small text-uppercase fw-bold">Sisa Piring</h6>
                   <h4 class="mb-0 fw-bold">{{ stats.sisa_piring }} <small class="fs-6 fw-normal">laporan</small></h4>
                </div>
             </div>
          </div>
       </div>
       <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-3 border-start border-5 border-warning">
             <div class="d-flex align-items-center">
                <div class="p-3 bg-warning bg-opacity-10 rounded-3 me-3">
                   <i class="bi bi-fire text-warning fs-4"></i>
                </div>
                <div>
                   <h6 class="text-muted mb-1 small text-uppercase fw-bold">Sisa Produksi</h6>
                   <h4 class="mb-0 fw-bold">{{ stats.sisa_produksi }} <small class="fs-6 fw-normal">laporan</small></h4>
                </div>
             </div>
          </div>
       </div>
       <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-3 border-start border-5 border-danger">
             <div class="d-flex align-items-center">
                <div class="p-3 bg-danger bg-opacity-10 rounded-3 me-3">
                   <i class="bi bi-exclamation-triangle text-danger fs-4"></i>
                </div>
                <div>
                   <h6 class="text-muted mb-1 small text-uppercase fw-bold">Kerusakan Olah</h6>
                   <h4 class="mb-0 fw-bold">{{ stats.kerusakan_olah }} <small class="fs-6 fw-normal">laporan</small></h4>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Data Table Card -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <!-- Search and Filter -->
        <div class="p-3 bg-light border-bottom">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                v-model="dateFilter"
                type="date"
                class="form-control shadow-sm rounded-3"
              >
            </div>
            <div class="col-md-4">
              <select v-model="categoryFilter" class="form-select shadow-sm rounded-3">
                <option value="">Semua Kategori</option>
                <option value="sisa_piring">Sisa Piring (Plate Waste)</option>
                <option value="sisa_produksi">Sisa Produksi</option>
                <option value="kerusakan_olah">Kerusakan Olah</option>
              </select>
            </div>
            <div class="col-md-4 text-end">
               <button class="btn btn-outline-secondary rounded-pill px-3" @click="resetFilters">
                  <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
               </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data sampah...</p>
        </div>

        <div v-else-if="filteredLaporan.length === 0" class="text-center py-5">
          <i class="bi bi-trash display-1 text-muted opacity-25"></i>
          <h5 class="text-muted mt-3">Tidak ada data laporan sampah</h5>
          <button class="btn btn-danger btn-sm rounded-pill mt-2" @click="showAddForm = true">Buat Laporan Baru</button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase small fw-bold">
              <tr>
                <th class="ps-4">Tanggal</th>
                <th>Kategori</th>
                <th>Nama Menu / Bahan</th>
                <th class="text-end">Jumlah</th>
                <th>Pelapor</th>
                <th class="text-center">Foto</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedLaporan" :key="item.id_laporan_sampah">
                <td class="ps-4 fw-bold text-dark">{{ formatDate(item.tanggal) }}</td>
                <td>
                  <span class="badge rounded-pill px-3" :class="getCategoryClass(item.kategori)">
                    {{ formatCategory(item.kategori) }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold">{{ item.menu?.nama_menu || item.bahan_baku?.nama_bahan_baku || '-' }}</div>
                  <small class="text-muted italic" v-if="item.keterangan">{{ item.keterangan }}</small>
                </td>
                <td class="text-end fw-bold">
                  {{ formatNumber(item.jumlah) }} {{ item.satuan }}
                </td>
                <td>{{ item.pegawai?.nama_lengkap || '-' }}</td>
                <td class="text-center">
                  <div v-if="item.foto" class="image-thumb" @click="openImage(item.foto)">
                    <img :src="getImageUrl(item.foto)" class="rounded-2 border">
                  </div>
                  <span v-else class="text-muted small opacity-50">-</span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" @click="deleteLaporan(item.id_laporan_sampah)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-3 border-top bg-light text-center" v-if="totalPages > 1">
              <nav>
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage--">Prev</a>
                  </li>
                  <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                  </li>
                </ul>
              </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Add Laporan -->
    <div v-if="showAddForm" class="card border-0 shadow-lg rounded-4 overflow-hidden animate-slide-up">
       <div class="card-header bg-danger text-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">
            <i class="bi bi-plus-circle me-2"></i>
            Input Laporan Sampah Baru
          </h5>
          <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold text-danger" @click="cancelAdd">
            <i class="bi bi-x-lg me-1"></i> Batal
          </button>
       </div>
       <div class="card-body p-4">
          <form @submit.prevent="saveLaporan">
            <div class="row g-4">
              <!-- Info Section -->
              <div class="col-lg-8">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-muted">TANGGAL *</label>
                    <input v-model="form.tanggal" type="date" class="form-control form-control-lg bg-light border-0" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-muted">KATEGORI SAMPAH *</label>
                    <select v-model="form.kategori" class="form-select form-select-lg bg-light border-0" required>
                      <option value="sisa_piring">Sisa Piring (Plate Waste)</option>
                      <option value="sisa_produksi">Sisa Produksi (Dapur)</option>
                      <option value="kerusakan_olah">Kerusakan Olah / Tumpah</option>
                    </select>
                  </div>

                  <div class="col-md-12">
                    <label class="form-label fw-bold small text-muted">PILIH MENU ATAU BAHAN BAKU *</label>
                    <div class="btn-group w-100 mb-2 rounded-3 overflow-hidden shadow-sm" role="group">
                        <input type="radio" class="btn-check" name="type" id="type_menu" value="menu" v-model="entryType">
                        <label class="btn btn-outline-danger py-2" for="type_menu"><i class="bi bi-egg-fried me-2"></i> Menu Jadi</label>
                        
                        <input type="radio" class="btn-check" name="type" id="type_bahan" value="bahan" v-model="entryType">
                        <label class="btn btn-outline-danger py-2" for="type_bahan"><i class="bi bi-box-seam me-2"></i> Bahan Baku</label>
                    </div>

                    <v-select
                      v-if="entryType === 'menu'"
                      v-model="form.id_menu"
                      :options="menuList"
                      :reduce="opt => opt.id_menu"
                      label="nama_menu"
                      placeholder="Cari Menu..."
                      class="v-select-custom bg-light rounded-3"
                    />

                    <v-select
                      v-else
                      v-model="form.id_bahan_baku"
                      :options="bahanBakuList"
                      :reduce="opt => opt.id_bahan_baku"
                      label="nama_bahan_baku"
                      placeholder="Cari Bahan Baku..."
                      class="v-select-custom bg-light rounded-3"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-muted">JUMLAH *</label>
                    <input v-model="form.jumlah" type="number" step="0.01" class="form-control form-control-lg bg-light border-0 fw-bold" placeholder="0.00" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold small text-muted">SATUAN *</label>
                    <input v-model="form.satuan" type="text" class="form-control form-control-lg bg-light border-0" placeholder="porsi, kg, gram, dll" required>
                  </div>

                  <div class="col-md-12">
                    <label class="form-label fw-bold small text-muted">PELAPOR *</label>
                    <v-select
                      v-model="form.id_pegawai"
                      :options="pegawaiList"
                      :reduce="opt => opt.id_pegawai"
                      label="nama_lengkap"
                      placeholder="Pilih Pegawai..."
                      class="v-select-custom bg-light rounded-3"
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label fw-bold small text-muted">KETERANGAN / ALASAN</label>
                    <textarea v-model="form.keterangan" class="form-control bg-light border-0" rows="3" placeholder="Misal: Nasi basi karena rice cooker rusak..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Photo Section -->
              <div class="col-lg-4">
                <div class="card border-0 bg-light rounded-4 h-100 border border-secondary border-opacity-10 p-3">
                    <label class="form-label fw-bold small text-muted text-center mb-3">BUKTI FOTO SAMPAH</label>
                    <div class="photo-area flex-grow-1 d-flex flex-column align-items-center justify-content-center bg-white rounded-3 border-2 border-dashed p-3 mb-3" style="min-height: 200px;">
                        <img v-if="photoPreview" :src="photoPreview" class="img-fluid rounded-3 shadow-sm w-100 h-100" style="object-fit: contain;">
                        <div v-else class="text-center opacity-50">
                            <i class="bi bi-camera display-4 mb-2"></i>
                            <p class="small mb-0">Klik tombol di bawah untuk ambil foto</p>
                        </div>
                    </div>
                    <input type="file" ref="fileInput" class="d-none" accept="image/*" capture="environment" @change="handleFileChange">
                    <div class="d-grid gap-2">
                        <button type="button" class="btn btn-outline-danger rounded-pill" @click="$refs.fileInput.click()">
                            <i class="bi bi-camera-fill me-2"></i> {{ photoPreview ? 'Ganti Foto' : 'Ambil Foto' }}
                        </button>
                        <button v-if="photoPreview" type="button" class="btn btn-link btn-sm text-muted" @click="clearPhoto">Hapus Foto</button>
                    </div>
                </div>
              </div>

              <div class="col-12 text-end mt-4">
                  <hr class="mb-4">
                  <button type="button" class="btn btn-light btn-lg rounded-pill px-5 me-3" @click="cancelAdd">Batal</button>
                  <button type="submit" class="btn btn-danger btn-lg rounded-pill px-5 shadow" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="bi bi-check-lg me-2"></i> Simpan Laporan
                  </button>
              </div>
            </div>
          </form>
       </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="showImageModal = false">
        <div class="modal-content animate-zoom">
            <img :src="modalImage" class="img-fluid rounded shadow-lg">
            <button class="close-btn"><i class="bi bi-x-lg"></i></button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import laporanSampahService from '@/services/laporanSampahService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const showAddForm = ref(false)
const laporanList = ref([])
const menuList = ref([])
const bahanBakuList = ref([])
const pegawaiList = ref([])
const dateFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const entryType = ref('menu')

// Form & Photo
const fileInput = ref(null)
const photoPreview = ref(null)
const form = ref({
    tanggal: new Date().toISOString().split('T')[0],
    id_menu: null,
    id_bahan_baku: null,
    id_pegawai: null,
    kategori: 'sisa_piring',
    jumlah: '',
    satuan: 'porsi',
    keterangan: '',
    foto: null
})

// Modals
const showImageModal = ref(false)
const modalImage = ref('')

// Computed Stats
const stats = computed(() => {
    return {
        sisa_piring: laporanList.value.filter(i => i.kategori === 'sisa_piring').length,
        sisa_produksi: laporanList.value.filter(i => i.kategori === 'sisa_produksi').length,
        kerusakan_olah: laporanList.value.filter(i => i.kategori === 'kerusakan_olah').length
    }
})

const filteredLaporan = computed(() => {
    let filtered = [...laporanList.value]
    if (dateFilter.value) filtered = filtered.filter(i => i.tanggal.includes(dateFilter.value))
    if (categoryFilter.value) filtered = filtered.filter(i => i.kategori === categoryFilter.value)
    return filtered
})

const paginatedLaporan = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredLaporan.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredLaporan.value.length / itemsPerPage))

// Watcher for entry type cleanup
watch(entryType, (newVal) => {
    if (newVal === 'menu') {
        form.value.id_bahan_baku = null
        form.value.satuan = 'porsi'
    } else {
        form.value.id_menu = null
        form.value.satuan = 'kg'
    }
})

// Methods
const fetchData = async () => {
    try {
        loading.value = true
        const res = await laporanSampahService.getAll()
        laporanList.value = res.data.data || []
    } catch (e) {
        toast.error('Gagal memuat data')
    } finally {
        loading.value = false
    }
}

const fetchDependencies = async () => {
    try {
        const [m, b, p] = await Promise.all([
            laporanSampahService.getMenus(),
            laporanSampahService.getBahanBaku(),
            laporanSampahService.getPegawai()
        ])
        menuList.value = m.data.data || []
        bahanBakuList.value = b.data.data || []
        pegawaiList.value = p.data.data || []
    } catch (e) {}
}

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        form.value.foto = file
        const reader = new FileReader()
        reader.onload = (e) => photoPreview.value = e.target.result
        reader.readAsDataURL(file)
    }
}

const clearPhoto = () => {
    photoPreview.value = null
    form.value.foto = null
    if (fileInput.value) fileInput.value.value = ''
}

const saveLaporan = async () => {
    try {
        saving.value = true
        await laporanSampahService.create(form.value)
        toast.success('Laporan sampah berhasil disimpan')
        cancelAdd()
        fetchData()
    } catch (e) {
        const msg = e.response?.data?.message || 'Gagal menyimpan data'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

const deleteLaporan = async (id) => {
    const res = await Swal.fire({
        title: 'Hapus Laporan?',
        text: 'Data ini akan dihapus permanen.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Hapus'
    })
    if (res.isConfirmed) {
        try {
            await laporanSampahService.delete(id)
            toast.success('Dihapus')
            fetchData()
        } catch (e) { toast.error('Gagal menghapus') }
    }
}

const cancelAdd = () => {
    showAddForm.value = false
    form.value = {
        tanggal: new Date().toISOString().split('T')[0],
        id_menu: null,
        id_bahan_baku: null,
        id_pegawai: null,
        kategori: 'sisa_piring',
        jumlah: '',
        satuan: 'porsi',
        keterangan: '',
        foto: null
    }
    photoPreview.value = null
}

const resetFilters = () => {
    dateFilter.value = ''
    categoryFilter.value = ''
}

// Helpers
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const formatNumber = (n) => parseFloat(n).toLocaleString('id-ID')
const formatCategory = (c) => c.replace('_', ' ').toUpperCase()
const getCategoryClass = (c) => {
    if (c === 'sisa_piring') return 'bg-info bg-opacity-10 text-info'
    if (c === 'sisa_produksi') return 'bg-warning bg-opacity-10 text-warning text-dark'
    return 'bg-danger bg-opacity-10 text-danger'
}
const getImageUrl = (p) => `${import.meta.env.VITE_API_URL_BASE || 'http://localhost:8000'}/storage/${p}`
const openImage = (p) => {
    modalImage.value = getImageUrl(p)
    showImageModal.value = true
}

onMounted(() => {
    fetchData()
    fetchDependencies()
})
</script>

<style scoped>
.v-select-custom :deep(.vs__dropdown-toggle) {
    border: none;
    padding: 8px;
}
.image-thumb {
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: inline-block;
}
.image-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
.modal-content {
    max-width: 80%;
    max-height: 80%;
    position: relative;
}
.close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
}
.animate-slide-up {
    animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
.italic { font-style: italic; }
</style>
