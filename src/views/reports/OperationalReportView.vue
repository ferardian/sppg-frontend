<template>
  <div class="container-fluid py-4">
    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card shadow-sm border-0 bg-primary text-white h-100">
          <div class="card-body">
            <h6 class="text-white-50 small text-uppercase fw-bold">Total Porsi Terdistribusi</h6>
            <h2 class="mb-0 fw-bold">{{ summary.total_porsi }}</h2>
            <small class="text-white-50">Dari {{ summary.total_distribusi_event }} kali pengiriman</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm border-0 bg-danger text-white h-100">
          <div class="card-body">
            <h6 class="text-white-50 small text-uppercase fw-bold">Total Sisa Makanan</h6>
            <h2 class="mb-0 fw-bold">{{ summary.total_waste_porsi }}</h2>
            <small class="text-white-50">Porsi tidak terkonsumsi</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm border-0 bg-success text-white h-100">
          <div class="card-body">
            <h6 class="text-white-50 small text-uppercase fw-bold">Efisiensi Produksi</h6>
            <h2 class="mb-0 fw-bold">{{ summary.efficiency_rate }}%</h2>
            <small class="text-white-50">Target efisiensi > 95%</small>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-header bg-white py-3">
        <div class="row align-items-center">
          <div class="col-md-4">
            <h5 class="mb-0 fw-bold text-primary">Log Operasional Produksi</h5>
          </div>
          <div class="col-md-8 text-md-end d-flex justify-content-end gap-2">
            <input type="date" class="form-control form-control-sm w-auto" v-model="filters.start_date" @change="fetchReport">
            <span class="align-self-center text-muted">-</span>
            <input type="date" class="form-control form-control-sm w-auto" v-model="filters.end_date" @change="fetchReport">
            <button class="btn btn-outline-danger btn-sm" @click="printReport">
              <i class="bi bi-printer me-1"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Menu</th>
                <th class="text-center">Jml Porsi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in details.distributions" :key="d.id_distribusi">
                <td>{{ formatDate(d.tanggal_distribusi) }}</td>
                <td><span class="badge bg-info text-dark text-uppercase small">{{ d.waktu_makan }}</span></td>
                <td>{{ d.menu?.nama_menu }}</td>
                <td class="text-center fw-bold">{{ d.jumlah_porsi }}</td>
                <td>
                   <span :class="['badge', d.status_distribusi === 'selesai' ? 'bg-success' : 'bg-warning']">
                    {{ d.status_distribusi }}
                   </span>
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
