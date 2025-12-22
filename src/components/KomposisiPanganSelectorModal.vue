<template>
  <Teleport to="body">
    <div class="modal fade" id="komposisiPanganSelectorModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg" style="height: 90vh;">
          <div class="modal-header border-0 pb-3 bg-gradient-primary text-white">
            <h5 class="modal-title d-flex align-items-center">
              <i class="bi bi-search me-2 text-white-50"></i>
              Pilih Data Komposisi Pangan
            </h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-0 d-flex flex-column bg-light h-100 overflow-hidden">
            <!-- Search & Filter Header -->
            <div class="bg-white p-3 border-bottom shadow-sm z-1">
              <div class="row g-3">
                <div class="col-md-5">
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control border-start-0 ps-0 bg-light" 
                      placeholder="Cari nama bahan pangan..."
                      v-model="searchQuery"
                      @keyup.enter="searchData"
                    >
                    <button class="btn btn-primary px-4" @click="searchData">
                      Cari
                    </button>
                  </div>
                </div>
                <div class="col-md-4">
                  <select class="form-select bg-light" v-model="selectedCategory" @change="searchData">
                    <option value="">Semua Kategori</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div class="flex-grow-1 overflow-auto p-3">
              <div v-if="loading" class="d-flex justify-content-center align-items-center h-100">
                <div class="text-center text-muted">
                  <div class="spinner-border text-primary mb-3" role="status"></div>
                  <div>Sedang memuat data...</div>
                </div>
              </div>

              <div v-else-if="items.length === 0" class="d-flex justify-content-center align-items-center h-100">
                <div class="text-center text-muted opacity-50">
                  <i class="bi bi-inbox display-1 mb-3 d-block"></i>
                  <h5>Data tidak ditemukan</h5>
                  <p>Coba kata kunci pencarian lain</p>
                </div>
              </div>

              <div v-else class="row g-3">
                <div v-for="item in items" :key="item.id" class="col-md-6 col-lg-4">
                  <div class="card h-100 border-0 shadow-sm hover-card cursor-pointer" @click="selectItem(item)">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill">{{ item.kode }}</span>
                        <button class="btn btn-sm btn-outline-primary rounded-circle p-1 lh-1" @click.stop="selectItem(item)">
                          <i class="bi bi-check-lg"></i>
                        </button>
                      </div>
                      <h6 class="card-title fw-bold text-dark mb-1 text-truncate-2">{{ item.nama_bahan }}</h6>
                      <p class="card-text text-muted small mb-3 text-truncate">{{ item.kategori }}</p>
                      
                      <div class="d-flex justify-content-between text-muted small bg-light rounded p-2">
                        <div class="text-center px-2 border-end">
                          <div class="fw-bold text-dark">{{ item.energi }}</div>
                          <div style="font-size: 0.7rem;">Kal</div>
                        </div>
                        <div class="text-center px-2 border-end">
                          <div class="fw-bold text-success">{{ item.protein }}</div>
                          <div style="font-size: 0.7rem;">Prot</div>
                        </div>
                        <div class="text-center px-2 border-end">
                          <div class="fw-bold text-warning">{{ item.lemak }}</div>
                          <div style="font-size: 0.7rem;">Lmk</div>
                        </div>
                        <div class="text-center px-2 border-end">
                          <div class="fw-bold text-info">{{ item.karbohidrat }}</div>
                          <div style="font-size: 0.7rem;">KH</div>
                        </div>
                        <div class="text-center px-2">
                          <div class="fw-bold text-secondary">{{ item.serat }}</div>
                          <div style="font-size: 0.7rem;">Srt</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Pagination -->
            <div class="bg-white p-3 border-top shadow-sm z-1" v-if="pagination.total > 0">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  Showing {{ pagination.from }}-{{ pagination.to }} of {{ pagination.total }}
                </small>
                <nav aria-label="Page navigation">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
                      <button class="page-link border-0 rounded-start" @click="changePage(pagination.current_page - 1)">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li class="page-item active">
                      <span class="page-link border-0">{{ pagination.current_page }}</span>
                    </li>
                    <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
                      <button class="page-link border-0 rounded-end" @click="changePage(pagination.current_page + 1)">
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import komposisiPanganService from '@/services/komposisiPanganService'
import { useToast } from 'vue-toastification'

export default {
  name: 'KomposisiPanganSelectorModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const toast = useToast()
    const modalRef = ref(null)
    const modalInstance = ref(null)
    const loading = ref(false)
    const items = ref([])
    const pagination = ref({})
    const searchQuery = ref('')
    const selectedCategory = ref('')

    // Categories (Synced with View)
    const categories = [
      'SEREALIA DAN HASIL OLAHANNYA',
      'UMBI BERPATI DAN HASIL OLAHANNYA',
      'KACANG-KACANGAN, BIJI-BIJIAN, DAN HASIL OLAHANNYA',
      'SAYURAN DAN HASIL OLAHANNYA',
      'BUAH DAN HASIL OLAHANNYA',
      'DAGING, UNGGAS, DAN HASIL OLAHANNYA',
      'IKAN, KERANG, UDANG, DAN HASIL OLAHANNYA',
      'TELUR DAN HASIL OLAHANNYA',
      'SUSU DAN HASIL OLAHANNYA',
      'LEMAK DAN MINYAK',
      'GULA, SIRUP, DAN KONFEKSIONERI',
      'BUMBU-BUMBU'
    ]

    const fetchData = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          q: searchQuery.value,
          kategori: selectedCategory.value
        }
        const response = await komposisiPanganService.getAll(params)
        items.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          from: response.data.from,
          to: response.data.to,
          total: response.data.total,
          prev_page_url: response.data.prev_page_url,
          next_page_url: response.data.next_page_url
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data komposisi pangan')
      } finally {
        loading.value = false
      }
    }

    const searchData = () => fetchData(1)
    const changePage = (page) => fetchData(page)

    const selectItem = (item) => {
      emit('select', item)
      closeModal()
    }

    const closeModal = () => {
      emit('close')
    }

    watch(() => props.isVisible, (newVal) => {
      if (newVal) {
        if (!modalInstance.value && modalRef.value) {
           modalInstance.value = new Modal(modalRef.value, {
             backdrop: 'static',
             keyboard: false
           })
        }
        modalInstance.value?.show()
        // Reset search or keep it? Let's reset for fresh start
        if (items.value.length === 0) fetchData()
      } else {
        modalInstance.value?.hide()
      }
    })

    onMounted(() => {
      // Initialize modal if not already
      if (modalRef.value) {
        modalInstance.value = new Modal(modalRef.value, {
          backdrop: 'static',
          keyboard: false
        })
      }
    })

    return {
      modalRef,
      loading,
      items,
      pagination,
      searchQuery,
      selectedCategory,
      categories,
      searchData,
      changePage,
      selectItem,
      closeModal
    }
  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
  border-color: #667eea !important;
}
.cursor-pointer {
  cursor: pointer;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Modal fix for scrolling */
.modal-body {
  overflow-y: hidden; 
}
</style>
