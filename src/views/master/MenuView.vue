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

    <!-- Search Filter -->
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
                placeholder="Cari nama atau kode menu..." 
                v-model="searchQuery" 
                @input="debouncedSearch"
              >
            </div>
          </div>
        </div>
      </div>
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
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchMenuData(currentPage)">
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
    <div v-if="showAddForm" class="card mb-4 shadow-sm border-0" ref="menuFormCard">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-menu-button-wide me-2"></i>
          {{ editingId ? 'Edit Data Menu' : 'Tambah Data Menu' }}
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
                ref="namaMenuInput"
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
              <label class="form-label mb-3">Bahan Baku</label>
              <div class="bahan-baku-section p-3 border rounded bg-light">
                <div v-if="form.bahan_baku.length === 0" class="text-center py-3 text-muted">
                  <i class="bi bi-basket fs-2"></i>
                  <p class="mb-0">Belum ada bahan baku ditambahkan</p>
                </div>

                <div v-for="(bahan, index) in form.bahan_baku" :key="index" class="card mb-2 border-0 shadow-sm">
                  <div class="card-body p-2">
                    <div class="row g-2 align-items-center">
                      <div class="col-md-6">
                        <v-select
                          v-model="bahan.id_bahan_baku"
                          :options="bahanBakuList"
                          :reduce="option => option.id_bahan_baku"
                          label="nama_bahan_baku"
                          placeholder="Cari Bahan Baku"
                        ></v-select>
                      </div>
                      <div class="col-md-5">
                        <input
                          v-model="bahan.keterangan"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Keterangan (Opsional)"
                        >
                      </div>
                      <div class="col-md-1 text-center">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger border-0"
                          @click="removeBahanBakuField(index)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm w-100 mt-2"
                  @click="addBahanBakuField"
                >
                  <i class="bi bi-plus-circle me-1"></i>
                  Tambah Bahan Baku
                </button>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" @click="cancelAdd" :disabled="loading">
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
    <div v-if="hasMenuData" class="card border-0 shadow-sm overflow-hidden">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold text-dark">
            <i class="bi bi-menu-button-wide me-2 text-primary"></i>
            Data Menu
          </h5>
          <span class="badge bg-primary bg-opacity-10 text-primary">
            {{ totalItems }} Total Data
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 600px; overflow-y: auto;">
          <table class="table table-hover mb-0">
            <thead class="table-light sticky-top" style="z-index: 10;">
              <tr>
                <th class="border-0 px-4">Kode</th>
                <th class="border-0">Nama Menu</th>
                <th class="border-0">Kategori</th>
                <th class="border-0">Kalori</th>
                <th class="border-0">Status</th>
                <th class="border-0 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in menuData" :key="item.id_menu" class="align-middle">
                <td class="px-4">
                  <span class="badge bg-primary bg-opacity-10 text-primary fw-bold">
                    {{ item.kode_menu }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nama_menu }}</div>
                  <small class="text-muted d-block text-truncate" style="max-width: 250px;">{{ item.deskripsi || '-' }}</small>
                </td>
                <td>
                  <span class="badge rounded-pill" :class="item.kategori === 'Basah' ? 'bg-info bg-opacity-10 text-info' : 'bg-warning bg-opacity-10 text-warning'">
                    {{ item.kategori || '-' }}
                  </span>
                </td>
                <td>
                  <span class="fw-semibold text-dark"><i class="bi bi-fire text-danger me-1"></i>{{ item.kalori_per_porsi || 0 }} kcal</span>
                </td>
                <td>
                  <span class="badge px-3 py-1 rounded-pill" :class="item.status === 'aktif' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'">
                    {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-circle" @click="editMenu(item)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" @click="deleteMenu(item.id_menu)">
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

    <!-- Pagination Controls -->
    <div v-if="hasMenuData && lastPage > 1" class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted small">
        Menampilkan {{ menuData.length }} dari {{ totalItems }} data
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li v-for="page in lastPage" :key="page" class="page-item" :class="{ active: currentPage === page }">
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: currentPage === lastPage }">
            <button class="page-link" @click="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import menuService from '@/services/menuService'
import bahanBakuService from '@/services/bahanBakuService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

