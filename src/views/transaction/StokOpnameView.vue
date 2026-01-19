<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">
          <i class="bi bi-clipboard-check text-primary me-2"></i>
          Stok Opname
        </h4>
        <p class="text-muted mb-0 small">Pencatatan dan pengelolaan stok bahan baku</p>
      </div>
      <button
        class="btn btn-primary btn-lg rounded-pill px-4"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddForm = true"
        v-if="!showAddForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Catat Stok
      </button>
    </div>

    <!-- Data Table -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm">
      <div class="card-body">
        <!-- Search and Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0"
                placeholder="Cari nomor transaksi atau bahan baku..."
              >
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="jenisFilter" class="form-select">
              <option value="">Semua Jenis</option>
              <option value="masuk">Stok Masuk</option>
              <option value="keluar">Stok Keluar</option>
              <option value="penyesuaian">Penyesuaian</option>
            </select>
          </div>
          <div class="col-md-3">
            <input
              v-model="dateFilter"
              type="date"
              class="form-control"
              placeholder="Filter tanggal"
            >
          </div>
          <div class="col-md-2 text-end">
            <small class="text-muted">
              Total: {{ filteredStokOpname.length }} transaksi
            </small>
          </div>
        </div>

        <!-- Table -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data stok opname...</p>
        </div>

        <div v-else-if="filteredStokOpname.length === 0" class="text-center py-5">
          <i class="bi bi-clipboard-check display-1 text-muted"></i>
          <h5 class="mt-3 text-muted">Belum ada data stok opname</h5>
          <p class="text-muted">Catat stok pertama untuk memulai</p>
          <button class="btn btn-primary rounded-pill px-4" @click="showAddForm = true">
            <i class="bi bi-plus-circle me-2"></i>
            Catat Stok
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Nomor Transaksi</th>
                <th>Jenis</th>
                <th>Bahan Baku</th>
                <th>Jumlah</th>
                <th>Stok Awal</th>
                <th>Stok Akhir</th>
                <th>Pelaksana</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stok in paginatedStokOpname" :key="stok.id_stok_opname">
                <td class="align-middle">{{ formatDate(stok.tanggal_transaksi) }}</td>
                <td class="align-middle">
                  <span class="badge bg-dark">{{ stok.nomor_transaksi }}</span>
                </td>
                <td class="align-middle">
                  <span :class="getJenisBadgeClass(stok.jenis_transaksi)">
                    {{ getJenisLabel(stok.jenis_transaksi) }}
                  </span>
                </td>
                <td class="align-middle">{{ stok.bahan_baku?.nama_bahan_baku || '-' }}</td>
                <td class="align-middle">{{ formatNumber(stok.jumlah) }} {{ stok.bahan_baku?.satuan?.nama_satuan || '' }}</td>
                <td class="align-middle">{{ formatNumber(stok.stok_awal) }}</td>
                <td class="align-middle">
                  <strong :class="getStokColor(stok.stok_awal, stok.current_stock)">
                    {{ formatNumber(stok.current_stock) }}
                  </strong>
                </td>
                <td class="align-middle">{{ stok.pegawai?.nama_lengkap || '-' }}</td>
                <td class="align-middle">
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="viewDetail(stok)"
                      title="Detail"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteStokOpname(stok.id_stok_opname)"
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
          <nav v-if="totalPages > 1" class="mt-3">
            <ul class="pagination pagination-sm justify-content-center mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
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
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Form Catat Stok -->
    <div v-if="showAddForm" class="card border-0 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-clipboard-plus me-2"></i>
            Catat Stok Opname
          </h5>
          <button class="btn btn-light btn-sm" @click="cancelAdd">
            <i class="bi bi-x-lg me-1"></i>
            Batal
          </button>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveStokOpname">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Nomor Transaksi</label>
              <input
                v-model="form.nomor_transaksi"
                type="text"
                class="form-control bg-light"
                placeholder="IN20231218001 (auto-generated)"
                readonly
              >
              <div class="form-text">Nomor transaksi digenerate otomatis</div>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Tanggal Transaksi *</label>
              <input
                v-model="form.tanggal_transaksi"
                type="date"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Jenis Transaksi *</label>
              <select v-model="form.jenis_transaksi" class="form-select" required>
                <option value="">Pilih Jenis</option>
                <option value="masuk">Stok Masuk</option>
                <option value="keluar">Stok Keluar</option>
                <option value="penyesuaian">Penyesuaian Stok</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Pelaksana</label>
              <v-select
                v-model="form.id_pegawai"
                :options="pegawaiList"
                :reduce="pegawai => pegawai.id_pegawai"
                label="nama_lengkap"
                placeholder="Pilih Pegawai"
                class="bg-white"
              >
                <template #no-options="{ search, searching }">
                  <template v-if="searching">
                    Tidak ada hasil untuk <em>{{ search }}</em>.
                  </template>
                  <em v-else style="opacity: 0.5">Ketik untuk mencari pegawai...</em>
                </template>
              </v-select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Bahan Baku *</label>
              <v-select
                v-model="form.id_bahan_baku"
                :options="bahanBakuList"
                :reduce="option => option.id_bahan_baku"
                label="nama_bahan_baku"
                placeholder="Pilih Bahan Baku"
                @option:selected="onBahanBakuChange"
                :clearable="false"
              >
                <template #option="{ nama_bahan_baku, stok, satuan }">
                  {{ nama_bahan_baku }} (Stok: {{ stok }} {{ satuan?.nama_satuan || '' }})
                </template>
              </v-select>
            </div>
            <div class="col-md-2 mb-3">
              <label class="form-label">Jumlah *</label>
              <input
                v-model="form.jumlah"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="0"
                required
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Supplier</label>
              <select v-model="form.id_supplier" class="form-select">
                <option value="">Pilih Supplier (Opsional)</option>
                <option
                  v-for="supplier in supplierList"
                  :key="supplier.id_supplier"
                  :value="supplier.id_supplier"
                >
                  {{ supplier.nama_supplier }}
                </option>
              </select>
            </div>
          </div>

          <div class="row" v-if="form.id_bahan_baku">
            <div class="col-md-4 mb-3">
              <label class="form-label">Stok Awal</label>
              <input
                :value="formatNumber(stokInfo.stok_awal)"
                type="text"
                class="form-control bg-light"
                readonly
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Stok Akhir (Estimasi)</label>
              <input
                :value="formatNumber(stokInfo.stok_akhir)"
                type="text"
                class="form-control bg-light"
                readonly
              >
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Harga Satuan</label>
              <input
                v-model="form.harga_satuan"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="0"
              >
            </div>
          </div>

          <div class="row">
            <div class="col-12 mb-3">
              <label class="form-label">Keterangan</label>
              <textarea
                v-model="form.keterangan"
                class="form-control"
                rows="3"
                placeholder="Tambahkan keterangan (opsional)"
              ></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="cancelAdd">
              <i class="bi bi-x-circle me-2"></i>
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <i class="bi bi-check-circle me-2"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail View -->
    <div v-if="selectedStok" class="card mb-4 border-info">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-eye me-2"></i>
          Detail Transaksi
        </h5>
        <button type="button" class="btn-close btn-close-white" @click="selectedStok = null"></button>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-sm-3 fw-semibold">Nomor Transaksi:</div>
          <div class="col-sm-9">
            <span class="badge bg-dark">{{ selectedStok.nomor_transaksi }}</span>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Tanggal:</div>
          <div class="col-sm-9">{{ formatDate(selectedStok.tanggal_transaksi) }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Jenis:</div>
          <div class="col-sm-9">
            <span :class="getJenisBadgeClass(selectedStok.jenis_transaksi)">
              {{ getJenisLabel(selectedStok.jenis_transaksi) }}
            </span>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Bahan Baku:</div>
          <div class="col-sm-9">{{ selectedStok.bahan_baku?.nama_bahan_baku }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Jumlah:</div>
          <div class="col-sm-9">{{ formatNumber(selectedStok.jumlah) }} {{ selectedStok.bahan_baku?.satuan?.nama_satuan || '' }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Stok Awal:</div>
          <div class="col-sm-9">{{ formatNumber(selectedStok.stok_awal) }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Stok Akhir:</div>
          <div class="col-sm-9">{{ formatNumber(selectedStok.stok_akhir) }}</div>
        </div>
        <hr v-if="selectedStok.supplier">
        <div class="row" v-if="selectedStok.supplier">
          <div class="col-sm-3 fw-semibold">Supplier:</div>
          <div class="col-sm-9">{{ selectedStok.supplier.nama_supplier }}</div>
        </div>
        <hr v-if="selectedStok.pegawai">
        <div class="row" v-if="selectedStok.pegawai">
          <div class="col-sm-3 fw-semibold">Pelaksana:</div>
          <div class="col-sm-9">{{ selectedStok.pegawai.nama_lengkap }}</div>
        </div>
        <hr v-if="selectedStok.keterangan">
        <div class="row" v-if="selectedStok.keterangan">
          <div class="col-sm-3 fw-semibold">Keterangan:</div>
          <div class="col-sm-9">{{ selectedStok.keterangan }}</div>
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

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const showAddForm = ref(false)
const stokOpnameList = ref([])
const bahanBakuList = ref([])
const supplierList = ref([])
const pegawaiList = ref([])
const searchQuery = ref('')
const jenisFilter = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedStok = ref(null)

// Form
const form = ref({
  nomor_transaksi: '',
  tanggal_transaksi: new Date().toISOString().split('T')[0],
  jenis_transaksi: '',
  id_bahan_baku: '',
  id_supplier: '',
  id_pegawai: '',
  jumlah: '',
  harga_satuan: '',
  keterangan: ''
})

// Stock info
const stokInfo = ref({
  stok_awal: 0,
  stok_akhir: 0
})


// Computed
const filteredStokOpname = computed(() => {
  let filtered = stokOpnameList.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(stok =>
      stok.nomor_transaksi.toLowerCase().includes(query) ||
      (stok.bahan_baku?.nama_bahan_baku || '').toLowerCase().includes(query)
    )
  }

  if (jenisFilter.value) {
    filtered = filtered.filter(stok => stok.jenis_transaksi === jenisFilter.value)
  }

  if (dateFilter.value) {
    filtered = filtered.filter(stok => stok.tanggal_transaksi === dateFilter.value)
  }

  // Use stok_akhir from database directly
  return filtered.map(stok => {
    const stockAkhir = parseFloat(stok.stok_akhir) || 0
    console.log('Debug - Transaction:', stok.id_stok_opname, stok.jenis_transaksi, 'stok_awal:', stok.stok_awal, 'stok_akhir:', stok.stok_akhir, 'parsed_stock_akhir:', stockAkhir)
    return {
      ...stok,
      current_stock: stockAkhir
    }
  })
})

const paginatedStokOpname = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStokOpname.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStokOpname.value.length / itemsPerPage)
})

