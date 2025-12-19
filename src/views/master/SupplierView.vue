<template>
  <div class="container-fluid">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">
          <i class="bi bi-truck text-primary me-2"></i>
          Master Data Supplier
        </h4>
        <p class="text-muted mb-0 small">Kelola data supplier bahan makanan</p>
      </div>
      <button
        class="btn btn-primary rounded-pill px-4"
        @click="showAddSupplierForm"
        v-if="!showAddForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Supplier
      </button>
    </div>

    <!-- Data Table -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm">
      <div class="card-body">
        <!-- Search and Filter -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0"
                placeholder="Cari nama supplier..."
              >
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="statusFilter" class="form-select">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="blacklist">Blacklist</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <small class="text-muted">
              Total: {{ filteredSuppliers.length }} supplier
            </small>
          </div>
        </div>

        <!-- Table -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data supplier...</p>
        </div>

        <div v-else-if="filteredSuppliers.length === 0" class="text-center py-5">
          <i class="bi bi-truck display-1 text-muted"></i>
          <h5 class="mt-3 text-muted">Belum ada data supplier</h5>
          <p class="text-muted">Tambah supplier pertama untuk memulai</p>
          <button class="btn btn-primary rounded-pill px-4" @click="showAddSupplierForm">
            <i class="bi bi-plus-circle me-2"></i>
            Tambah Supplier
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Kode</th>
                <th>Nama Supplier</th>
                <th>Informasi Kontak</th>
                <th>Contact Person</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in paginatedSuppliers" :key="supplier.id_supplier">
                <td class="align-middle">
                  <span class="badge bg-primary">{{ supplier.kode_supplier }}</span>
                </td>
                <td class="align-middle">
                  <div>
                    <strong>{{ supplier.nama_supplier }}</strong>
                    <div class="small text-muted">{{ supplier.alamat }}</div>
                  </div>
                </td>
                <td class="align-middle">
                  <div class="small">
                    <div v-if="supplier.telepon">
                      <i class="bi bi-telephone-fill text-muted me-1"></i>
                      {{ supplier.telepon }}
                    </div>
                    <div v-if="supplier.email">
                      <i class="bi bi-envelope-fill text-muted me-1"></i>
                      {{ supplier.email }}
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <div v-if="supplier.nama_cp" class="small">
                    <strong>{{ supplier.nama_cp }}</strong>
                    <div v-if="supplier.telepon_cp" class="text-muted">
                      <i class="bi bi-telephone me-1"></i>
                      {{ supplier.telepon_cp }}
                    </div>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="align-middle">
                  <span :class="getStatusBadgeClass(supplier.status)">
                    {{ supplier.status_display }}
                  </span>
                </td>
                <td class="align-middle">
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editSupplier(supplier)"
                      :title="'Edit ' + supplier.nama_supplier"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteSupplier(supplier.id_supplier)"
                      :title="'Hapus ' + supplier.nama_supplier"
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

    <!-- Form Tambah/Edit -->
    <div v-if="showAddForm" class="card border-0 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-plus-circle me-2"></i>
            {{ editingId ? 'Edit' : 'Tambah' }} Supplier
          </h5>
          <button class="btn btn-light btn-sm" @click="cancelAdd">
            <i class="bi bi-x-lg me-1"></i>
            Batal
          </button>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveSupplier">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label class="form-label">Kode Supplier *</label>
              <input
                v-model="form.kode_supplier"
                type="text"
                class="form-control bg-light"
                placeholder="SUP0001 (auto-generated)"
                readonly
              >
              <div class="form-text">Kode digenerate otomatis (SUP + 4 digit angka)</div>
            </div>
            <div class="col-md-9 mb-3">
              <label class="form-label">Nama Supplier *</label>
              <input
                v-model="form.nama_supplier"
                type="text"
                class="form-control"
                placeholder="PT. Food Supplier Indonesia"
                required
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Alamat Lengkap *</label>
              <textarea
                v-model="form.alamat"
                class="form-control"
                rows="3"
                placeholder="Jl. Mawar No. 123, Jakarta Pusat"
                required
              ></textarea>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Status *</label>
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
              <label class="form-label">Telepon *</label>
              <input
                v-model="form.telepon"
                type="tel"
                class="form-control"
                placeholder="021-12345678"
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
              <label class="form-label">Nama Contact Person</label>
              <input
                v-model="form.nama_cp"
                type="text"
                class="form-control"
                placeholder="Budi Santoso"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Telepon Contact Person</label>
              <input
                v-model="form.telepon_cp"
                type="tel"
                class="form-control"
                placeholder="0812-3456-7890"
              >
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="cancelAdd">
              <i class="bi bi-x-circle me-2"></i>
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <i class="bi bi-check-circle me-2"></i>
              {{ saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import supplierService from '@/services/supplierService'

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
    const message = error.response?.data?.message || 'Gagal menyimpan data supplier'
    toast.error(message)
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
}

const deleteSupplier = async (id) => {
  const supplier = suppliers.value.find(s => s.id_supplier === id)
  if (!supplier) return

  if (confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.nama_supplier}"?`)) {
    try {
      await supplierService.delete(id)
      toast.success('Supplier berhasil dihapus')
      await fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      const message = error.response?.data?.message || 'Gagal menghapus supplier'
      toast.error(message)
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
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'aktif':
      return 'badge bg-success'
    case 'nonaktif':
      return 'badge bg-warning'
    case 'blacklist':
      return 'badge bg-danger'
    default:
      return 'badge bg-secondary'
  }
}

// Lifecycle
onMounted(() => {
  console.log('🔵 SupplierView component mounted successfully!')
  fetchSuppliers()
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

.btn-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
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

.bg-gradient-success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}
</style>