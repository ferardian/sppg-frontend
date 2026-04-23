<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-people-fill text-primary me-2"></i>
          Manajemen User
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data pengguna sistem</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        @click="showAddUserForm"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah User
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm border-0" ref="userFormCard">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-person-plus-fill me-2"></i>
          {{ isEdit ? 'Edit Data User' : 'Tambah Data User' }}
        </h5>
        <button 
          type="button" 
          class="btn btn-outline-secondary btn-sm rounded-circle" 
          @click="cancelForm"
          title="Tutup Form"
          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveUser">
          <!-- Step 1: Pilih Pegawai -->
          <div class="row mb-4">
            <div class="col-12">
              <label class="form-label fw-bold text-dark mb-3">1. Pilih Pegawai <span class="text-danger">*</span></label>
              <select
                class="form-select form-select-lg border-0 bg-light"
                v-model="formData.id_pegawai"
                :class="{ 'is-invalid': errors.id_pegawai }"
                @change="onPegawaiChange"
                required
              >
                <option value="">-- Pilih Pegawai --</option>
                <option
                  v-for="pegawai in pegawaiList"
                  :key="pegawai.id_pegawai"
                  :value="pegawai.id_pegawai"
                >
                  {{ pegawai.nama_lengkap }} - {{ pegawai.nip }} ({{ pegawai.jabatan }})
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.id_pegawai">
                {{ errors.id_pegawai[0] }}
              </div>
            </div>
          </div>

          <!-- Step 2: Informasi User -->
          <div class="row mb-4" v-if="formData.id_pegawai">
            <div class="col-12">
              <h6 class="text-primary fw-bold mb-3">
                <i class="bi bi-person-check me-2"></i>
                2. Informasi User
              </h6>
              <div class="row p-3 bg-light rounded-4 mx-0">
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted text-uppercase fw-bold">Nama User</label>
                  <input
                    type="text"
                    class="form-control border-0 bg-white shadow-sm"
                    v-model="formData.name"
                    readonly
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted text-uppercase fw-bold">Email</label>
                  <input
                    type="email"
                    class="form-control border-0 bg-white shadow-sm"
                    v-model="formData.email"
                    readonly
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Keamanan dan Role -->
          <div class="row" v-if="formData.id_pegawai">
            <div class="col-12">
              <h6 class="text-primary fw-bold mb-3">
                <i class="bi bi-shield-lock me-2"></i>
                3. Keamanan dan Role
              </h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Password <span class="text-danger">*</span></label>
                  <div class="input-group shadow-sm rounded-3 overflow-hidden">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-0"
                      v-model="formData.password"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Minimal 8 karakter"
                      :required="!isEdit"
                    >
                    <button
                      type="button"
                      class="btn btn-white border-0"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash text-muted' : 'bi bi-eye text-muted'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback d-block" v-if="errors.password">
                    {{ errors.password[0] }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Konfirmasi Password <span class="text-danger">*</span></label>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control border-0 shadow-sm"
                    v-model="formData.password_confirmation"
                    placeholder="Ulangi password"
                    :required="!isEdit"
                  >
                </div>
              </div>

              <div class="row align-items-center mt-2">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Role Akses</label>
                  <select
                    class="form-select border-0 shadow-sm"
                    v-model="formData.role"
                    :class="{ 'is-invalid': errors.role }"
                    required
                  >
                    <option value="">-- Pilih Role --</option>
                    <option
                      v-for="role in roleOptions"
                      :key="role.value"
                      :value="role.value"
                    >
                      {{ role.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check form-switch ms-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="formData.is_active"
                      id="isActive"
                    >
                    <label class="form-check-label fw-bold text-dark" for="isActive">
                      User Aktif
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" @click="cancelForm" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-primary px-4" :disabled="loading">
              <i v-if="loading" class="bi bi-arrow-repeat me-2 spin"></i>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ loading ? 'Menyimpan...' : (isEdit ? 'Update User' : 'Simpan User') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Search and Filter -->
    <div v-if="!showAddForm" class="card mb-4 shadow-sm border-0">
      <div class="card-body p-3">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Cari nama atau email..."
                v-model="searchQuery"
                @input="filterUsers"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select
              class="form-select border-0 bg-light"
              v-model="filterRole"
              @change="filterUsers"
            >
              <option value="">Semua Role</option>
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select
              class="form-select border-0 bg-light"
              v-model="filterStatus"
              @change="filterUsers"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Tidak Aktif</option>
            </select>
          </div>
          <div class="col-md-2 text-end">
             <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                {{ filteredUsers.length }} User
             </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div v-if="!showAddForm" class="card border-0 shadow-sm overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0 px-4">User</th>
                <th class="border-0">Pegawai</th>
                <th class="border-0">Role</th>
                <th class="border-0">Status</th>
                <th class="border-0">Dibuat</th>
                <th class="border-0 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="mb-3">
                    <i class="bi bi-people text-muted" style="font-size: 3rem; opacity: 0.3;"></i>
                  </div>
                  <p class="text-muted">Tidak ada data user ditemukan</p>
                </td>
              </tr>
              <tr v-for="(user, index) in paginatedUsers" :key="user.id" class="align-middle">
                <td class="px-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3 bg-primary bg-opacity-10 text-primary">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ user.name }}</div>
                      <div class="small text-muted">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="user.pegawai" class="badge bg-info bg-opacity-10 text-info px-3">
                    {{ user.pegawai.nama_lengkap }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <span :class="getRoleBadgeClass(user.role)" class="badge rounded-pill px-3">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="user.is_active"
                      @change="toggleUserStatus(user)"
                    >
                    <span class="small" :class="user.is_active ? 'text-success fw-bold' : 'text-muted'">
                      {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="small text-muted">{{ formatDate(user.created_at) }}</div>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-circle" @click="editUser(user)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info border-0 rounded-circle" @click="showDetailUser(user)" title="Detail">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" @click="deleteUserConfirm(user)" title="Hapus">
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
        Menampilkan {{ paginatedUsers.length }} dari {{ filteredUsers.length }} data
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modals for Detail & Delete are now cleaner inline sections or could be actual modals -->
    <div v-if="selectedUser && !showAddForm" class="card mt-4 shadow-sm border-0 bg-info bg-opacity-10">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="fw-bold text-info"><i class="bi bi-info-circle me-2"></i>Detail User: {{ selectedUser.name }}</h5>
                <button type="button" class="btn-close" @click="selectedUser = null"></button>
            </div>
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="small text-muted text-uppercase fw-bold">Email</div>
                    <div>{{ selectedUser.email }}</div>
                </div>
                <div class="col-md-4">
                    <div class="small text-muted text-uppercase fw-bold">Role</div>
                    <span :class="getRoleBadgeClass(selectedUser.role)" class="badge">{{ getRoleLabel(selectedUser.role) }}</span>
                </div>
                <div class="col-md-4">
                    <div class="small text-muted text-uppercase fw-bold">Pegawai Terkait</div>
                    <div>{{ selectedUser.pegawai?.nama_lengkap || '-' }}</div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import userService from '@/services/userService'
import Swal from 'sweetalert2'

export default {
  name: 'UserManagementView',
  setup() {
    const toast = useToast()

    // Reactive data
    const users = ref([])
    const pegawaiList = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterRole = ref('')
    const filterStatus = ref('')
    const currentPage = ref(1)
    const perPage = ref(10)
    const isEdit = ref(false)
    const showPassword = ref(false)
    const showAddForm = ref(false)
    const errors = ref({})
    
    // Refs for UI
    const userFormCard = ref(null)

    // Form data
    const formData = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      id_pegawai: '',
      role: '',
      is_active: true
    })

    // Computed properties
    const roleOptions = computed(() => userService.getRoles())

    const filteredUsers = computed(() => {
      let result = users.value
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }
      if (filterRole.value) {
        result = result.filter(user => user.role === filterRole.value)
      }
      if (filterStatus.value !== '') {
        result = result.filter(user => user.is_active == filterStatus.value)
      }
      return result
    })

    const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage.value))
    const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
    const paginatedUsers = computed(() => filteredUsers.value.slice(startIndex.value, startIndex.value + perPage.value))

    const selectedUser = ref(null)
    const userToDelete = ref(null)

    // Methods
    const loadUsers = async () => {
      try {
        loading.value = true
        const response = await userService.getAllUsers()
        users.value = response.data || []
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Gagal memuat data user')
      } finally {
        loading.value = false
      }
    }

    const loadPegawaiList = async () => {
      try {
        const response = await userService.getPegawaiList()
        pegawaiList.value = response.data || []
      } catch (error) {
        console.error('Error loading pegawai list:', error)
      }
    }

    const onPegawaiChange = () => {
      if (formData.value.id_pegawai) {
        const selectedPegawai = pegawaiList.value.find(p => p.id_pegawai === formData.value.id_pegawai)
        if (selectedPegawai) {
          formData.value.name = selectedPegawai.nama_lengkap
          if (selectedPegawai.email && selectedPegawai.email.trim()) {
            formData.value.email = selectedPegawai.email
          } else {
            const normalizedName = selectedPegawai.nama_lengkap
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '.')
            formData.value.email = `${normalizedName}@sppg.local`
          }
        }
      } else {
        formData.value.name = ''
        formData.value.email = ''
      }
    }

    const resetForm = () => {
      formData.value = {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        id_pegawai: '',
        role: '',
        is_active: true
      }
      errors.value = {}
      isEdit.value = false
      showPassword.value = false
    }

    const cancelForm = () => {
      resetForm()
      showAddForm.value = false
      selectedUser.value = null
    }

    const showAddUserForm = async () => {
      resetForm()
      await loadPegawaiList()
      showAddForm.value = true
    }

    const editUser = async (user) => {
      resetForm()
      isEdit.value = true
      await loadPegawaiList()
      formData.value = {
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        id_pegawai: user.id_pegawai || '',
        role: user.role,
        is_active: user.is_active
      }
      selectedUser.value = user
      showAddForm.value = true
      nextTick(() => {
        if (userFormCard.value) userFormCard.value.scrollIntoView({ behavior: 'smooth' })
      })
    }

    const showDetailUser = (user) => {
      selectedUser.value = user
      showAddForm.value = false
      nextTick(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      })
    }

    const deleteUserConfirm = async (user) => {
      const result = await Swal.fire({
        title: 'Hapus User?',
        text: `Apakah Anda yakin ingin menghapus user "${user.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        try {
          loading.value = true
          await userService.deleteUser(user.id)
          toast.success('User berhasil dihapus')
          await loadUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
          toast.error(error.response?.data?.message || 'Gagal menghapus user')
        } finally {
          loading.value = false
        }
      }
    }

    const saveUser = async () => {
      try {
        loading.value = true
        errors.value = {}
        if (isEdit.value) {
          await userService.updateUser(selectedUser.value?.id, formData.value)
          toast.success('User berhasil diperbarui')
        } else {
          await userService.createUser(formData.value)
          toast.success('User berhasil ditambahkan')
        }
        resetForm()
        showAddForm.value = false
        await loadUsers()
      } catch (error) {
        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors
          toast.error('Periksa kembali inputan Anda')
        } else {
          toast.error(error.response?.data?.message || 'Gagal menyimpan user')
        }
      } finally {
        loading.value = false
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        await userService.updateUser(user.id, { ...user, is_active: !user.is_active })
        user.is_active = !user.is_active
        toast.success(`User berhasil ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
      } catch (error) {
        toast.error('Gagal mengubah status user')
      }
    }

    const filterUsers = () => { currentPage.value = 1 }
    const changePage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page }
    const getRoleLabel = (role) => {
      const roleOption = roleOptions.value.find(r => r.value === role)
      return roleOption ? roleOption.label : role
    }

    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-danger bg-opacity-10 text-danger',
        user: 'bg-primary bg-opacity-10 text-primary',
        operator: 'bg-warning bg-opacity-10 text-warning',
        viewer: 'bg-secondary bg-opacity-10 text-secondary'
      }
      return classes[role] || 'bg-secondary bg-opacity-10 text-secondary'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    onMounted(loadUsers)

    return {
      users, pegawaiList, loading, searchQuery, filterRole, filterStatus, currentPage, perPage,
      isEdit, showPassword, errors, formData, filteredUsers, totalPages, startIndex, paginatedUsers,
      showAddForm, selectedUser, userToDelete, roleOptions, userFormCard,
      loadUsers, loadPegawaiList, resetForm, cancelForm, showAddUserForm, editUser, showDetailUser,
      deleteUserConfirm, saveUser, toggleUserStatus, filterUsers, changePage, getRoleLabel,
      getRoleBadgeClass, formatDate, onPegawaiChange
    }
  }
}
</script>

<style scoped>
.spin { animation: fa-spin 2s infinite linear; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } }

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.card { border-radius: 1rem; }
</style>