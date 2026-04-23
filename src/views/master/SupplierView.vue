<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-truck text-primary me-2"></i>
          Master Data Supplier
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data supplier bahan makanan</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        @click="showAddSupplierForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Supplier
      </button>
    </div>

    <!-- Search and Filter -->
    <div v-if="!showAddForm" class="card mb-4 shadow-sm border-0">
      <div class="card-body p-3">
        <div class="row align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Cari nama atau kode supplier..."
              >
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select border-0 bg-light">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="blacklist">Blacklist</option>
            </select>
          </div>
          <div class="col-md-4 text-end">
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
              Total: {{ filteredSuppliers.length }} Supplier
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Tambah/Edit -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm border-0" ref="supplierFormCard">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-truck me-2"></i>
          {{ editingId ? 'Edit Data Supplier' : 'Tambah Data Supplier' }}
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
        <form @submit.prevent="saveSupplier">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Kode Supplier</label>
              <input
                v-model="form.kode_supplier"
                type="text"
                class="form-control bg-light"
                placeholder="Otomatis"
                readonly
              >
              <small class="text-muted">Kode digenerate otomatis</small>
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">Nama Supplier</label>
              <input
                ref="namaSupplierInput"
                v-model="form.nama_supplier"
                type="text"
                class="form-control"
                placeholder="Masukkan nama supplier"
                required
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-8 mb-3">
              <label class="form-label">Alamat Lengkap</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="3"
                placeholder="Jl. Mawar No. 123..."
                required
              ></textarea>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select" required>
                <option value="">Pilih Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="blacklist">Blacklist</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Telepon Kantor</label>
              <input
                v-model="form.telepon"
                type="tel"
                class="form-control"
                placeholder="021-..."
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="info@supplier.com"
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Contact Person (CP)</label>
              <input
                v-model="form.nama_cp"
                type="text"
                class="form-control"
                placeholder="Budi Santoso"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Telepon CP</label>
              <input
                v-model="form.telepon_cp"
                type="tel"
                class="form-control"
                placeholder="0812-..."
              >
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" @click="cancelAdd" :disabled="saving">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <i v-if="saving" class="bi bi-arrow-repeat me-2 spin"></i>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data Table Card -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm overflow-hidden">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data supplier...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSuppliers.length === 0" class="text-center py-5">
          <div class="mb-4">
            <i class="bi bi-truck text-primary" style="font-size: 4rem; opacity: 0.5;"></i>
          </div>
          <h5 class="text-dark">Data Tidak Ditemukan</h5>
          <p class="text-muted">Tidak ada data supplier yang sesuai dengan kriteria</p>
        </div>

        <!-- Table Responsive -->
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0 px-4">Kode</th>
                <th class="border-0">Nama Supplier</th>
                <th class="border-0">Kontak</th>
                <th class="border-0">Contact Person</th>
                <th class="border-0">Status</th>
                <th class="border-0 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in paginatedSuppliers" :key="supplier.id_supplier" class="align-middle">
                <td class="px-4">
                  <span class="badge bg-primary bg-opacity-10 text-primary fw-bold">
                    {{ supplier.kode_supplier }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ supplier.nama_supplier }}</div>
                  <small class="text-muted d-block text-truncate" style="max-width: 250px;">{{ supplier.alamat }}</small>
                </td>
                <td>
                  <div class="small">
                    <div v-if="supplier.telepon"><i class="bi bi-telephone text-muted me-1"></i>{{ supplier.telepon }}</div>
                    <div v-if="supplier.email" class="text-primary"><i class="bi bi-envelope text-muted me-1"></i>{{ supplier.email }}</div>
                  </div>
                </td>
                <td>
                  <div v-if="supplier.nama_cp">
                    <div class="fw-semibold small text-dark">{{ supplier.nama_cp }}</div>
                    <div class="small text-muted">{{ supplier.telepon_cp || '-' }}</div>
                  </div>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <span class="badge rounded-pill px-3 py-1" :class="getStatusBadgeClass(supplier.status)">
                    {{ supplier.status_display }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary border-0 rounded-circle"
                      @click="editSupplier(supplier)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger border-0 rounded-circle"
                      @click="deleteSupplier(supplier.id_supplier)"
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

    <!-- Pagination -->
    <div v-if="!showAddForm && totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted small">
        Menampilkan {{ paginatedSuppliers.length }} dari {{ filteredSuppliers.length }} data
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="currentPage = page">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import supplierService from '@/services/supplierService'
import Swal from 'sweetalert2'

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const showAddForm = ref(false)
const editingId = ref(null)
const suppliers = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Refs for UI
const namaSupplierInput = ref(null)
const supplierFormCard = ref(null)

// Form
const form = ref({
  kode_supplier: '',
  nama_supplier: '',
  alamat: '',
  telepon: '',
  email: '',
  nama_cp: '',
  telepon_cp: '',
  status: 'aktif'
})

// Computed
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier =>
      supplier.nama_supplier.toLowerCase().includes(query) ||
      supplier.kode_supplier.toLowerCase().includes(query) ||
      supplier.alamat.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(supplier => supplier.status === statusFilter.value)
  }

  return filtered
})

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSuppliers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSuppliers.value.length / itemsPerPage)
})

