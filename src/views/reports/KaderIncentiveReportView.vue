<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="bi bi-cash-stack me-2"></i>Laporan Insentif Kader PIC Sekolah
        </h5>
        <div class="d-flex gap-2 align-items-center">
          <label class="small text-muted me-2">Rate/Distribusi:</label>
          <input type="number" class="form-control form-control-sm w-auto" v-model="filters.rate" @change="fetchReport">
          <button class="btn btn-outline-danger btn-sm" @click="printReport">
            <i class="bi bi-printer"></i>
          </button>
        </div>
      </div>
      <div class="card-body border-bottom bg-light bg-opacity-50">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">Periode Mulai</label>
            <input type="date" class="form-control" v-model="filters.start_date" @change="fetchReport">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">Periode Selesai</label>
            <input type="date" class="form-control" v-model="filters.end_date" @change="fetchReport">
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase small fw-bold text-muted">
              <tr>
                <th class="ps-4">Nama Kader</th>
                <th>Sekolah / Lembaga</th>
                <th class="text-center">Jml Distribusi</th>
                <th class="text-end">Rate Insentif</th>
                <th class="text-end pe-4">Total Insentif</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id_kader">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ item.nama_kader }}</div>
                  <small class="text-muted">{{ item.rekening }}</small>
                </td>
                <td>{{ item.sekolah }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3">
                    {{ item.jumlah_distribusi }} kali
                  </span>
                </td>
                <td class="text-end text-muted">{{ formatCurrency(item.rate) }}</td>
                <td class="text-end pe-4 fw-bold text-primary">
                  {{ formatCurrency(item.total_insentif) }}
                </td>
              </tr>
              <tr v-if="reportData.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">Tidak ada data untuk periode ini.</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold" v-if="reportData.length > 0">
               <tr>
                 <td colspan="4" class="text-end pe-4">TOTAL KESELURUHAN</td>
                 <td class="text-end pe-4 text-primary fs-5">{{ formatCurrency(totalOverall) }}</td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const reportData = ref([])
const filters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  rate: 5000
})

const fetchReport = async () => {
  try {
    const res = await api.get('/reports/kader-incentive', { params: filters.value })
    reportData.value = res.data.data.report
  } catch (error) {
    console.error('Failed to fetch report:', error)
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
