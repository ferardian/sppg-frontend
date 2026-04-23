<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-box-seam text-primary me-2"></i>
          Laporan Inventory
        </h3>
        <p class="text-muted mb-0 mt-1">Pantau stok dan pergerakan bahan baku pangan</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-success rounded-pill px-3 shadow-sm border-0 bg-white" @click="exportExcel">
          <i class="bi bi-file-earmark-excel me-1"></i> Excel
        </button>
        <button class="btn btn-primary rounded-pill px-4 shadow" @click="printReport">
          <i class="bi bi-printer me-2"></i> Cetak Laporan
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card mb-4 shadow-sm border-0 plumpy-card">
      <div class="card-body p-4">
        <div class="row align-items-end g-3">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted text-uppercase mb-2">Tanggal Mulai</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-calendar-event"></i></span>
              <input type="date" class="form-control border-0 bg-light" v-model="filters.start_date" @change="fetchReport">
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted text-uppercase mb-2">Tanggal Selesai</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-calendar-check"></i></span>
              <input type="date" class="form-control border-0 bg-light" v-model="filters.end_date" @change="fetchReport">
            </div>
          </div>
          <div class="col-md-4">
             <button class="btn btn-light w-100 rounded-3 border-0 py-2" @click="fetchReport" :disabled="loading">
                <i v-if="loading" class="bi bi-arrow-repeat spin me-2"></i>
                <i v-else class="bi bi-funnel me-2"></i>
                Filter Laporan
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm overflow-hidden plumpy-card">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Membangun laporan...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4 border-0 py-3">Bahan Baku</th>
                <th class="text-center border-0 py-3">Masuk (+)</th>
                <th class="text-center border-0 py-3">Keluar (-)</th>
                <th class="text-center border-0 py-3">Penyesuaian</th>
                <th class="text-end pe-4 border-0 py-3">Stok Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id_bahan_baku">
                <td class="ps-4 py-3">
                  <div class="fw-bold text-dark">{{ item.nama_bahan_baku }}</div>
                  <small class="badge bg-light text-muted fw-normal">{{ item.kode_bahan_baku }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3" v-if="item.total_masuk > 0">
                    +{{ item.total_masuk }}
                  </span>
                  <span class="text-muted opacity-50" v-else>0</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3" v-if="item.total_keluar > 0">
                    -{{ item.total_keluar }}
                  </span>
                  <span class="text-muted opacity-50" v-else>0</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3" v-if="item.total_penyesuaian != 0">
                    {{ item.total_penyesuaian > 0 ? '+' : '' }}{{ item.total_penyesuaian }}
                  </span>
                  <span class="text-muted opacity-50" v-else>0</span>
                </td>
                <td class="text-end pe-4 fw-bold">
                  <span :class="item.stok_saat_ini <= 0 ? 'text-danger' : 'text-primary'">
                    {{ item.stok_saat_ini }}
                  </span>
                </td>
              </tr>
              <tr v-if="reportData.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <div class="mb-3">
                    <i class="bi bi-inbox fs-1 opacity-25"></i>
                  </div>
                  <p class="mb-0 fw-bold">Tidak ada data transaksi</p>
                  <small>Coba ubah filter rentang tanggal di atas</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="mt-4 p-3 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 d-flex align-items-center">
        <i class="bi bi-info-circle-fill text-primary me-3 fs-4"></i>
        <p class="mb-0 text-primary small">
           <strong>Stok Akhir</strong> dihitung berdasarkan akumulasi seluruh transaksi hingga tanggal selesai yang dipilih.
        </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const reportData = ref([])
const loading = ref(false)
const filters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
})

const fetchReport = async () => {
  try {
    loading.value = true
    const res = await api.get('/reports/inventory', { params: filters.value })
    if (res.data && res.data.data) {
        reportData.value = res.data.data.items
    }
  } catch (error) {
    console.error('Failed to fetch report:', error)
    toast.error('Gagal memuat laporan inventory. Hubungi admin.')
  } finally {
    loading.value = false
  }
}

const exportExcel = () => {
  toast.info('Fitur ekspor Excel sedang dalam pengembangan')
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  fetchReport()
})
</script>

<style scoped>
.spin { animation: fa-spin 2s infinite linear; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } }

.plumpy-card {
    border-radius: 1.25rem;
}

@media print {
  .btn, .form-label, .input-group, .mt-4, .sidebar, .main-content {
    display: none !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
    width: 100% !important;
    position: absolute;
    top: 0;
    left: 0;
  }
  .container-fluid {
    padding: 0 !important;
  }
  .table th { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; }
}
</style>