export default {
  name: 'MenuView',
  components: {
    vSelect
  },
  setup() {
    // Toast notification
    const toast = useToast()
    
    // State management
    const showAddForm = ref(false)
    const menuData = ref([])
    const bahanBakuList = ref([])
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const namaMenuInput = ref(null)
    let searchTimeout = null
    
    // Pagination State
    const currentPage = ref(1)
    const lastPage = ref(1)
    const totalItems = ref(0)
    const perPage = ref(10)

    // Ref for form card (for auto-scroll)
    const menuFormCard = ref(null)

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
    const fetchMenuData = async (page = 1) => {
      try {
        loading.value = true
        error.value = ''
        currentPage.value = page
        
        const params = {
          page: page,
          per_page: perPage.value
        }
        
        if (searchQuery.value) {
            params.search = searchQuery.value
        }

        const response = await menuService.getAll(params)
        
        // Handle Laravel Pagination structure
        if (response.data && Array.isArray(response.data)) {
          menuData.value = response.data
          if (response.meta) {
            currentPage.value = response.meta.current_page
            lastPage.value = response.meta.last_page
            totalItems.value = response.meta.total
          }
        } else if (Array.isArray(response)) {
          menuData.value = response
          totalItems.value = response.length
          lastPage.value = 1
        } else {
          menuData.value = []
        }
        
        console.log('Menu data fetched:', menuData.value)
      } catch (err) {
        error.value = 'Gagal memuat data menu: ' + (err.message || 'Terjadi kesalahan sistem')
        console.error('Error fetching menu data:', err)
      } finally {
        loading.value = false
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= lastPage.value) {
        fetchMenuData(page)
      }
    }
    
    const fetchBahanBaku = async () => {
      try {
        // Fetch all items (virtually unlimited) to ensure dropdown works correctly
        const response = await bahanBakuService.getAll({ per_page: 9999 })
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
        const isEditing = !!editingId.value // Check before reset
        
        if (editingId.value) {
          response = await menuService.update(editingId.value, form.value)
        } else {
          response = await menuService.create(form.value)
        }

        resetForm()
        showAddForm.value = false
        editingId.value = null

        console.log('Menu saved successfully:', response)
        
        // Show success toast based on action
        if (isEditing) {
          toast.success('Menu berhasil diperbarui!')
        } else {
          toast.success('Menu berhasil ditambahkan!')
        }

        await fetchMenuData(currentPage.value)
      } catch (err) {
        console.error('Error saving menu:', err)
        
        // Handle validation errors from Laravel (err is already error.response.data due to interceptor)
        if (err.errors) {
          console.error('Validation errors:', err.errors)
          const errorMessages = Object.values(err.errors).flat()
          toast.error('Validasi gagal: ' + errorMessages.join(', '), {
            timeout: 7000
          })
        } else {
          toast.error('Gagal menyimpan data menu: ' + (err.message || 'Terjadi kesalahan sistem'), {
            timeout: 5000
          })
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

        // Auto focus and scroll
        nextTick(() => {
          if (menuFormCard.value) {
            menuFormCard.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          if (namaMenuInput.value) {
            namaMenuInput.value.focus()
          }
        })
      } catch (err) {
        console.error('Error fetching menu details:', err)
        toast.error('Gagal memuat detail menu: ' + (err.message || 'Terjadi kesalahan sistem'))
      } finally {
        loading.value = false
      }
    }

    const deleteMenu = async (id) => {
      // Find the menu data to show in confirmation
      const menu = menuData.value.find(item => item.id_menu === id)
      
      const result = await Swal.fire({
        title: 'Hapus Menu?',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>Anda akan menghapus:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p style="margin: 5px 0;"><strong>Kode:</strong> ${menu?.kode_menu || '-'}</p>
              <p style="margin: 5px 0;"><strong>Nama:</strong> ${menu?.nama_menu || '-'}</p>
              <p style="margin: 5px 0;"><strong>Kategori:</strong> ${menu?.kategori || '-'}</p>
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
          await menuService.delete(id)
          toast.success('Menu berhasil dihapus')
          await fetchMenuData(currentPage.value)
        } catch (err) {
          console.error('Error deleting menu:', err)
          toast.error('Gagal menghapus menu: ' + (err.message || 'Terjadi kesalahan sistem'))
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
        jumlah_bahan: 0,
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

    const debouncedSearch = () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            fetchMenuData(1)
        }, 500)
    }

    // Lifecycle
    onMounted(() => {
      console.log('🟢 MenuView component mounted successfully!')
      fetchMenuData()
      fetchBahanBaku()
    })

    return {
      showAddForm,
      menuFormCard,
      menuData,
      bahanBakuList,
      loading,
      error,
      hasMenuData,
      form,
      editingId,
      searchQuery,
      debouncedSearch,
      currentPage,
      lastPage,
      totalItems,
      changePage,
      fetchMenuData,
      saveMenu,
      editMenu,
      deleteMenu,
      cancelAdd,
      addBahanBakuField,
      removeBahanBakuField,
      generateKodeMenu,
      resetForm,
      namaMenuInput
    }
  }
}
</script>

<style>
/* Global styles for vue-select appended to body */
.vs__dropdown-menu {
  z-index: 9999 !important;
}

/* Sticky table header */
.sticky-top {
  position: sticky;
  top: 0;
  background-color: #f8f9fa !important;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.05);
}
</style>