<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-cash-coin text-primary me-2"></i>
          Insentif Kader PIC
        </h3>
        <p class="text-muted mb-0 mt-1">Rekapitulasi insentif penanggung jawab distribusi sekolah</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary rounded-pill px-4 shadow" @click="printReport">
          <i class="bi bi-printer me-2"></i> Cetak Laporan
        </button>
      </div>
    </div>

    <!-- Filter & Config Card -->
    <div class="card mb-4 shadow-sm border-0 plumpy-card">
      <div class="card-body p-4">
        <div class="row align-items-end g-3">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted text-uppercase mb-2">Periode Mulai</label>
            <input type="date" class="form-control border-0 bg-light" v-model="filters.start_date" @change="fetchReport">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted text-uppercase mb-2">Periode Selesai</label>
            <input type="date" class="form-control border-0 bg-light" v-model="filters.end_date" @change="fetchReport">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted text-uppercase mb-2">Rate per Distribusi (Rp)</label>
            <div class="input-group">
              <span class="input-group-text border-0 bg-light">Rp</span>
              <input type="number" class="form-control border-0 bg-light" v-model="filters.rate" @change="fetchReport">
            </div>
          </div>
          <div class="col-md-3">
             <button class="btn btn-light w-100 rounded-3 border-0 py-2" @click="fetchReport" :disabled="loading">
                <i v-if="loading" class="bi bi-arrow-repeat spin me-2"></i>
                <i v-else class="bi bi-arrow-clockwise me-2"></i>
                Refresh Data
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm overflow-hidden plumpy-card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase small fw-bold text-muted">
              <tr>
                <th class="ps-4 border-0 py-3">Nama Kader / Rekening</th>
                <th class="border-0 py-3">Sekolah / Lembaga</th>
                <th class="text-center border-0 py-3">Jml Distribusi</th>
                <th class="text-end border-0 py-3">Rate</th>
                <th class="text-end pe-4 border-0 py-3">Total Insentif</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id_kader">
                <td class="ps-4 py-3">
                  <div class="fw-bold text-dark">{{ item.nama_kader }}</div>
                  <small class="text-muted"><i class="bi bi-credit-card me-1"></i> {{ item.rekening }}</small>
                </td>
                <td class="py-3">
                   <div class="fw-semibold text-muted small">{{ item.sekolah }}</div>
                </td>
                <td class="text-center py-3">
                  <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                    {{ item.jumlah_distribusi }} kali
                  </span>
                </td>
                <td class="text-end py-3 text-muted small">{{ formatCurrency(item.rate) }}</td>
                <td class="text-end pe-4 py-3 fw-bold text-primary">
                  {{ formatCurrency(item.total_insentif) }}
                </td>
              </tr>
              <tr v-if="reportData.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                   <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                   Tidak ada data untuk periode ini.
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold" v-if="reportData.length > 0">
               <tr>
                 <td colspan="4" class="text-end pe-4 py-3 border-0">TOTAL KESELURUHAN</td>
                 <td class="text-end pe-4 py-3 text-primary fs-5 border-0">{{ formatCurrency(totalOverall) }}</td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Summary Info -->
    <div class="row mt-4">
       <div class="col-md-12">
          <div class="p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-10 d-flex align-items-center">
             <i class="bi bi-check-circle-fill text-success me-3 fs-4"></i>
             <p class="mb-0 text-success small">
                Data di atas merupakan akumulasi distribusi makanan yang telah berstatus <strong>Selesai</strong> pada periode yang dipilih.
             </p>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const reportData = ref([])
const loading = ref(false)
const filters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  rate: 5000
})

const fetchReport = async () => {
  try {
    loading.value = true
    const res = await api.get('/reports/kader-incentive', { params: filters.value })
    if (res.data && res.data.data) {
        reportData.value = res.data.data.report
    }
  } catch (error) {
    console.error('Failed to fetch report:', error)
    toast.error('Gagal memuat data insentif')
  } finally {
    loading.value = false
  }
}

const totalOverall = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.total_insentif, 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const printReport = () => window.print()

onMounted(fetchReport)
</script>

<style scoped>
.spin { animation: fa-spin 2s infinite linear; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } }

.plumpy-card {
    border-radius: 1.25rem;
}

@media print {
  .btn, .form-label, .input-group, .mt-4, .sidebar, .main-content, .card-body:first-child {
    display: none !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
    width: 100% !important;
  }
  .container-fluid {
    padding: 0 !important;
  }
  .table th { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; }
}
</style>