// Methods
const fetchStokOpname = async () => {
  try {
    loading.value = true
    const response = await stokOpnameService.getAll()
    stokOpnameList.value = response.data || []
  } catch (error) {
    console.error('Error fetching stok opname:', error)
    toast.error('Gagal memuat data stok opname')
  } finally {
    loading.value = false
  }
}

const fetchBahanBaku = async () => {
  try {
    console.log('Fetching bahan baku with current stock...')
    const response = await stokOpnameService.getBahanBakuStock()
    console.log('Bahan baku response:', response.data)
    bahanBakuList.value = response.data || []
    console.log('Updated bahan baku list:', bahanBakuList.value)
  } catch (error) {
    console.error('Error fetching bahan baku:', error)
  }
}

const fetchSuppliers = async () => {
  try {
    const response = await stokOpnameService.getSuppliers()
    supplierList.value = response.data || []
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const fetchPegawai = async () => {
  try {
    const response = await stokOpnameService.getPegawai()
    pegawaiList.value = response.data || []
  } catch (error) {
    console.error('Error fetching pegawai:', error)
  }
}

const saveStokOpname = async () => {
  try {
    saving.value = true

    console.log('Sending form data:', form.value)
    const response = await stokOpnameService.create(form.value)
    console.log('Backend response:', response)

    toast.success('Stok opname berhasil dicatat')

    await Promise.all([
      fetchStokOpname(),
      fetchBahanBaku() // Refresh bahan baku list to get updated stock
    ])
    cancelAdd()
  } catch (error) {
    console.error('Error saving stok opname:', error)
    console.error('Error response:', error.response?.data)
    const message = error.response?.data?.message || 'Gagal mencatat stok opname'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteStokOpname = async (id) => {
  const stok = stokOpnameList.value.find(s => s.id_stok_opname === id)
  if (!stok) return

  if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${stok.nomor_transaksi}"?`)) {
    try {
      await stokOpnameService.delete(id)
      toast.success('Transaksi berhasil dihapus')
      await Promise.all([
        fetchStokOpname(),
        fetchBahanBaku() // Refresh bahan baku list to get updated stock
      ])
    } catch (error) {
      console.error('Error deleting stok opname:', error)
      const message = error.response?.data?.message || 'Gagal menghapus transaksi'
      toast.error(message)
    }
  }
}

const cancelAdd = () => {
  showAddForm.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    nomor_transaksi: '',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    jenis_transaksi: '',
    id_bahan_baku: '',
    id_supplier: '',
    id_pegawai: '',
    jumlah: '',
    harga_satuan: '',
    keterangan: ''
  }
  stokInfo.value = {
    stok_awal: 0,
    stok_akhir: 0
  }
}

const generateNomorTransaksi = () => {
  const date = new Date(form.value.tanggal_transaksi)
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')

  let prefix = ''
  switch (form.value.jenis_transaksi) {
    case 'masuk':
      prefix = 'IN'
      break
    case 'keluar':
      prefix = 'OUT'
      break
    case 'penyesuaian':
      prefix = 'ADJ'
      break
  }

  // Hitung jumlah transaksi hari ini dengan jenis yang sama
  const todayCount = stokOpnameList.value.filter(stok => {
    return stok.tanggal_transaksi === form.value.tanggal_transaksi &&
           stok.jenis_transaksi === form.value.jenis_transaksi
  }).length

  const sequence = String(todayCount + 1).padStart(3, '0')
  form.value.nomor_transaksi = `${prefix}${dateStr}${sequence}`
}

const onBahanBakuChange = () => {
  if (!form.value.id_bahan_baku) {
    stokInfo.value = { stok_awal: 0, stok_akhir: 0 }
    return
  }

  const bahan = bahanBakuList.value.find(b => b.id_bahan_baku === form.value.id_bahan_baku)
  if (!bahan) {
    console.log('Bahan not found for ID:', form.value.id_bahan_baku)
    console.log('Available bahan:', bahanBakuList.value)
    return
  }

  const stokAwal = parseFloat(bahan.stok) || 0
  const jumlah = parseFloat(form.value.jumlah) || 0

  console.log('Bahan selected:', bahan.nama_bahan_baku)
  console.log('Bahan object:', bahan)
  console.log('Raw stok value:', bahan.stok)
  console.log('Parsed stokAwal:', stokAwal)

  let stokAkhir = stokAwal
  switch (form.value.jenis_transaksi) {
    case 'masuk':
      stokAkhir = stokAwal + jumlah
      break
    case 'keluar':
      stokAkhir = stokAwal - jumlah
      break
    case 'penyesuaian':
      stokAkhir = jumlah
      break
  }

  console.log('Transaction type:', form.value.jenis_transaksi, 'Amount:', jumlah, 'Final stock:', stokAkhir)

  stokInfo.value = { stok_awal: stokAwal, stok_akhir: stokAkhir }
  console.log('Updated stokInfo:', stokInfo.value)
}

const viewDetail = (stok) => {
  selectedStok.value = stok
  showAddForm.value = false
}

// Utility functions
const getJenisLabel = (jenis) => {
  const labels = {
    'masuk': 'Stok Masuk',
    'keluar': 'Stok Keluar',
    'penyesuaian': 'Penyesuaian'
  }
  return labels[jenis] || jenis
}

const getJenisBadgeClass = (jenis) => {
  const classes = {
    'masuk': 'badge bg-success',
    'keluar': 'badge bg-danger',
    'penyesuaian': 'badge bg-warning'
  }
  return classes[jenis] || 'badge bg-secondary'
}

const getStokColor = (stokAwal, stokAkhir) => {
  if (stokAkhir > stokAwal) return 'text-success'
  if (stokAkhir < stokAwal) return 'text-danger'
  return 'text-dark'
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

// Watch form changes
watch(() => form.value.tanggal_transaksi, () => {
  generateNomorTransaksi()
})

watch(() => form.value.jenis_transaksi, () => {
  generateNomorTransaksi()
  onBahanBakuChange()
})

watch(() => form.value.id_bahan_baku, () => {
  onBahanBakuChange()
})

watch(() => form.value.jumlah, () => {
  onBahanBakuChange()
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStokOpname(),
    fetchBahanBaku(),
    fetchSuppliers(),
    fetchPegawai()
  ])
})
</script>

<style scoped>
.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.1);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
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