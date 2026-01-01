<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-menu-button-wide text-primary me-2"></i>
          Data Menu
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data menu SPPG</p>
      </div>
      <button
        v-if="!showAddForm"
        class="btn btn-primary btn-lg rounded-pill px-4"
        @click="showAddForm = true"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Menu
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data menu...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchMenuData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasMenuData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-menu-button-wide text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Menu</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data menu pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Menu Pertama
        </button>
      </div>
    </div>

    <!-- Form tambah menu -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Data Menu' : 'Tambah Data Menu' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveMenu">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kode Menu</label>
              <input
                v-model="form.kode_menu"
                type="text"
                class="form-control"
                placeholder="Kode otomatis"
                :readonly="!editingId"
                required
              >
              <small class="text-muted">Kode otomatis dengan format M000001</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Menu</label>
              <input
                v-model="form.nama_menu"
                type="text"
                class="form-control"
                placeholder="Masukkan nama menu"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Kategori</label>
              <select class="form-select" v-model="form.kategori">
                 <option value="">-- Pilih Kategori --</option>
                 <option value="Basah">Basah</option>
                 <option value="Kering">Kering</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2 mb-2">
              <label class="form-label">Kalori/Porsi</label>
              <input
                v-model="form.kalori_per_porsi"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0"
              >
            </div>
            <div class="col-md-2 mb-2">
              <label class="form-label">Protein (g)</label>
              <input
                v-model="form.protein_gram"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0"
              >
            </div>
            <div class="col-md-2 mb-2">
              <label class="form-label">Karbohidrat (g)</label>
              <input
                v-model="form.karbohidrat_gram"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0"
              >
            </div>
            <div class="col-md-2 mb-2">
              <label class="form-label">Lemak (g)</label>
              <input
                v-model="form.lemak_gram"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0"
              >
            </div>
            <div class="col-md-2 mb-2">
              <label class="form-label">Serat (g)</label>
              <input
                v-model="form.serat_gram"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0"
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Deskripsi</label>
              <textarea
                v-model="form.deskripsi"
                class="form-control"
                rows="3"
                placeholder="Masukkan deskripsi menu"
              ></textarea>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Cara Pembuatan</label>
              <textarea
                v-model="form.cara_pembuatan"
                class="form-control"
                rows="4"
                placeholder="Masukkan cara pembuatan"
              ></textarea>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Status</label>
              <select
                v-model="form.status"
                class="form-select"
                required
              >
                <option value="">Pilih Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Foto Menu</label>
              <input
                v-model="form.foto_menu"
                type="text"
                class="form-control"
                placeholder="URL foto menu (opsional)"
              >
            </div>
          </div>

          <!-- Bahan Baku Section -->
          <div class="row">
            <div class="col-md-12 mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label mb-0">Bahan Baku</label>
                <button
                  type="button"
                  class="btn btn-primary rounded-pill px-4"
                  @click="addBahanBakuField"
                >
                  <i class="bi bi-plus-circle me-1"></i>
                  Tambah Bahan Baku
                </button>
              </div>

              <div class="bahan-baku-section">
                <div v-if="form.bahan_baku.length === 0" class="bahan-baku-empty">
                  <i class="bi bi-basket"></i>
                  <p>Belum ada bahan baku ditambahkan</p>
                  <small>Klik tombol "Tambah Bahan Baku" untuk memulai</small>
                </div>

                <div v-for="(bahan, index) in form.bahan_baku" :key="index" class="card mb-2">
                  <div class="card-body py-2">
                    <div class="row align-items-center">
                      <div class="col-md-5">
                        <v-select
                          v-model="bahan.id_bahan_baku"
                          :options="bahanBakuList"
                          :reduce="option => option.id_bahan_baku"
                          label="nama_bahan_baku"
                          placeholder="Cari Bahan Baku"
                        ></v-select>
                      </div>
                      <div class="col-md-3">
                        <input
                          v-model="bahan.jumlah_bahan"
                          type="number"
                          step="0.01"
                          min="0"
                          class="form-control form-control-sm"
                          placeholder="Jumlah"
                          required
                        >
                      </div>
                      <div class="col-md-3">
                        <input
                          v-model="bahan.keterangan"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Keterangan"
                        >
                      </div>
                      <div class="col-md-1">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger rounded-circle"
                          @click="removeBahanBakuField(index)"
                          title="Hapus bahan baku"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

    <!-- Tabel data menu -->
    <div v-if="hasMenuData" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-menu-button-wide me-2"></i>
            Data Menu
          </h5>
          <span class="badge bg-white text-primary">
            {{ menuData.length }} Data
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0">
                  <i class="bi bi-hash me-1"></i>Kode
                </th>
                <th class="border-0">
                  <i class="bi bi-tag me-1"></i>Nama Menu
                </th>
                <th class="border-0">
                  <i class="bi bi-tags me-1"></i>Kategori
                </th>
                <th class="border-0">
                  <i class="bi bi-fire me-1"></i>Kalori
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
              <tr v-for="item in menuData" :key="item.id_menu" class="align-middle">
                <td>
                  <span class="fw-bold text-primary px-2 py-1" style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px;">
                    {{ item.kode_menu }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nama_menu }}</div>
                  <small class="text-muted">{{ item.deskripsi || '-' }}</small>
                </td>
                <td>
                   <span class="badge" :class="item.kategori === 'Basah' ? 'bg-info' : (item.kategori === 'Kering' ? 'bg-warning' : 'bg-secondary')">
                      {{ item.kategori || '-' }}
                   </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-fire text-danger me-2"></i>
                    <span class="fw-semibold">{{ item.kalori_per_porsi || 0 }} kcal</span>
                  </div>
                </td>
                <td>
                  <span class="badge px-2 py-1" :class="item.status === 'aktif' ? 'bg-success' : 'bg-warning'">
                    {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-circle"
                      @click="editMenu(item)"
                      :title="'Edit ' + item.nama_menu"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteMenu(item.id_menu)"
                      :title="'Hapus ' + item.nama_menu"
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import menuService from '@/services/menuService'
import bahanBakuService from '@/services/bahanBakuService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'MenuView',
  components: {
    vSelect
  },
  setup() {
    // State management
    const showAddForm = ref(false)
    const menuData = ref([])
    const bahanBakuList = ref([])
    const loading = ref(false)
    const error = ref('')

    // Form data
    const form = ref({
      kode_menu: '',
      nama_menu: '',
      kategori: '',
      kalori_per_porsi: '',
      protein_gram: '',
      karbohidrat_gram: '',
      lemak_gram: '',
      serat_gram: '',
      deskripsi: '',
      cara_pembuatan: '',
      foto_menu: '',
      status: '',
      bahan_baku: []
    })

    const editingId = ref(null)

    // Computed properties
    const hasMenuData = computed(() => {
      return menuData.value.length > 0
    })

    // Methods
    const fetchMenuData = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await menuService.getAll()
        menuData.value = response.data || response.data?.data || response || []
        console.log('Menu data fetched:', menuData.value)
      } catch (err) {
        error.value = 'Gagal memuat data menu: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching menu data:', err)
      } finally {
        loading.value = false
      }
    }

    
    const fetchBahanBaku = async () => {
      try {
        const response = await bahanBakuService.getAll()
        bahanBakuList.value = response.data || response.data?.data || response || []
      } catch (err) {
        console.error('Error fetching bahan baku:', err)
      }
    }

    const saveMenu = async () => {
      try {
        loading.value = true

        console.log('Form data to be saved:', form.value)

        let response
        if (editingId.value) {
          response = await menuService.update(editingId.value, form.value)
          const index = menuData.value.findIndex(item => item.id_menu === editingId.value)
          if (index !== -1) {
            menuData.value[index] = response.data || response
          }
        } else {
          response = await menuService.create(form.value)
          console.log('Create response:', response)

          const newItem = response.data || response
          if (newItem) {
            menuData.value.push(newItem)
            console.log('Updated menuData:', menuData.value)
          }
        }

        resetForm()
        showAddForm.value = false
        editingId.value = null

        console.log('Menu saved successfully:', response)

        await fetchMenuData()
      } catch (err) {
        console.error('Error saving menu:', err)
        if (err.response?.data?.errors) {
          console.error('Validation errors:', err.response.data.errors)
          const errorMessages = Object.values(err.response.data.errors).flat()
          alert('Validasi gagal: ' + errorMessages.join(', '))
        } else {
          alert('Gagal menyimpan data menu: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        loading.value = false
      }
    }

    const editMenu = async (item) => {
      console.log('Original menu data:', item)
      console.log('Form before edit:', form.value)

      try {
        loading.value = true

        // Fetch detail data to get bahan_baku information
        const response = await menuService.getById(item.id_menu)
        const detailData = response.data

        console.log('Detail menu data:', detailData)

        form.value = {
          kode_menu: detailData.kode_menu || '',
          nama_menu: detailData.nama_menu || '',
          kategori: detailData.kategori || '',
          kalori_per_porsi: detailData.kalori_per_porsi || '',
          protein_gram: detailData.protein_gram || '',
          karbohidrat_gram: detailData.karbohidrat_gram || '',
          lemak_gram: detailData.lemak_gram || '',
          serat_gram: detailData.serat_gram || '',
          deskripsi: detailData.deskripsi || '',
          cara_pembuatan: detailData.cara_pembuatan || '',
          foto_menu: detailData.foto_menu || '',
          status: detailData.status || '',
          bahan_baku: detailData.bahan_baku || []
        }

        editingId.value = item.id_menu
        showAddForm.value = true
        console.log('Form after edit:', form.value)
      } catch (err) {
        console.error('Error fetching menu details:', err)
        alert('Gagal memuat detail menu: ' + (err.response?.data?.message || err.message))
      } finally {
        loading.value = false
      }
    }

    const deleteMenu = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus data menu ini?')) {
        try {
          loading.value = true
          await menuService.delete(id)
          menuData.value = menuData.value.filter(item => item.id_menu !== id)
          console.log('Menu deleted with id:', id)
        } catch (err) {
          console.error('Error deleting menu:', err)
          alert('Gagal menghapus data menu')
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

    const addBahanBakuField = () => {
      form.value.bahan_baku.push({
        id_bahan_baku: '',
        jumlah_bahan: '',
        keterangan: ''
      })
    }

    const removeBahanBakuField = (index) => {
      form.value.bahan_baku.splice(index, 1)
    }

    
    const generateKodeMenu = () => {
      const latestKode = menuData.value.reduce((max, item) => {
        const currentNum = parseInt(item.kode_menu?.replace('M', '') || '0')
        return currentNum > max ? currentNum : max
      }, 0)

      const nextNumber = latestKode + 1
      return `M${nextNumber.toString().padStart(6, '0')}`
    }

    const resetForm = () => {
      form.value = {
        kode_menu: '',
        nama_menu: '',
        kategori: '',
        kalori_per_porsi: '',
        protein_gram: '',
        karbohidrat_gram: '',
        lemak_gram: '',
        serat_gram: '',
        deskripsi: '',
        cara_pembuatan: '',
        foto_menu: '',
        status: '',
        bahan_baku: []
      }
    }

    // Watch for showAddForm changes to generate kode automatically
    watch(showAddForm, (newValue) => {
      if (newValue && !editingId.value) {
        form.value.kode_menu = generateKodeMenu()
      }
    })

    // Lifecycle
    onMounted(() => {
      console.log('🟢 MenuView component mounted successfully!')
      fetchMenuData()
      fetchBahanBaku()
    })

    return {
      // State
      showAddForm,
      menuData,
      bahanBakuList,
      form,
      loading,
      error,
      editingId,

      // Computed
      hasMenuData,

      // Methods
      fetchMenuData,
      saveMenu,
      editMenu,
      deleteMenu,
      cancelAdd,
      addBahanBakuField,
      removeBahanBakuField,
      generateKodeMenu,
      resetForm
    }
  }
}
</script>

<style scoped>
/* Custom styles untuk Menu view */

/* Gradient backgrounds */
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Table styling */
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

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  padding: 0.5em 0.75em;
  font-weight: 500;
}

/* Card improvements */
.card {
  transition: all 0.3s ease;
  border: none;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
  transform: translateY(-2px);
}

/* Header styling */
.text-dark {
  color: #1a1a1a !important;
}

.text-muted {
  color: #6c757d !important;
}

/* Button styling */
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

.btn-rounded-pill {
  border-radius: 50px;
}

/* Form styling */
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

.form-select {
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Loading spinner animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Table responsiveness */
.table-responsive {
  overflow-x: auto;
  border-radius: 0 0 12px 12px;
}

/* Icon styling */
.bi {
  font-size: 1rem;
}

/* Action buttons */
.btn-sm {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Bahan baku section styling */
.bahan-baku-section {
  border: 2px dashed #e0e6ed;
  border-radius: 12px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  transition: all 0.3s ease;
}

.bahan-baku-section:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
}

/* Bahan baku card styling */
.card-body.py-2 {
  padding: 0.75rem 1rem !important;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card-body.py-2:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

/* Empty state for bahan baku */
.bahan-baku-empty {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.bahan-baku-empty i {
  font-size: 2rem;
  color: #dee2e6;
  margin-bottom: 0.5rem;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .btn-lg {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>