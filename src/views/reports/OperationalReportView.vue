<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-0 text-dark">
          <i class="bi bi-activity text-primary me-2"></i>
          Laporan Operasional
        </h3>
        <p class="text-muted mb-0 mt-1">Pantau performa distribusi dan efisiensi produksi</p>
      </div>
      <div class="d-flex gap-2">
        <div class="input-group input-group-sm shadow-sm bg-white rounded-pill px-2 align-items-center" style="width: auto;">
          <input type="date" class="form-control border-0 bg-transparent py-1" v-model="filters.start_date" @change="fetchReport">
          <span class="text-muted mx-1">-</span>
          <input type="date" class="form-control border-0 bg-transparent py-1" v-model="filters.end_date" @change="fetchReport">
        </div>
        <button class="btn btn-primary rounded-pill px-4 shadow" @click="printReport">
          <i class="bi bi-printer me-2"></i> Cetak
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100 plumpy-card overflow-hidden">
          <div class="card-body p-4 position-relative">
            <div class="position-absolute top-0 end-0 p-3 opacity-10">
              <i class="bi bi-send-check fs-1"></i>
            </div>
            <h6 class="text-muted small text-uppercase fw-bold mb-3">Porsi Terdistribusi</h6>
            <div class="d-flex align-items-baseline">
              <h2 class="mb-0 fw-bold text-dark me-2">{{ summary.total_porsi }}</h2>
              <span class="text-muted small">Porsi</span>
            </div>
            <p class="text-primary small mt-3 mb-0 fw-semibold">
              <i class="bi bi-truck me-1"></i> {{ summary.total_distribusi_event }} kali pengiriman
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100 plumpy-card overflow-hidden">
          <div class="card-body p-4 position-relative">
            <div class="position-absolute top-0 end-0 p-3 opacity-10">
              <i class="bi bi-trash3 fs-1 text-danger"></i>
            </div>
            <h6 class="text-muted small text-uppercase fw-bold mb-3">Total Sisa Makanan</h6>
            <div class="d-flex align-items-baseline">
              <h2 class="mb-0 fw-bold text-dark me-2">{{ summary.total_waste_porsi }}</h2>
              <span class="text-muted small">Porsi</span>
            </div>
            <p class="text-danger small mt-3 mb-0 fw-semibold">
              <i class="bi bi-exclamation-circle me-1"></i> Makanan tidak terkonsumsi
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100 plumpy-card overflow-hidden">
          <div class="card-body p-4 position-relative">
            <div class="position-absolute top-0 end-0 p-3 opacity-10">
              <i class="bi bi-graph-up-arrow fs-1 text-success"></i>
            </div>
            <h6 class="text-muted small text-uppercase fw-bold mb-3">Efisiensi Produksi</h6>
            <div class="d-flex align-items-baseline">
              <h2 class="mb-0 fw-bold text-dark me-2">{{ summary.efficiency_rate }}%</h2>
              <span class="text-muted small">Rate</span>
            </div>
            <div class="mt-3">
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success rounded-pill" :style="{ width: summary.efficiency_rate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card shadow-sm border-0 plumpy-card overflow-hidden">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-primary">Log Operasional Produksi</h5>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 rounded-pill">
          {{ details.distributions.length }} Baris Data
        </span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4 border-0 py-3">Tanggal & Waktu</th>
                <th class="border-0 py-3">Menu</th>
                <th class="text-center border-0 py-3">Jml Porsi</th>
                <th class="text-center border-0 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in details.distributions" :key="d.id_distribusi">
                <td class="ps-4 py-3">
                  <div class="fw-bold text-dark">{{ formatDate(d.tanggal_distribusi) }}</div>
                  <small class="badge bg-info bg-opacity-10 text-info text-uppercase">{{ d.waktu_makan }}</small>
                </td>
                <td class="py-3">
                  <div class="fw-semibold">{{ d.menu?.nama_menu }}</div>
                </td>
                <td class="text-center py-3 fw-bold">{{ d.jumlah_porsi }}</td>
                <td class="text-center py-3">
                   <span :class="['badge rounded-pill px-3 py-2', d.status_distribusi === 'selesai' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning']">
                    {{ d.status_distribusi }}
                   </span>
                </td>
              </tr>
              <tr v-if="details.distributions.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
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

const summary = ref({})
const details = ref({ distributions: [], waste_logs: [] })
const filters = ref({
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
})

const fetchReport = async () => {
  try {
    const res = await api.get('/reports/operational', { params: filters.value })
    summary.value = res.data.data.summary
    details.value = res.data.data.details
  } catch (error) {
    console.error('Failed to fetch report:', error)
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const printReport = () => window.print()

onMounted(fetchReport)
</script>
