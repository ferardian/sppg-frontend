<template>
  <div class="komposisi-pangan-view">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">
          <i class="bi bi-egg-fried text-primary me-2"></i>
          Daftar Komposisi Pangan
        </h4>
        <p class="text-muted mb-0">
          Referensi nilai gizi dan kandungan bahan pangan Indonesia
        </p>
      </div>
    </div>

    <!-- Search & Filter Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Cari nama bahan atau kode..."
                v-model="searchQuery"
                @keyup.enter="searchData"
              />
              <button class="btn btn-primary" @click="searchData">
                Cari
              </button>
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="selectedCategory" @change="searchData">
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Kode</th>
                <th>Nama Bahan</th>
                <th>Kategori</th>
                <th>Energi (Kal)</th>
                <th>Protein (g)</th>
                <th>Lemak (g)</th>
                <th>Karbo (g)</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox display-1 mb-3 d-block opacity-25"></i>
                  Data tidak ditemukan
                </td>
              </tr>
              <tr v-for="item in items" :key="item.id">
                <td class="ps-4 fw-medium">{{ item.kode }}</td>
                <td>{{ item.nama_bahan }}</td>
                <td>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary">
                    {{ item.kategori || '-' }}
                  </span>
                </td>
                <td>{{ item.energi }}</td>
                <td>{{ item.protein }}</td>
                <td>{{ item.lemak }}</td>
                <td>{{ item.karbohidrat }}</td>
                <td class="text-end pe-4">
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click="showDetail(item)"
                    title="Lihat Detail"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3" v-if="pagination.total > 0">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            Menampilkan {{ pagination.from }}-{{ pagination.to }} dari {{ pagination.total }} data
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
                <button
                  class="page-link"
                  @click="changePage(pagination.current_page - 1)"
                  :disabled="!pagination.prev_page_url"
                >
                  Previous
                </button>
              </li>
              <li class="page-item active">
                <span class="page-link">{{ pagination.current_page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
                <button
                  class="page-link"
                  @click="changePage(pagination.current_page + 1)"
                  :disabled="!pagination.next_page_url"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div class="modal fade" id="detailModal" tabindex="-1" ref="detailModalRef">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-3 bg-gradient-primary text-white">
              <h5 class="modal-title d-flex align-items-center">
                <i class="bi bi-info-circle-fill me-2 fs-4 text-white-50"></i>
                Detail Komposisi Pangan
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body pt-4 px-4" v-if="selectedItem">
              <div class="d-flex align-items-center mb-4 p-3 bg-light rounded-4 border">
                <div class="bg-white p-3 rounded-circle me-4 shadow-sm text-primary d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                  <i class="bi bi-basket3-fill fs-2"></i>
                </div>
                <div class="flex-grow-1">
                  <h4 class="mb-2 fw-bold text-dark">{{ selectedItem.nama_bahan }}</h4>
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span class="badge bg-primary bg-gradient rounded-pill px-3">{{ selectedItem.kode }}</span>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 text-wrap text-start lh-sm">{{ selectedItem.kategori }}</span>
                    <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 text-wrap text-start lh-sm">{{ selectedItem.jenis }}</span>
                  </div>
                  <small class="text-muted d-block">
                    <i class="bi bi-book me-1"></i> Sumber: {{ selectedItem.sumber }} 
                    <span class="mx-2">|</span> 
                    <i class="bi bi-pie-chart me-1"></i> BDD: {{ selectedItem.bdd }}%
                  </small>
                </div>
              </div>

              <h6 class="border-bottom pb-2 mb-3 text-primary fw-bold d-flex align-items-center">
                <i class="bi bi-activity me-2"></i>
                Makronutrien <small class="text-muted fw-normal ms-1">(per 100g BDD)</small>
              </h6>
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white rounded-3 text-center border h-100 shadow-sm macro-card">
                    <div class="text-muted small mb-1 text-uppercase fw-bold ls-1">Energi</div>
                    <div class="fw-bold fs-4 text-primary">{{ selectedItem.energi }} <small class="fs-6 fw-normal text-muted">Kal</small></div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white rounded-3 text-center border h-100 shadow-sm macro-card">
                    <div class="text-muted small mb-1 text-uppercase fw-bold ls-1">Protein</div>
                    <div class="fw-bold fs-4 text-success">{{ selectedItem.protein }} <small class="fs-6 fw-normal text-muted">g</small></div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white rounded-3 text-center border h-100 shadow-sm macro-card">
                    <div class="text-muted small mb-1 text-uppercase fw-bold ls-1">Lemak</div>
                    <div class="fw-bold fs-4 text-warning">{{ selectedItem.lemak }} <small class="fs-6 fw-normal text-muted">g</small></div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white rounded-3 text-center border h-100 shadow-sm macro-card">
                    <div class="text-muted small mb-1 text-uppercase fw-bold ls-1">Karbohidrat</div>
                    <div class="fw-bold fs-4 text-info">{{ selectedItem.karbohidrat }} <small class="fs-6 fw-normal text-muted">g</small></div>
                  </div>
                </div>
                <!-- Secondary Macros -->
                <div class="col-4">
                  <div class="p-2 bg-light rounded-3 text-center border">
                     <small class="d-block text-muted mb-1">Serat (g)</small>
                     <span class="fw-bold">{{ selectedItem.serat }}</span>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2 bg-light rounded-3 text-center border">
                     <small class="d-block text-muted mb-1">Abu (g)</small>
                     <span class="fw-bold">{{ selectedItem.abu }}</span>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2 bg-light rounded-3 text-center border">
                     <small class="d-block text-muted mb-1">Air (g)</small>
                     <span class="fw-bold">{{ selectedItem.air }}</span>
                  </div>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-md-6">
                  <div class="card border h-100">
                    <div class="card-header bg-light py-2">
                      <h6 class="mb-0 fw-bold text-dark d-flex align-items-center">
                        <i class="bi bi-gem me-2 text-secondary"></i> Mineral (mg)
                      </h6>
                    </div>
                    <div class="card-body p-0">
                      <table class="table table-sm table-striped mb-0 custom-table">
                        <tbody>
                          <tr><td class="text-muted ps-3">Kalsium</td><td class="fw-medium text-end pe-3">{{ selectedItem.kalsium }}</td></tr>
                          <tr><td class="text-muted ps-3">Fosfor</td><td class="fw-medium text-end pe-3">{{ selectedItem.fosfor }}</td></tr>
                          <tr><td class="text-muted ps-3">Besi</td><td class="fw-medium text-end pe-3">{{ selectedItem.besi }}</td></tr>
                          <tr><td class="text-muted ps-3">Natrium</td><td class="fw-medium text-end pe-3">{{ selectedItem.natrium }}</td></tr>
                          <tr><td class="text-muted ps-3">Kalium</td><td class="fw-medium text-end pe-3">{{ selectedItem.kalium }}</td></tr>
                          <tr><td class="text-muted ps-3">Tembaga</td><td class="fw-medium text-end pe-3">{{ selectedItem.tembaga }}</td></tr>
                          <tr><td class="text-muted ps-3">Seng</td><td class="fw-medium text-end pe-3">{{ selectedItem.seng }}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card border h-100">
                    <div class="card-header bg-light py-2">
                       <h6 class="mb-0 fw-bold text-dark d-flex align-items-center">
                        <i class="bi bi-capsule me-2 text-success"></i> Vitamin
                      </h6>
                    </div>
                    <div class="card-body p-0">
                      <table class="table table-sm table-striped mb-0 custom-table">
                        <tbody>
                          <tr><td class="text-muted ps-3">Retinol (mcg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.retinol }}</td></tr>
                          <tr><td class="text-muted ps-3">Beta Karoten (mcg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.beta_karoten }}</td></tr>
                          <tr><td class="text-muted ps-3">Karoten Total (mcg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.karoten_total }}</td></tr>
                          <tr><td class="text-muted ps-3">Thiamin (mg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.thiamin }}</td></tr>
                          <tr><td class="text-muted ps-3">Riboflavin (mg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.riboflavin }}</td></tr>
                          <tr><td class="text-muted ps-3">Niasin (mg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.niasin }}</td></tr>
                          <tr><td class="text-muted ps-3">Vitamin C (mg)</td><td class="fw-medium text-end pe-3">{{ selectedItem.vitamin_c }}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 bg-light">
              <button type="button" class="btn btn-secondary px-4 fw-medium" data-bs-dismiss="modal">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { Modal } from 'bootstrap'
