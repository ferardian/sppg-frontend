<template>
  <div>
    <!-- Header dengan tombol tambah -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-basket text-primary me-2"></i>
          Data Bahan Baku
        </h3>
        <p class="text-muted mb-0 mt-1">Kelola data bahan baku SPPG</p>
      </div>
      <div class="d-flex gap-2">
        <button
          v-if="!showAddForm"
          class="btn btn-primary btn-lg rounded-pill px-4"
          @click="showAddForm = true"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Bahan Baku
        </button>
        <div class="dropdown" v-if="!showAddForm">
            <button class="btn btn-outline-secondary btn-lg rounded-pill dropdown-toggle d-flex align-items-center gap-2" type="button" @click="showMasterMenu = !showMasterMenu">
              <i class="bi bi-gear"></i> Master
            </button>
            <ul class="dropdown-menu" :class="{ 'show': showMasterMenu }" style="right: 0; left: auto;">
              <li><a class="dropdown-item" href="#" @click.prevent="openMasterModal('kategori')">Kelola Kategori</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="openMasterModal('satuan')">Kelola Satuan</a></li>
            </ul>
        </div>
      </div>
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
                            placeholder="Cari nama atau kode bahan..." 
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
      <p class="mt-2 text-muted">Memuat data bahan baku...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchBahanBakuData">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Alert jika belum ada data -->
    <div v-if="!hasBahanBakuData && !showAddForm && !loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="bi bi-basket text-primary" style="font-size: 5rem;"></i>
        </div>
        <h4 class="mb-3 text-dark">Belum Ada Data Bahan Baku</h4>
        <p class="text-muted mb-4">Mulai dengan menambahkan data bahan baku pertama Anda</p>
        <button class="btn btn-primary btn-lg rounded-pill px-5" @click="showAddForm = true">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Bahan Baku Pertama
        </button>
      </div>
    </div>

    <!-- Form tambah bahan baku -->
    <div v-if="showAddForm" class="card mb-4 shadow-sm" ref="bahanBakuFormCard">
      <div class="card-header bg-gradient-primary text-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Edit Data Bahan Baku' : 'Tambah Data Bahan Baku' }}
        </h5>
        <button 
          type="button" 
          class="btn btn-sm btn-light rounded-circle" 
          @click="cancelAdd"
          title="Tutup Form"
          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
        >
          <i class="bi bi-x-lg text-dark"></i>
        </button>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveBahanBaku">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kode Bahan Baku</label>
              <input
                v-model="form.kode_bahan_baku"
                type="text"
                class="form-control"
                placeholder="Kode otomatis"
                :readonly="!editingId"
                required
              >
              <small class="text-muted">Kode otomatis dengan format B000001</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Bahan Baku</label>
              <input
                v-model="form.nama_bahan_baku"
                type="text"
                class="form-control"
                placeholder="Masukkan nama bahan baku"
                required
              >
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kategori</label>
              <v-select
                v-model="form.kategori"
                :options="kategoriList"
                :reduce="item => item.nama_kategori"
                label="nama_kategori"
                placeholder="Pilih Kategori"
                class="style-chooser"
                :clearable="false"
              ></v-select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Satuan</label>
              <v-select
                v-model="form.satuan"
                :options="satuanList"
                :reduce="item => item.nama_satuan"
                label="nama_satuan"
                placeholder="Pilih Satuan"
                class="style-chooser"
                :clearable="false"
              >
                  <template #option="{ nama_satuan, singkatan }">
                      <span>{{ nama_satuan }}</span>
                      <small class="text-muted ms-2" v-if="singkatan">({{ singkatan }})</small>
                  </template>
              </v-select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Stok Minimal</label>
              <input
                v-model="form.stok_minimal"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="Masukkan stok minimal"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Harga</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  v-model="form.harga"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="Masukkan harga per satuan"
                >
              </div>
              <small class="text-muted">Harga per satuan dasar (misal: per kg, per liter, per pcs)</small>
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
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Keterangan</label>
              <textarea
                v-model="form.keterangan"
                class="form-control"
                rows="3"
                placeholder="Masukkan keterangan (opsional)"
              ></textarea>
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

    <!-- Tabel data bahan baku -->
    <div v-if="hasBahanBakuData" class="card shadow-sm">
      <div class="card-header bg-gradient-primary text-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-basket me-2"></i>
            Data Bahan Baku
          </h5>
          <span class="badge bg-white text-primary">
            {{ bahanBakuData.length }} Data
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
                  <i class="bi bi-tag me-1"></i>Nama Bahan Baku
                </th>
                <th class="border-0">
                  <i class="bi bi-grid me-1"></i>Kategori
                </th>
                <th class="border-0">
                  <i class="bi bi-speedometer me-1"></i>Satuan
                </th>
                <th class="border-0">
                  <i class="bi bi-exclamation-triangle me-1"></i>Stok Minimal
                </th>
                <th class="border-0">
                  <i class="bi bi-currency-exchange me-1"></i>Harga
                </th>
                <th class="border-0">
                  <i class="bi bi-bar-chart me-1"></i>Stok Akhir
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
              <tr v-for="item in bahanBakuData" :key="item.id_bahan_baku" class="align-middle">
                <td>
                  <span class="fw-bold text-primary px-2 py-1" style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px;">
                    {{ item.kode_bahan_baku }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nama_bahan_baku }}</div>
                  <small class="text-muted">{{ item.keterangan || '-' }}</small>
                </td>
                <td>
                  <span class="badge bg-info px-2 py-1">
                    {{ item.kategori }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-speedometer2 text-success me-2"></i>
                    <span>{{ item.satuan }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-diamond text-warning me-2"></i>
                    <span class="fw-semibold">{{ item.stok_minimal }} {{ item.satuan }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-cash-coin text-success me-2"></i>
                    <span class="fw-semibold text-success" v-if="item.harga">
                      {{ formatCurrency(item.harga) }}
                    </span>
                    <span class="text-muted" v-else>
                      <small>Belum ada harga</small>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <i :class="getStokStatusClass(item.stok_akhir, item.stok_minimal)" class="me-2"></i>
                    <span class="fw-semibold" :class="getStokTextColor(item.stok_akhir, item.stok_minimal)">
                      {{ formatNumber(item.stok_akhir || 0) }} {{ item.satuan }}
                    </span>
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
                      @click="editBahanBaku(item)"
                      :title="'Edit ' + item.nama_bahan_baku"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger rounded-circle"
                      @click="deleteBahanBaku(item.id_bahan_baku)"
                      :title="'Hapus ' + item.nama_bahan_baku"
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

    <!-- Pagination Controls -->
    <div v-if="hasBahanBakuData && lastPage > 1" class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-muted small">
            Menampilkan {{ bahanBakuData.length }} dari {{ totalItems }} data
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


    <!-- Master Management Modal -->
    <div v-if="showKategoriModal || showSatuanModal" class="modal-backdrop fade show"></div>
    <div v-if="showKategoriModal || showSatuanModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kelola {{ activeMasterType === 'kategori' ? 'Kategori' : 'Satuan' }}</h5>
            <button type="button" class="btn-close" @click="showKategoriModal = false; showSatuanModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Add/Edit Form -->
            <div class="mb-4">
               <label class="form-label">Nama {{ activeMasterType === 'kategori' ? 'Kategori' : 'Satuan' }}</label>
               <div class="input-group">
                  <input type="text" class="form-control" v-model="masterForm.name" placeholder="Masukkan nama...">
                  <button class="btn btn-primary" @click="saveMasterData" :disabled="!masterForm.name || masterLoading">
                      {{ masterLoading ? 'Menyimpan...' : (masterForm.id ? 'Update' : 'Tambah') }}
                  </button>
                  <button v-if="masterForm.id" class="btn btn-secondary" @click="masterForm = { id: null, name: '' }">Batal</button>
               </div>
            </div>

            <!-- List -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                   <tr>
                     <th>Nama</th>
                     <th style="width: 100px">Aksi</th>
                   </tr>
                </thead>
                <tbody>
                   <tr v-for="item in masterList" :key="activeMasterType === 'kategori' ? item.id_kategori : item.id_satuan">
                     <td>{{ activeMasterType === 'kategori' ? item.nama_kategori : item.nama_satuan }}</td>
                     <td>
                        <button class="btn btn-sm btn-info me-1" @click="prepareEditMaster(item)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" @click="deleteMasterData(activeMasterType === 'kategori' ? item.id_kategori : item.id_satuan)"><i class="bi bi-trash"></i></button>
                     </td>
                   </tr>
                   <tr v-if="masterList.length === 0">
                     <td colspan="2" class="text-center text-muted">Belum ada data</td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import bahanBakuService from '@/services/bahanBakuService'
import stokOpnameService from '@/services/stokOpnameService'
import kategoriBahanService from '@/services/kategoriBahanService'
import satuanService from '@/services/satuanService'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

export default {
  name: 'BahanBakuView',
  components: {
    vSelect
  },
  setup() {
    // Toast notification
    const toast = useToast()
    
    // State management
    const showAddForm = ref(false)
    const showMasterMenu = ref(false)
    const showKategoriModal = ref(false)
    const showSatuanModal = ref(false)
    const bahanBakuData = ref([])
    const loading = ref(false)
    const saveLoading = ref(false)
    const masterLoading = ref(false) // For master data CRUD
    const bahanBakuList = ref([])
    const kategoriList = ref([])
    const satuanList = ref([])
    const error = ref('')
    
    // Ref for form card (for auto-scroll)
    const bahanBakuFormCard = ref(null)
    
    // Master Management State
    const activeMasterType = ref('') // 'kategori' or 'satuan'
    const masterForm = ref({ id: null, name: '' })
    const masterList = ref([]) // Temporary list for the modal

    // Form data
    const form = ref({
      kode_bahan_baku: '',
      nama_bahan_baku: '',
      kategori: '',
      satuan: '',
      stok_minimal: '',
      harga: '',
      status: '',
      keterangan: ''
    })

    const editingId = ref(null)

    // Computed properties
    const hasBahanBakuData = computed(() => {
      return bahanBakuData.value.length > 0
    })

    // Methods
    // Search
    const searchQuery = ref('')
    let searchTimeout = null

    // Pagination State
    const currentPage = ref(1)
    const lastPage = ref(1)
    const totalItems = ref(0)
    const perPage = ref(10)

    // Methods
    const fetchBahanBakuData = async (page = 1) => {
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

        // Fetch both bahan baku data and current stock
        // Now passing page params
        const [bahanBakuResponse, stokResponse] = await Promise.all([
          bahanBakuService.getAll(params),
          stokOpnameService.getLatestStock().catch(() => ({ data: [] }))
        ])

        // Handle different response structures
        // API now returns standard Laravel Pagination Resource structure
        // { data: [...], meta: { current_page, last_page, total, ... }, links: ... }
        
        let bahanBaku = []
        
        if (bahanBakuResponse.data && Array.isArray(bahanBakuResponse.data)) {
           bahanBaku = bahanBakuResponse.data
           
           if (bahanBakuResponse.meta) {
               currentPage.value = bahanBakuResponse.meta.current_page
               lastPage.value = bahanBakuResponse.meta.last_page
               totalItems.value = bahanBakuResponse.meta.total
           }
        } else if (Array.isArray(bahanBakuResponse)) {
            // Fallback for flat array (if backend changes reverted or unexpected)
            bahanBaku = bahanBakuResponse
        }

        const latestStocks = stokResponse.data || stokResponse.data?.data || []

        // Merge current stock data into bahan baku data
        bahanBakuData.value = bahanBaku.map(bahan => {
          const latestStock = latestStocks.find(stock => stock.id_bahan_baku === bahan.id_bahan_baku)
          return {
            ...bahan,
            stok_akhir: latestStock ? parseFloat(latestStock.stok_akhir) || 0 : 0
          }
        })

        console.log('Bahan Baku data fetched with stock:', bahanBakuData.value)
      } catch (err) {
        error.value = 'Gagal memuat data bahan baku: ' + (err.response?.data?.message || err.message)
        console.error('Error fetching bahan baku data:', err)
      } finally {
        loading.value = false
      }
    }

    const changePage = (page) => {
        if (page < 1 || page > lastPage.value) return
        fetchBahanBakuData(page)
    }

    const saveBahanBaku = async () => {
      try {
        loading.value = true

        console.log('Form data to be saved:', form.value)

        let response
        const isEditing = !!editingId.value // Check before reset
        
        if (editingId.value) {
          response = await bahanBakuService.update(editingId.value, form.value)
          const index = bahanBakuData.value.findIndex(item => item.id_bahan_baku === editingId.value)
          if (index !== -1) {
            bahanBakuData.value[index] = response.data || response
          }
        } else {
          response = await bahanBakuService.create(form.value)
          console.log('Create response:', response)

          // Add the new item to the array
          const newItem = response.data || response
          if (newItem) {
            bahanBakuData.value.push(newItem)
            console.log('Updated bahanBakuData:', bahanBakuData.value)
          }
        }

        // Reset form and close
        resetForm()
        showAddForm.value = false
        editingId.value = null

        console.log('Bahan Baku saved successfully:', response)
        
        // Show success toast based on action
        if (isEditing) {
          toast.success('Bahan baku berhasil diperbarui!')
        } else {
          toast.success('Bahan baku berhasil ditambahkan!')
        }

        // Optional: Refresh data to ensure sync
        await fetchBahanBakuData()
      } catch (err) {
        console.error('Error saving bahan baku:', err)
        if (err.response?.data?.errors) {
          console.error('Validation errors:', err.response.data.errors)
          const errorMessages = Object.values(err.response.data.errors).flat()
          toast.error('Validasi gagal: ' + errorMessages.join(', '), {
            timeout: 5000
          })
        } else {
          toast.error('Gagal menyimpan data bahan baku: ' + (err.response?.data?.message || err.message), {
            timeout: 5000
          })
        }
      } finally {
        loading.value = false
      }
    }

    const editBahanBaku = (item) => {
      // Isi form dengan data yang akan diedit
      console.log('Original bahan baku data:', item)
      console.log('Form before edit:', form.value)

      // Pastikan semua field terisi dengan data dari API
      form.value = {
        kode_bahan_baku: item.kode_bahan_baku || '',
        nama_bahan_baku: item.nama_bahan_baku || '',
        kategori: item.kategori || '',
        satuan: item.satuan || '',
        stok_minimal: item.stok_minimal || '',
        harga: item.harga || '',
        status: item.status || '',
        keterangan: item.keterangan || ''
      }

      editingId.value = item.id_bahan_baku
      showAddForm.value = true
      console.log('Form after edit:', form.value)
      
      // Scroll to form after DOM update
      setTimeout(() => {
        if (bahanBakuFormCard.value) {
          bahanBakuFormCard.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }

    const deleteBahanBaku = async (id) => {
      // Find the bahan baku data to show in confirmation
      const bahanBaku = bahanBakuData.value.find(item => item.id_bahan_baku === id)
      
      const result = await Swal.fire({
        title: 'Hapus Bahan Baku?',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>Anda akan menghapus:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p style="margin: 5px 0;"><strong>Kode:</strong> ${bahanBaku?.kode_bahan_baku || '-'}</p>
              <p style="margin: 5px 0;"><strong>Nama:</strong> ${bahanBaku?.nama_bahan_baku || '-'}</p>
              <p style="margin: 5px 0;"><strong>Kategori:</strong> ${bahanBaku?.kategori || '-'}</p>
              <p style="margin: 5px 0;"><strong>Satuan:</strong> ${bahanBaku?.satuan || '-'}</p>
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
          await bahanBakuService.delete(id)
          bahanBakuData.value = bahanBakuData.value.filter(item => item.id_bahan_baku !== id)
          toast.success('Bahan baku berhasil dihapus')
          console.log('Bahan Baku deleted with id:', id)
        } catch (err) {
            console.error('Error deleting bahan baku:', err)
            toast.error('Gagal menghapus bahan baku: ' + (err.response?.data?.message || err.message))
        } finally {
            loading.value = false
        }
      }
    }

    const fetchMasterData = async () => {
      try {
        const [kategoriRes, satuanRes] = await Promise.all([
          kategoriBahanService.getAll(),
          satuanService.getAll()
        ])
        kategoriList.value = kategoriRes.data.data || kategoriRes.data || []
        satuanList.value = satuanRes.data.data || satuanRes.data || []
      } catch (error) {
        console.error('Error fetching master data:', error)
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchBahanBakuData(),
          fetchMasterData()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    }

    // Master Management Logic
    const openMasterModal = (type) => {
      showMasterMenu.value = false // Close dropdown
      activeMasterType.value = type
      masterForm.value = { id: null, name: '' }
      
      // Load current list for display in modal
      masterList.value = type === 'kategori' ? kategoriList.value : satuanList.value
      
      if (type === 'kategori') {
        showKategoriModal.value = true
      } else {
        showSatuanModal.value = true
      }
    }

    const saveMasterData = async () => {
      if (!masterForm.value.name) return
      
      masterLoading.value = true
      try {
        const service = activeMasterType.value === 'kategori' ? kategoriBahanService : satuanService
        const payload = activeMasterType.value === 'kategori' 
            ? { nama_kategori: masterForm.value.name }
            : { nama_satuan: masterForm.value.name }

        if (masterForm.value.id) {
           // Edit
           await service.update(masterForm.value.id, payload)
        } else {
           // Create
           await service.create(payload)
        }
        
        await fetchMasterData() // Refresh lists
        
        // Refresh modal list
        masterList.value = activeMasterType.value === 'kategori' ? kategoriList.value : satuanList.value
        
        masterForm.value = { id: null, name: '' } // Reset form
      } catch (err) {
        console.error('Error saving master data:', err)
        toast.error('Gagal menyimpan data: ' + (err.response?.data?.message || err.message))
      } finally {
        masterLoading.value = false
      }
    }

    const deleteMasterData = async (id) => {
      const result = await Swal.fire({
        title: 'Hapus Data?',
        text: 'Yakin ingin menghapus item ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })
      
      if (!result.isConfirmed) return

      masterLoading.value = true
      try {
         const service = activeMasterType.value === 'kategori' ? kategoriBahanService : satuanService
         await service.delete(id)
         await fetchMasterData()
         masterList.value = activeMasterType.value === 'kategori' ? kategoriList.value : satuanList.value
      } catch (err) {
        console.error('Error deleting master data:', err)
        toast.error('Gagal menghapus data: ' + (err.response?.data?.message || err.message))
      } finally {
        masterLoading.value = false
      }
    }

    const prepareEditMaster = (item) => {
      masterForm.value.id = activeMasterType.value === 'kategori' ? item.id_kategori : item.id_satuan
      masterForm.value.name = activeMasterType.value === 'kategori' ? item.nama_kategori : item.nama_satuan
    }



    const cancelAdd = () => {
      resetForm()
      showAddForm.value = false
      editingId.value = null
    }

    // Watch for showAddForm changes to generate kode automatically
    watch(showAddForm, (newValue) => {
      if (newValue && !editingId.value) {
        // Fetch new code from endpoint
        fetchNextCode()
      }
    })

  const fetchNextCode = async () => {
      try {
          const res = await bahanBakuService.getNextCode()
          if (res.success) {
            form.value.kode_bahan_baku = res.code
          }
      } catch (err) {
          console.error("Failed to generate code", err)
          // Fallback if needed, or just leave blank
      }
  }

  // Frontend generator removed in favor of Backend API
    const resetForm = () => {
      form.value = {
        kode_bahan_baku: '',
        nama_bahan_baku: '',
        kategori: '',
        satuan: '',
        stok_minimal: '',
        harga: '',
        status: '',
        keterangan: ''
      }
    }

    // Helper methods for stock display
    const formatNumber = (num) => {
      return num ? parseFloat(num).toLocaleString('id-ID') : '0'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const getStokStatusClass = (stokAkhir, stokMinimal) => {
      const stok = parseFloat(stokAkhir) || 0
      const minimal = parseFloat(stokMinimal) || 0

      if (stok === 0) return 'bi bi-exclamation-triangle-fill text-danger'
      if (stok <= minimal) return 'bi bi-exclamation-triangle-fill text-warning'
      return 'bi bi-check-circle-fill text-success'
    }

    const getStokTextColor = (stokAkhir, stokMinimal) => {
      const stok = parseFloat(stokAkhir) || 0
      const minimal = parseFloat(stokMinimal) || 0

      if (stok === 0) return 'text-danger'
      if (stok <= minimal) return 'text-warning'
      return 'text-success'
    }

    // Lifecycle
    onMounted(() => {
      console.log('🟢 BahanBakuView component mounted successfully!')
      loadData()
    })

    const debouncedSearch = () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage.value = 1
            fetchBahanBakuData(1)
        }, 500)
    }

    return {
      showAddForm,
      bahanBakuFormCard,
      showMasterMenu,
      showKategoriModal,
      showSatuanModal,
      bahanBakuData,
      loading,
      error,
      hasBahanBakuData,
      form,
      editingId,
      kategoriList,
      satuanList,
      searchQuery,
      debouncedSearch,
      currentPage,
      lastPage,
      totalItems,
      fetchBahanBakuData,
      changePage,
      saveBahanBaku,
      editBahanBaku,
      deleteBahanBaku,
      cancelAdd,
      formatNumber,
      formatCurrency,
      getStokStatusClass,
      getStokTextColor,
      getStokStatusClass,
      getStokTextColor,
      masterLoading,
      openMasterModal,
      saveMasterData,
      deleteMasterData,
      prepareEditMaster,
      kategoriList,
      satuanList,
      // Fix: Add missing master variables
      masterForm,
      activeMasterType,
      masterList
    }
  }
}
</script>

<style scoped>
/* Custom styles untuk Bahan Baku view */

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

/* Loading overlay */
.loading-overlay {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

/* Card header improvements */
.card-header {
  border-bottom: none;
}

/* Data cell improvements */
.fw-semibold {
  font-weight: 600;
}

/* Empty state improvements */
.card.border-0 {
  border: none;
}

/* Alert improvements */
.alert {
  border-radius: 12px;
  border: none;
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

/* Vue Select Customization - Match Bootstrap Form Control */
.style-chooser :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  padding: 0.5rem 0 0.5rem 0.5rem;
  min-height: 50px; /* Matched to approx standard input height */
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  background-color: #fff;
}

.style-chooser :deep(.vs__search::placeholder) {
  color: #6c757d;
}

.style-chooser.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.style-chooser :deep(.vs__selected) {
  margin-top: 0;
  padding: 0;
  margin: 0;
  color: #212529;
}

.style-chooser :deep(.vs__actions) {
  padding-top: 0;
}

.style-chooser :deep(.vs__search) {
  margin-top: 0;
  padding: 0;
}
</style>