// Methods
const fetchSuppliers = async () => {
  try {
    loading.value = true
    const response = await supplierService.getAll()
    suppliers.value = response.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    toast.error('Gagal memuat data supplier')
  } finally {
    loading.value = false
  }
}

const saveSupplier = async () => {
  try {
    saving.value = true

    if (editingId.value) {
      await supplierService.update(editingId.value, form.value)
      toast.success('Data supplier berhasil diperbarui')
    } else {
      await supplierService.create(form.value)
      toast.success('Supplier berhasil ditambahkan')
    }

    await fetchSuppliers()
    cancelAdd()
  } catch (error) {
    console.error('Error saving supplier:', error)
    if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0]
        toast.error(firstError)
    } else {
        toast.error(error.response?.data?.message || 'Gagal menyimpan data supplier')
    }
  } finally {
    saving.value = false
  }
}

const editSupplier = (supplier) => {
  editingId.value = supplier.id_supplier
  form.value = {
    kode_supplier: supplier.kode_supplier,
    nama_supplier: supplier.nama_supplier,
    alamat: supplier.alamat,
    telepon: supplier.telepon,
    email: supplier.email || '',
    nama_cp: supplier.nama_cp || '',
    telepon_cp: supplier.telepon_cp || '',
    status: supplier.status
  }
  showAddForm.value = true
  
  nextTick(() => {
    if (supplierFormCard.value) {
      supplierFormCard.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (namaSupplierInput.value) {
      namaSupplierInput.value.focus()
    }
  })
}

const deleteSupplier = async (id) => {
  const supplier = suppliers.value.find(s => s.id_supplier === id)
  if (!supplier) return

  const result = await Swal.fire({
    title: 'Hapus Supplier?',
    text: `Anda akan menghapus "${supplier.nama_supplier}". Tindakan ini tidak dapat dibatalkan!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await supplierService.delete(id)
      toast.success('Supplier berhasil dihapus')
      await fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error(error.response?.data?.message || 'Gagal menghapus supplier')
    }
  }
}

const showAddSupplierForm = () => {
  editingId.value = null
  form.value = {
    kode_supplier: '',
    nama_supplier: '',
    alamat: '',
    telepon: '',
    email: '',
    nama_cp: '',
    telepon_cp: '',
    status: 'aktif'
  }
  generateKodeSupplier()
  showAddForm.value = true
}

const generateKodeSupplier = () => {
  const maxNumber = suppliers.value.reduce((max, supplier) => {
    const currentNumber = parseInt(supplier.kode_supplier.replace('SUP', '')) || 0
    return Math.max(max, currentNumber)
  }, 0)

  const nextNumber = maxNumber + 1
  form.value.kode_supplier = `SUP${nextNumber.toString().padStart(4, '0')}`
}

const cancelAdd = () => {
  showAddForm.value = false
  editingId.value = null
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'aktif':
      return 'bg-success bg-opacity-10 text-success'
    case 'nonaktif':
      return 'bg-warning bg-opacity-10 text-warning'
    case 'blacklist':
      return 'bg-danger bg-opacity-10 text-danger'
    default:
      return 'bg-secondary bg-opacity-10 text-secondary'
  }
}

// Lifecycle
onMounted(() => {
  console.log('🔵 SupplierView component mounted successfully!')
  fetchSuppliers()
})
</script>

<style scoped>
.spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(359deg); }
}

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.card {
  border-radius: 1rem;
}
</style>