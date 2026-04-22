<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 text-dark fw-bold">
          <i class="bi bi-truck text-primary me-2"></i>
          Penerimaan Barang
        </h4>
        <p class="text-muted mb-0 small">Pencatatan barang masuk dari supplier dengan bukti foto dan timbangan</p>
      </div>
      <button
        class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddForm = true"
        v-if="!showAddForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Terima Barang Baru
      </button>
    </div>

    <!-- Data Table -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <!-- Search and Filter -->
        <div class="p-3 bg-light border-bottom">
          <div class="row g-3">
            <div class="col-md-5">
              <div class="input-group shadow-sm rounded-3 overflow-hidden">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control border-start-0"
                  placeholder="Cari nomor transaksi, SJ, atau bahan baku..."
                >
              </div>
            </div>
            <div class="col-md-4">
              <div class="input-group shadow-sm rounded-3 overflow-hidden">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-calendar-event text-muted"></i>
                </span>
                <input
                  v-model="dateFilter"
                  type="date"
                  class="form-control border-start-0"
                >
              </div>
            </div>
            <div class="col-md-3 text-end d-flex align-items-center justify-content-end">
              <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                Total: {{ filteredPenerimaan.length }} Penerimaan
              </span>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data penerimaan barang...</p>
        </div>

        <div v-else-if="filteredPenerimaan.length === 0" class="text-center py-5">
          <div class="mb-3">
            <i class="bi bi-inbox display-1 text-muted opacity-25"></i>
          </div>
          <h5 class="text-muted">Belum ada data penerimaan barang</h5>
          <p class="text-muted small">Mulai catat barang masuk pertama Anda</p>
          <button class="btn btn-primary rounded-pill px-4 shadow-sm" @click="showAddForm = true">
            <i class="bi bi-plus-circle me-2"></i>
            Terima Barang
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase small fw-bold">
              <tr>
                <th class="ps-4">Tanggal / No. Transaksi</th>
                <th>SJ / Supplier</th>
                <th>Bahan Baku</th>
                <th class="text-end">Jumlah</th>
                <th class="text-end">Berat Riil</th>
                <th>Foto</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedPenerimaan" :key="item.id_stok_opname" class="transition-all">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ formatDate(item.tanggal_transaksi) }}</div>
                  <small class="text-muted">{{ item.nomor_transaksi }}</small>
                </td>
                <td>
                  <div class="fw-bold">{{ item.nomor_surat_jalan || '-' }}</div>
                  <small class="text-muted">{{ item.supplier?.nama_supplier || 'Tanpa Supplier' }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="p-2 bg-primary bg-opacity-10 rounded-3 me-2">
                      <i class="bi bi-box text-primary"></i>
                    </div>
                    <div class="fw-bold">{{ item.bahan_baku?.nama_bahan_baku || '-' }}</div>
                  </div>
                </td>
                <td class="text-end fw-bold text-primary">
                  {{ formatNumber(item.jumlah) }} {{ item.bahan_baku?.satuan?.nama_satuan || '' }}
                </td>
                <td class="text-end">
                   <span v-if="item.berat_timbangan" class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                      {{ formatNumber(item.berat_timbangan) }} kg
                   </span>
                   <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <div v-if="item.foto_barang" class="image-preview-thumbnail shadow-sm rounded-2 overflow-hidden border" @click="openImage(item.foto_barang)">
                    <img :src="getImageUrl(item.foto_barang)" alt="Foto Barang" style="width: 40px; height: 40px; object-fit: cover;">
                  </div>
                  <span v-else class="text-muted small opacity-50">No Photo</span>
                </td>
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-2">
                    <button
                      class="btn btn-sm btn-light text-primary rounded-circle shadow-sm"
                      @click="viewDetail(item)"
                      title="Detail"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-light text-danger rounded-circle shadow-sm"
                      @click="deletePenerimaan(item.id_stok_opname)"
                      title="Hapus"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="p-3 border-top bg-light">
             <nav v-if="totalPages > 1">
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link rounded-start-pill" href="#" @click.prevent="currentPage--">Previous</a>
                  </li>
                  <li
                    v-for="page in totalPages"
                    :key="page"
                    class="page-item"
                    :class="{ active: currentPage === page }"
                  >
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link rounded-end-pill" href="#" @click.prevent="currentPage++">Next</a>
                  </li>
                </ul>
              </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Terima Barang -->
    <div v-if="showAddForm" class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
      <div class="card-header text-white py-3 border-0 d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;">
        <h5 class="mb-0 fw-bold">
          <i class="bi bi-plus-circle me-2"></i>
          Penerimaan Barang Baru
        </h5>
        <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary" @click="cancelAdd">
          <i class="bi bi-x-lg me-1"></i>
          Batal
        </button>
      </div>
      <div class="card-body p-4">
        <form @submit.prevent="savePenerimaan">
          <div class="row g-4">
            <!-- Left Side: Basic Info -->
            <div class="col-lg-8">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase text-muted">Nomor Surat Jalan</label>
                  <input
                    v-model="form.nomor_surat_jalan"
                    type="text"
                    class="form-control form-control-lg bg-light border-0"
                    placeholder="Masukkan No. SJ Supplier"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase text-muted">Tanggal Terima *</label>
                  <input
                    v-model="form.tanggal_transaksi"
                    type="date"
                    class="form-control form-control-lg border-primary border-opacity-25"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase text-muted">Supplier</label>
                  <v-select
                    v-model="form.id_supplier"
                    :options="supplierList"
                    :reduce="supplier => supplier.id_supplier"
                    label="nama_supplier"
                    placeholder="Pilih Supplier"
                    class="v-select-custom bg-light rounded-3"
                  >
                     <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ada hasil untuk <em>{{ search }}</em>.
                      </template>
                      <em v-else style="opacity: 0.5">Ketik untuk mencari supplier...</em>
                    </template>
                  </v-select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold small text-uppercase text-muted">Pelaksana (Pegawai)</label>
                  <v-select
                    v-model="form.id_pegawai"
                    :options="pegawaiList"
                    :reduce="pegawai => pegawai.id_pegawai"
                    label="nama_lengkap"
                    placeholder="Pilih Pegawai yang menerima"
                    class="v-select-custom bg-light rounded-3"
                  />
                </div>

                <div class="col-12">
                   <div class="p-3 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 mt-2">
                      <div class="row g-3">
                        <div class="col-md-7">
                          <label class="form-label fw-bold small text-uppercase text-primary">Bahan Baku *</label>
                          <v-select
                            v-model="form.id_bahan_baku"
                            :options="bahanBakuList"
                            :reduce="option => option.id_bahan_baku"
                            label="nama_bahan_baku"
                            placeholder="Cari & Pilih Bahan Baku"
                            @option:selected="onBahanBakuChange"
                            :clearable="false"
                            class="v-select-custom bg-white border-0"
                          >
                            <template #option="{ nama_bahan_baku, stok, satuan }">
                              {{ nama_bahan_baku }} <span class="badge bg-secondary ms-2 small">Stok: {{ stok }} {{ satuan?.nama_satuan || '' }}</span>
                            </template>
                          </v-select>
                        </div>
                        <div class="col-md-5">
                          <label class="form-label fw-bold small text-uppercase text-primary">Jumlah Masuk (SJ) *</label>
                          <div class="input-group">
                            <input
                              v-model="form.jumlah"
                              type="number"
                              step="0.01"
                              class="form-control form-control-lg border-0 fw-bold"
                              placeholder="0.00"
                              required
                            >
                            <span class="input-group-text bg-white border-0 text-muted">{{ selectedBahanUnit }}</span>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div class="col-md-6 mt-4">
                  <label class="form-label fw-bold small text-uppercase text-muted">Hasil Timbangan Riil (kg)</label>
                  <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                    <span class="input-group-text bg-white border-0">
                      <i class="bi bi-speedometer text-info"></i>
                    </span>
                    <input
                      v-model="form.berat_timbangan"
                      type="number"
                      step="0.01"
                      class="form-control border-0 fw-bold text-info"
                      placeholder="0.00"
                    >
                    <span class="input-group-text bg-white border-0 text-muted small">kg</span>
                  </div>
                  <div class="form-text small">Masukkan berat riil saat barang datang</div>
                </div>

                <div class="col-md-6 mt-4">
                  <label class="form-label fw-bold small text-uppercase text-muted">Harga Satuan (Opsional)</label>
                  <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                    <span class="input-group-text bg-white border-0">Rp</span>
                    <input
                      v-model="form.harga_satuan"
                      type="number"
                      step="0.01"
                      class="form-control border-0 fw-bold"
                      placeholder="0"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Photo Capture -->
            <div class="col-lg-4">
               <div class="card border-0 bg-light rounded-4 h-100 shadow-sm border border-secondary border-opacity-10">
                  <div class="card-body d-flex flex-column">
                    <label class="form-label fw-bold small text-uppercase text-muted mb-3 text-center">
                       <i class="bi bi-camera-fill me-1"></i> Bukti Foto Barang
                    </label>
                    
                    <div class="photo-capture-area flex-grow-1 d-flex flex-column align-items-center justify-content-center bg-white rounded-3 border-2 border-dashed p-3 mb-3" style="min-height: 250px;">
                        <template v-if="photoPreview">
                            <div class="position-relative w-100 h-100">
                                <img :src="photoPreview" class="img-fluid rounded-3 shadow-sm w-100 h-100" style="object-fit: contain;">
                                <button type="button" class="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 m-2" @click="clearPhoto">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-center p-4">
                                <i class="bi bi-camera display-4 text-muted opacity-50 mb-3"></i>
                                <p class="text-muted small mb-0">Ambil foto atau upload file</p>
                            </div>
                        </template>
                    </div>

                    <div class="d-grid gap-2">
                        <input 
                            type="file" 
                            ref="fileInput" 
                            class="d-none" 
                            accept="image/*" 
                            capture="environment"
                            @change="handleFileChange"
                        >
                        <button type="button" class="btn btn-outline-primary rounded-pill py-2" @click="$refs.fileInput.click()">
                            <i class="bi bi-camera-fill me-2"></i> {{ photoPreview ? 'Ganti Foto' : 'Ambil / Pilih Foto' }}
                        </button>
                    </div>
                  </div>
               </div>
            </div>

            <div class="col-12 mt-4">
              <label class="form-label fw-bold small text-uppercase text-muted">Keterangan Tambahan</label>
              <textarea
                v-model="form.keterangan"
                class="form-control bg-light border-0"
                rows="2"
                placeholder="Tambahkan catatan jika diperlukan..."
              ></textarea>
            </div>

            <div class="col-12">
               <hr class="my-4">
               <div class="d-flex justify-content-end gap-3">
                    <button type="button" class="btn btn-light btn-lg rounded-pill px-5 fw-bold" @click="cancelAdd">
                      Batal
                    </button>
                    <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i v-else class="bi bi-check-lg me-2"></i>
                      Simpan Penerimaan
                    </button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Image Detail -->
    <div v-if="showImageModal" class="image-modal" @click="showImageModal = false">
        <div class="modal-content animate-zoom">
            <img :src="modalImage" class="img-fluid rounded shadow-lg">
            <button class="close-btn"><i class="bi bi-x-lg"></i></button>
        </div>
    </div>

    <!-- Detail Transaction View Modal (Optional Enhancement) -->
     <div v-if="selectedDetail" class="card mt-4 border-info border-2 shadow-lg rounded-4 animate-slide-up">
        <div class="card-header bg-info bg-opacity-10 text-info py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">
            <i class="bi bi-info-circle-fill me-2"></i>
            Detail Penerimaan Barang
          </h5>
          <button type="button" class="btn-close" @click="selectedDetail = null"></button>
        </div>
        <div class="card-body">
           <div class="row g-4">
              <div class="col-md-4">
                  <div class="p-3 bg-light rounded-4 h-100 text-center d-flex align-items-center justify-content-center border">
                      <img v-if="selectedDetail.foto_barang" :src="getImageUrl(selectedDetail.foto_barang)" class="img-fluid rounded shadow-sm max-h-200">
                      <div v-else class="text-muted opacity-50">
                          <i class="bi bi-camera display-4 mb-2"></i>
                          <p>Tidak ada foto</p>
                      </div>
                  </div>
              </div>
              <div class="col-md-8">
                  <div class="row g-3">
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">No. Transaksi</small>
                          <div class="fw-bold">{{ selectedDetail.nomor_transaksi }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Tanggal</small>
                          <div class="fw-bold">{{ formatDate(selectedDetail.tanggal_transaksi) }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Supplier</small>
                          <div class="fw-bold">{{ selectedDetail.supplier?.nama_supplier || '-' }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">No. Surat Jalan</small>
                          <div class="fw-bold text-primary">{{ selectedDetail.nomor_surat_jalan || '-' }}</div>
                      </div>
                      <div class="col-12"><hr class="my-2 opacity-10"></div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Bahan Baku</small>
                          <div class="fw-bold fs-5">{{ selectedDetail.bahan_baku?.nama_bahan_baku }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Jumlah Terima</small>
                          <div class="fw-bold fs-5 text-success">{{ formatNumber(selectedDetail.jumlah) }} {{ selectedDetail.bahan_baku?.satuan?.nama_satuan }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Berat Riil Timbangan</small>
                          <div class="fw-bold">{{ selectedDetail.berat_timbangan ? selectedDetail.berat_timbangan + ' kg' : '-' }}</div>
                      </div>
                      <div class="col-6">
                          <small class="text-muted text-uppercase fw-bold">Petugas Penerima</small>
                          <div class="fw-bold">{{ selectedDetail.pegawai?.nama_lengkap || '-' }}</div>
                      </div>
                      <div class="col-12" v-if="selectedDetail.keterangan">
                          <small class="text-muted text-uppercase fw-bold">Keterangan</small>
                          <div class="p-2 bg-light rounded border-start border-3 border-info italic">{{ selectedDetail.keterangan }}</div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
     </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import stokOpnameService from '@/services/stokOpnameService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const showAddForm = ref(false)
const penerimaanList = ref([])
const bahanBakuList = ref([])
const supplierList = ref([])
const pegawaiList = ref([])
const searchQuery = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedDetail = ref(null)

// Photo handling
const fileInput = ref(null)
const photoPreview = ref(null)
const selectedFile = ref(null)

// Modal Handling
const showImageModal = ref(false)
const modalImage = ref('')

// Form
const form = ref({
  nomor_transaksi: '', // Auto-generated by backend
  tanggal_transaksi: new Date().toISOString().split('T')[0],
  jenis_transaksi: 'masuk', // Fixed to masuk
  id_bahan_baku: '',
  id_supplier: '',
  id_pegawai: '',
  jumlah: '',
  harga_satuan: '',
  keterangan: '',
  berat_timbangan: '',
  nomor_surat_jalan: '',
  foto_barang: null
})

// UI Helpers
const selectedBahanUnit = ref('')

// Computed
const filteredPenerimaan = computed(() => {
  let filtered = penerimaanList.value.filter(item => item.jenis_transaksi === 'masuk')

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.nomor_transaksi.toLowerCase().includes(query) ||
      (item.nomor_surat_jalan || '').toLowerCase().includes(query) ||
      (item.bahan_baku?.nama_bahan_baku || '').toLowerCase().includes(query) ||
      (item.supplier?.nama_supplier || '').toLowerCase().includes(query)
    )
  }

  if (dateFilter.value) {
    filtered = filtered.filter(item => item.tanggal_transaksi.includes(dateFilter.value))
  }

  return filtered
})

const paginatedPenerimaan = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPenerimaan.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPenerimaan.value.length / itemsPerPage)
})

// Methods
const fetchData = async () => {
  try {
    loading.value = true
    const response = await stokOpnameService.getAll()
    penerimaanList.value = response.data || []
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Gagal memuat data penerimaan')
  } finally {
    loading.value = false
  }
}

const fetchDependencies = async () => {
  try {
    const [bahan, supplier, pegawai] = await Promise.all([
      stokOpnameService.getBahanBakuStock(),
      stokOpnameService.getSuppliers(),
      stokOpnameService.getPegawai()
    ])
    bahanBakuList.value = bahan.data || []
    supplierList.value = supplier.data || []
    pegawaiList.value = pegawai.data || []
  } catch (error) {
    console.error('Error fetching dependencies:', error)
  }
}

const onBahanBakuChange = (bahan) => {
  if (bahan) {
    selectedBahanUnit.value = bahan.satuan?.nama_satuan || ''
  } else {
    selectedBahanUnit.value = ''
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    form.value.foto_barang = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const clearPhoto = () => {
  photoPreview.value = null
  selectedFile.value = null
  form.value.foto_barang = null
  if (fileInput.value) fileInput.value.value = ''
}

const savePenerimaan = async () => {
  try {
    saving.value = true
    
    // Prepare data
    const dataToSend = { ...form.value }
    
    await stokOpnameService.create(dataToSend)
    
    toast.success('Penerimaan barang berhasil dicatat')
    showAddForm.value = false
    resetForm()
    await fetchData()
  } catch (error) {
    console.error('Error saving:', error)
    const message = error.errors ? Object.values(error.errors).flat().join(', ') : (error.message || 'Gagal menyimpan data')
    toast.error('Gagal: ' + message)
  } finally {
    saving.value = false
  }
}

const deletePenerimaan = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus Transaksi?',
        text: 'Riwayat stok akan dikembalikan (stok awal akan disesuaikan).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            await stokOpnameService.delete(id)
            toast.success('Data penerimaan berhasil dihapus')
            await fetchData()
        } catch (error) {
            toast.error('Gagal menghapus data')
        }
    }
}

