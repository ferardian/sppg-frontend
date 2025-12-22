<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
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
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddUserForm"
      >
        <i class="bi bi-plus-circle me-1"></i>
        Tambah User
      </button>
    </div>
            <!-- Add/Edit Form (shown when adding/editing) -->
            <div v-if="showAddForm" class="card mb-4 border-primary">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                  <i class="bi bi-person-plus-fill me-2"></i>
                  {{ isEdit ? 'Edit User' : 'Tambah User' }}
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="saveUser">
                  <!-- Step 1: Pilih Pegawai -->
                  <div class="row mb-4">
                    <div class="col-12">
                      <label class="form-label fw-bold">1. Pilih Pegawai <span class="text-danger">*</span></label>
                      <select
                        class="form-select form-select-lg"
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
                      <div class="form-text">Pegawai yang akan dibuatkan akun user</div>
                      <div class="invalid-feedback" v-if="errors.id_pegawai">
                        {{ errors.id_pegawai[0] }}
                      </div>
                    </div>
                  </div>

                  <!-- Step 2: Informasi User (otomatis terisi) -->
                  <div class="row mb-4" v-if="formData.id_pegawai">
                    <div class="col-12">
                      <h6 class="text-primary mb-3">
                        <i class="bi bi-person-check me-2"></i>
                        2. Informasi User (Otomatis terisi)
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Nama User <span class="text-danger">*</span></label>
                            <input
                              type="text"
                              class="form-control"
                              v-model="formData.name"
                              :class="{ 'is-invalid': errors.name }"
                              readonly
                            >
                            <div class="form-text">Diambil dari data pegawai</div>
                            <div class="invalid-feedback" v-if="errors.name">
                              {{ errors.name[0] }}
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Email <span class="text-danger">*</span></label>
                            <input
                              type="email"
                              class="form-control"
                              v-model="formData.email"
                              :class="{ 'is-invalid': errors.email }"
                              readonly
                            >
                            <div class="form-text">Diambil dari data pegawai (atau digenerate otomatis jika kosong)</div>
                            <div class="invalid-feedback" v-if="errors.email">
                              {{ errors.email[0] }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 3: Keamanan dan Role -->
                  <div class="row" v-if="formData.id_pegawai">
                    <div class="col-12">
                      <h6 class="text-primary mb-3">
                        <i class="bi bi-shield-lock me-2"></i>
                        3. Keamanan dan Role
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                              <input
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="formData.password"
                                :class="{ 'is-invalid': errors.password }"
                                placeholder="Minimal 8 karakter"
                                required
                              >
                              <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="showPassword = !showPassword"
                              >
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                              </button>
                            </div>
                            <div class="invalid-feedback" v-if="errors.password">
                              {{ errors.password[0] }}
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Konfirmasi Password <span class="text-danger">*</span></label>
                            <input
                              :type="showPassword ? 'text' : 'password'"
                              class="form-control"
                              v-model="formData.password_confirmation"
                              :class="{ 'is-invalid': errors.password }"
                              placeholder="Ulangi password"
                              required
                            >
                            <div class="invalid-feedback" v-if="errors.password_confirmation">
                              {{ errors.password_confirmation[0] }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="row">
                        <div class="col-md-6">
                          <div class="mb-3">
                            <label class="form-label">Role <span class="text-danger">*</span></label>
                            <select
                              class="form-select"
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
                            <div class="invalid-feedback" v-if="errors.role">
                              {{ errors.role[0] }}
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="mb-3">
                            <div class="form-check mt-4">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                v-model="formData.is_active"
                                id="isActive"
                              >
                              <label class="form-check-label" for="isActive">
                                User Aktif
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

  
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi bi-check-circle me-1"></i>
                      {{ isEdit ? 'Update' : 'Simpan' }}
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelForm">
                      <i class="bi bi-x-circle me-1"></i>
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Search and Filter -->
            <div v-if="!showAddForm" class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari berdasarkan nama atau email..."
                    v-model="searchQuery"
                    @input="filterUsers"
                  >
                </div>
              </div>
              <div class="col-md-3">
                <select
                  class="form-select"
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
                  class="form-select"
                  v-model="filterStatus"
                  @change="filterUsers"
                >
                  <option value="">Semua Status</option>
                  <option value="1">Aktif</option>
                  <option value="0">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <!-- Users Table -->
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Pegawai</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredUsers.length === 0">
                    <td colspan="8" class="text-center py-4">
                      <i class="bi bi-inbox fs-1 text-muted"></i>
                      <p class="text-muted mt-2">Tidak ada data user</p>
                    </td>
                  </tr>
                  <tr v-for="(user, index) in paginatedUsers" :key="user.id">
                    <td>{{ startIndex + index + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                          <i class="bi bi-person-fill text-primary"></i>
                        </div>
                        <span class="fw-semibold">{{ user.name }}</span>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span v-if="user.pegawai" class="badge bg-info">
                        {{ user.pegawai.nama_lengkap }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span
                        :class="getRoleBadgeClass(user.role)"
                        class="badge"
                      >
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
                        <label class="form-check-label">
                          {{ user.is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </label>
                      </div>
                    </td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-sm btn-outline-primary"
                          @click="editUser(user)"
                          title="Edit"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-info"
                          @click="showDetailUser(user)"
                          title="Detail"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="deleteUserConfirm(user)"
                          title="Hapus"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav aria-label="User pagination" v-if="totalPages > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(page)">
                    {{ page }}
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

    <!-- Simple Detail Alert (shown when user detail is selected) -->
    <div v-if="selectedUser" class="card mb-4 border-info">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-person-badge me-2"></i>
          Detail User
        </h5>
        <button type="button" class="btn-close btn-close-white" @click="selectedUser = null"></button>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-sm-3 fw-semibold">Nama:</div>
          <div class="col-sm-9">{{ selectedUser.name }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Email:</div>
          <div class="col-sm-9">{{ selectedUser.email }}</div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Role:</div>
          <div class="col-sm-9">
            <span :class="getRoleBadgeClass(selectedUser.role)" class="badge">
              {{ getRoleLabel(selectedUser.role) }}
            </span>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Pegawai:</div>
          <div class="col-sm-9">
            <span v-if="selectedUser.pegawai" class="badge bg-info">
              {{ selectedUser.pegawai.nama_lengkap }}
            </span>
            <span v-else class="text-muted">-</span>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Status:</div>
          <div class="col-sm-9">
            <span :class="selectedUser.is_active ? 'bg-success' : 'bg-danger'" class="badge">
              {{ selectedUser.is_active ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-sm-3 fw-semibold">Dibuat:</div>
          <div class="col-sm-9">{{ formatDate(selectedUser.created_at) }}</div>
        </div>
        <div class="row" v-if="selectedUser.updated_at">
          <div class="col-sm-3 fw-semibold">Diupdate:</div>
          <div class="col-sm-9">{{ formatDate(selectedUser.updated_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Alert -->
    <div v-if="userToDelete" class="card mb-4 border-danger">
      <div class="card-header bg-danger text-white">
        <h5 class="mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Konfirmasi Hapus
        </h5>
      </div>
      <div class="card-body">
        <p>Apakah Anda yakin ingin menghapus user <strong>{{ userToDelete.name }}</strong>?</p>
        <p class="text-danger">
          <i class="bi bi-exclamation-circle me-1"></i>
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="d-flex gap-2">
          <button
            class="btn btn-danger"
            @click="deleteUser"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-trash me-1"></i>
            Hapus
          </button>
          <button
            class="btn btn-secondary"
            @click="userToDelete = null"
            :disabled="loading"
          >
            <i class="bi bi-x-circle me-1"></i>
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import userService from '@/services/userService'

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

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      // Filter by role
      if (filterRole.value) {
        result = result.filter(user => user.role === filterRole.value)
      }

      // Filter by status
      if (filterStatus.value !== '') {
        result = result.filter(user => user.is_active == filterStatus.value)
      }

      return result
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / perPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * perPage.value
    })

    const paginatedUsers = computed(() => {
      return filteredUsers.value.slice(startIndex.value, startIndex.value + perPage.value)
    })

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
          // Gunakan email dari database pegawai, jika kosong generate otomatis
          if (selectedPegawai.email && selectedPegawai.email.trim()) {
            formData.value.email = selectedPegawai.email
          } else {
            // Generate email otomatis dari nama pegawai
            const normalizedName = selectedPegawai.nama_lengkap
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter khusus
              .replace(/\s+/g, '.') // Ganti spasi dengan titik
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

      // Populate form with user data
      formData.value = {
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        id_pegawai: user.id_pegawai || '',
        role: user.role,
        is_active: user.is_active
      }

      // Set selected user for edit mode
      selectedUser.value = user
      showAddForm.value = true
    }

    const showDetailUser = (user) => {
      selectedUser.value = user
      showAddForm.value = false
    }

    const deleteUserConfirm = (user) => {
      userToDelete.value = user
      showAddForm.value = false
      selectedUser.value = null
    }

    const saveUser = async () => {
      try {
        loading.value = true
        errors.value = {}

        if (isEdit.value) {
          await userService.updateUser(selectedUser.value?.id || formData.value.id, formData.value)
          toast.success('User berhasil diperbarui')
        } else {
          await userService.createUser(formData.value)
          toast.success('User berhasil ditambahkan')
        }

        resetForm()
        showAddForm.value = false
        await loadUsers()
      } catch (error) {
        console.error('Error saving user:', error)

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

    const deleteUser = async () => {
      try {
        loading.value = true
        await userService.deleteUser(userToDelete.value.id)
        toast.success('User berhasil dihapus')
        userToDelete.value = null
        await loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error(error.response?.data?.message || 'Gagal menghapus user')
      } finally {
        loading.value = false
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        await userService.updateUser(user.id, {
          ...user,
          is_active: !user.is_active
        })
        user.is_active = !user.is_active
        toast.success(`User berhasil ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
      } catch (error) {
        console.error('Error toggling user status:', error)
        toast.error('Gagal mengubah status user')
      }
    }

    const filterUsers = () => {
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const getRoleLabel = (role) => {
      const roleOption = roleOptions.value.find(r => r.value === role)
      return roleOption ? roleOption.label : role
    }

    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-danger',
        user: 'bg-primary',
        operator: 'bg-warning',
        viewer: 'bg-secondary'
      }
      return classes[role] || 'bg-secondary'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(async () => {
      await loadUsers()
    })

    return {
      // Data
      users,
      pegawaiList,
      loading,
      searchQuery,
      filterRole,
      filterStatus,
      currentPage,
      perPage,
      isEdit,
      showPassword,
      errors,
      formData,
      filteredUsers,
      totalPages,
      startIndex,
      paginatedUsers,
      showAddForm,
      selectedUser,
      userToDelete,
      roleOptions,

      // Methods
      loadUsers,
      loadPegawaiList,
      resetForm,
      cancelForm,
      showAddUserForm,
      editUser,
      showDetailUser,
      deleteUserConfirm,
      saveUser,
      deleteUser,
      toggleUserStatus,
      filterUsers,
      changePage,
      getRoleLabel,
      getRoleBadgeClass,
      formatDate,
      onPegawaiChange
    }
  }
}
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
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.modal-header {
  border-bottom: 2px solid #dee2e6;
}

.modal-footer {
  border-top: 2px solid #dee2e6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.card-header {
  font-weight: 600;
}

.text-danger {
  color: #dc3545 !important;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.pagination {
  margin-top: 1rem;
}

/* Fix modal z-index and backdrop issues */
:deep(.modal) {
  z-index: 1060;
}

:deep(.modal-backdrop) {
  z-index: 1055;
}

:deep(.modal-dialog) {
  z-index: 1060;
}

/* Ensure modals appear above the sidebar */
:deep(.modal.show) {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

:deep(.modal-backdrop.show) {
  opacity: 0.5;
}

/* Fix body scroll when modal is open */
:global(body.modal-open) {
  overflow: hidden;
  padding-right: 0 !important;
}

/* Remove any conflicting positioning */
:deep(.modal-content) {
  position: relative;
  z-index: 1060;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  background-color: transparent !important; /* Ensure bg color doesn't override gradient */
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>