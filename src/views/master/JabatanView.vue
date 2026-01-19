<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-briefcase text-primary me-2"></i>
          Master Jabatan
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data jabatan pegawai</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddForm = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Jabatan
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data jabatan...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchJabatanData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Form tambah/edit jabatan -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Jabatan' : 'Tambah Jabatan' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveJabatan">
          <div class="mb-3">
            <label class="form-label">Nama Jabatan</label>
            <input
              v-model="form.nama_jabatan"
              type="text"
              class="form-control"
              placeholder="Masukkan nama jabatan"
              required
            >
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="cancelAdd" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <i v-if="loading" class="bi bi-arrow-repeat me-2 spin"></i>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabel data jabatan -->
    <div v-if="jabatanData.length > 0" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-briefcase me-2"></i>
            Data Jabatan
          </h5>
          <span class="badge bg-white text-primary">
            {{ jabatanData.length }} Jabatan
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0" style="width: 80px;">
                  <i class="bi bi-hash me-1"></i>No
                </th>
                <th class="border-0">
                  <i class="bi bi-briefcase me-1"></i>Nama Jabatan
                </th>
                <th class="border-0 text-center" style="width: 120px;">
                  <i class="bi bi-people me-1"></i>Jumlah Pegawai
                </th>
                <th class="border-0 text-center" style="width: 120px;">
                  <i class="bi bi-gear me-1"></i>Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(jabatan, index) in jabatanData" :key="jabatan.id" class="align-middle">
                <td>
                  <span class="fw-bold text-muted">{{ index + 1 }}</span>
                </td>
                <td>
                  <span class="badge bg-info px-3 py-2">
                    {{ jabatan.nama_jabatan }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-secondary">
                    {{ jabatan.pegawais_count || 0 }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editJabatan(jabatan)"
                      :title="'Edit ' + jabatan.nama_jabatan"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteJabatan(jabatan.id)"
                      :title="'Hapus ' + jabatan.nama_jabatan"
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

    <!-- Empty state -->
    <div v-if="!loading && jabatanData.length === 0 && !showAddForm" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-briefcase text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Jabatan</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan jabatan pertama</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Jabatan Pertama
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import jabatanService from '@/services/jabatanService'
import { useToast } from 'vue-toastification'

export default {
  name: 'JabatanView',
  setup() {
    const toast = useToast()
    const showAddForm = ref(false)
    const jabatanData = ref([])
    const loading = ref(false)
    const error = ref('')

    const form = ref({
      nama_jabatan: ''
    })

    const editingId = ref(null)

    const fetchJabatanData = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await jabatanService.getAll()
        jabatanData.value = response.data || []
      } catch (err) {
        error.value = 'Gagal memuat data jabatan: ' + (err.response?.data?.message || err.message)
        toast.error(error.value)
      } finally {
        loading.value = false
      }
    }

    const saveJabatan = async () => {
      try {
        loading.value = true

        if (editingId.value) {
          const response = await jabatanService.update(editingId.value, form.value)
          const index = jabatanData.value.findIndex(j => j.id === editingId.value)
          if (index !== -1) {
            jabatanData.value[index] = response.data || response
          }
          toast.success('Jabatan berhasil diperbarui')
        } else {
          const response = await jabatanService.create(form.value)
          jabatanData.value.push(response.data || response)
          toast.success('Jabatan berhasil ditambahkan')
        }

        resetForm()
        showAddForm.value = false
      } catch (err) {
        if (err.response?.data?.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat()
          toast.error('Validasi gagal: ' + errorMessages.join(', '))
        } else {
          toast.error('Gagal menyimpan data jabatan: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        loading.value = false
      }
    }

    const editJabatan = (jabatan) => {
      form.value = {
        nama_jabatan: jabatan.nama_jabatan || ''
      }
      editingId.value = jabatan.id
      showAddForm.value = true
    }

    const deleteJabatan = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
        try {
          loading.value = true
          await jabatanService.delete(id)
          jabatanData.value = jabatanData.value.filter(j => j.id !== id)
          toast.success('Jabatan berhasil dihapus')
        } catch (err) {
          toast.error('Gagal menghapus jabatan: ' + (err.response?.data?.message || err.message))
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
        nama_jabatan: ''
      }
    }

    onMounted(() => {
      fetchJabatanData()
    })

    return {
      showAddForm,
      jabatanData,
      form,
      loading,
      error,
      fetchJabatanData,
      saveJabatan,
      editJabatan,
      deleteJabatan,
      cancelAdd,
      resetForm,
      editingId
    }
  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
  border-color: #f1f3f5;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5em 0.75em;
  font-weight: 500;
}

.card {
  transition: all 0.3s ease;
  border: none;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
  transform: translateY(-2px);
}

.btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline-primary:hover {
  background-color: #667eea;
  border-color: #667eea;
  transform: scale(1.1);
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  transform: scale(1.1);
}

.form-control {
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-sm {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