const viewDetail = (item) => {
  selectedDetail.value = item
  // Scroll to detail if needed
  setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 100)
}

const cancelAdd = () => {
  showAddForm.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    nomor_transaksi: '',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    jenis_transaksi: 'masuk',
    id_bahan_baku: '',
    id_supplier: '',
    id_pegawai: '',
    jumlah: '',
    harga_satuan: '',
    keterangan: '',
    berat_timbangan: '',
    nomor_surat_jalan: '',
    foto_barang: null
  }
  photoPreview.value = null
  selectedFile.value = null
  selectedBahanUnit.value = ''
}

const getImageUrl = (path) => {
  if (!path) return ''
  const baseUrl = import.meta.env.VITE_API_URL_BASE || 'http://localhost:8000'
  return `${baseUrl}/storage/${path}`
}

const openImage = (path) => {
    modalImage.value = getImageUrl(path)
    showImageModal.value = true
}

const formatNumber = (num) => {
  return num ? parseFloat(num).toLocaleString('id-ID') : '0'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  fetchData()
  fetchDependencies()
})
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}

.table tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.03);
}

.image-preview-thumbnail {
  cursor: pointer;
  transition: transform 0.2s;
  display: inline-block;
}

.image-preview-thumbnail:hover {
  transform: scale(1.1);
}

.v-select-custom :deep(.vs__dropdown-toggle) {
  border: none;
  background: transparent;
  padding: 0.5rem;
}

.v-select-custom :deep(.vs__selected) {
  font-weight: 600;
}

.max-h-200 {
  max-height: 200px;
  width: auto;
}

/* Image Modal */
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
    padding: 20px;
}

.modal-content {
    max-width: 90%;
    max-height: 90%;
    position: relative;
}

.animate-zoom {
    animation: zoom 0.3s ease;
}

@keyframes zoom {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.animate-slide-up {
    animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* Custom shadow and rounded */
.shadow-lg {
    box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
}

.rounded-4 {
    border-radius: 1rem!important;
}

.italic {
    font-style: italic;
}
</style>