import komposisiPanganService from '@/services/komposisiPanganService'
import { useToast } from 'vue-toastification'

export default {
  name: 'KomposisiPanganView',
  setup() {
    const toast = useToast()
    const loading = ref(false)
    const items = ref([])
    const pagination = ref({})
    
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedItem = ref(null)
    const detailModal = ref(null)
    const detailModalRef = ref(null)

    // Hardcoded common categories for filter
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
        toast.error('Gagal memuat data')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const searchData = () => {
      fetchData(1)
    }

    const changePage = (page) => {
      fetchData(page)
    }

    const showDetail = (item) => {
      selectedItem.value = item
      if (detailModal.value) {
        detailModal.value.show()
      }
    }

    onMounted(() => {
      fetchData()
      if (detailModalRef.value) {
        detailModal.value = new Modal(detailModalRef.value)
      }
    })

    return {
      items,
      loading,
      pagination,
      searchQuery,
      selectedCategory,
      categories,
      selectedItem,
      detailModalRef,
      searchData,
      changePage,
      showDetail
    }
  }
}
</script>

<style scoped>
.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #8e44ad;
}

.input-group-text {
  background-color: #fff;
}

/* Modal Styling */
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.macro-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.macro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important;
}

.ls-1 {
  letter-spacing: 1px;
}

/* Fix badge wrapping on mobile */
.badge.text-wrap {
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  max-width: 100%;
  display: inline-block; /* Ensure text-wrap works */
}

.custom-table tr:last-child {
  border-bottom: none;
}

</style>
