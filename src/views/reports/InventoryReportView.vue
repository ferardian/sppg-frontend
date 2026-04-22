<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0 fw-bold text-primary">
              <i class="bi bi-box-seam me-2"></i>Laporan Pergerakan Bahan Baku
            </h5>
          </div>
          <div class="col-md-6 text-md-end">
            <button class="btn btn-outline-success btn-sm me-2" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-1"></i> Excel
            </button>
            <button class="btn btn-outline-danger btn-sm" @click="printReport">
              <i class="bi bi-printer me-1"></i> Cetak
            </button>
          </div>
        </div>
      </div>
      <div class="card-body border-bottom bg-light bg-opacity-50">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Tanggal Mulai</label>
            <input type="date" class="form-control" v-model="filters.start_date" @change="fetchReport">
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Tanggal Selesai</label>
            <input type="date" class="form-control" v-model="filters.end_date" @change="fetchReport">
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Bahan Baku</th>
                <th class="text-center">Masuk (+)</th>
                <th class="text-center">Keluar (-)</th>
                <th class="text-center">Penyesuaian</th>
                <th class="text-end">Stok Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData" :key="item.id_bahan_baku">
                <td>
                  <div class="fw-bold">{{ item.nama_bahan }}</div>
                  <small class="text-muted">{{ item.kode_bahan }}</small>
                </td>
                <td class="text-center">
                  <span class="text-success fw-bold" v-if="item.total_masuk > 0">+{{ item.total_masuk }}</span>
                  <span class="text-muted" v-else>0</span>
                </td>
                <td class="text-center">
                  <span class="text-danger fw-bold" v-if="item.total_keluar > 0">-{{ item.total_keluar }}</span>
                  <span class="text-muted" v-else>0</span>
                </td>
                <td class="text-center">
                  <span class="text-warning" v-if="item.total_penyesuaian != 0">{{ item.total_penyesuaian }}</span>
                  <span class="text-muted" v-else>0</span>
                </td>
                <td class="text-end fw-bold text-primary">
                  {{ item.stok_saat_ini }}
                </td>
              </tr>
              <tr v-if="reportData.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data untuk periode ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const reportData = ref([])
const filters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
})

const fetchReport = async () => {
  try {
    const res = await api.get('/reports/inventory', { params: filters.value })
    reportData.value = res.data.data.items
  } catch (error) {
    console.error('Failed to fetch report:', error)
  }
}

const exportExcel = () => {
  alert('Fitur ekspor Excel sedang disiapkan')
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  fetchReport()
})
</script>

<style scoped>
@media print {
  .btn, .form-label, input, .card-header button {
    display: none !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
  }
  .container-fluid {
    padding: 0 !important;
  }
}
</style>
