<template>
  <div class="py-2">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1 text-dark fw-bold">Dashboard Overview</h2>
        <p class="text-muted mb-0">Selamat datang kembali, <span class="text-primary fw-semibold">{{ authStore.userName }}</span>!</p>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row g-4 mb-4">
      <div v-for="(stat, index) in quickStats" :key="index" class="col-xl-3 col-md-6">
        <div class="card h-100 border-0 shadow-sm plumpy-card overflow-hidden">
          <div class="card-body p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div :class="`stat-icon bg-${stat.color} bg-opacity-10 text-${stat.color}`">
                <i :class="`bi ${stat.icon} fs-4`"></i>
              </div>
              <div v-if="stat.trend" :class="`small fw-bold text-${stat.trendColor}`">
                <i :class="`bi ${stat.trendIcon}`"></i> {{ stat.trend }}
              </div>
            </div>
            <div class="text-muted small fw-bold text-uppercase mb-1">{{ stat.label }}</div>
            <h3 class="mb-0 fw-bold text-dark">{{ formatNumber(stat.value) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Main Chart Area -->
      <div class="col-xl-8">
        <div class="card border-0 shadow-sm plumpy-card h-100">
          <div class="card-header bg-white py-4 px-4 border-0 d-flex align-items-center justify-content-between">
            <div>
              <h5 class="mb-0 fw-bold text-dark">Statistik Distribusi Bulanan</h5>
              <p class="text-muted small mb-0 mt-1">Tren pengiriman makanan tahun {{ new Date().getFullYear() }}</p>
            </div>
            <button class="btn btn-light btn-sm rounded-pill px-3 border-0" @click="fetchDashboardData">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div class="card-body px-4 pb-4">
            <div class="chart-container" style="position: relative; height: 320px; width: 100%;">
              <Bar
                v-if="chartData && chartData.labels"
                :data="chartData"
                :options="chartOptions"
              />
              <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                <div class="spinner-border spinner-border-sm text-primary mb-3" role="status"></div>
                <p class="small">Menyiapkan grafik distribusi...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="col-xl-4">
        <div class="card border-0 shadow-sm plumpy-card h-100">
          <div class="card-header bg-white py-4 px-4 border-0">
            <h5 class="mb-0 fw-bold text-dark">Aktivitas Terkini</h5>
          </div>
          <div class="card-body px-4 pt-0">
            <div v-if="activities.length === 0" class="text-center py-5">
              <i class="bi bi-journal-text fs-1 text-muted opacity-25"></i>
              <p class="text-muted small mt-2">Belum ada aktivitas tercatat</p>
            </div>
            <div v-else class="timeline">
              <div v-for="(activity, idx) in activities" :key="idx" class="timeline-item pb-4 position-relative">
                <div class="d-flex align-items-start gap-3">
                  <div :class="`activity-indicator shadow-sm bg-white text-primary`" style="z-index: 1;">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="flex-grow-1" style="min-width: 0;">
                    <p class="mb-0 text-dark fw-bold small line-clamp-2">{{ activity.title }}</p>
                    <small class="text-muted d-block mt-1">{{ activity.time }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Distributions Table -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm plumpy-card overflow-hidden">
          <div class="card-header bg-white py-4 px-4 border-0 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0 fw-bold text-dark">Distribusi Terkini</h5>
              <p class="text-muted small mb-0 mt-1">Daftar 10 transaksi pengiriman terakhir</p>
            </div>
            <router-link to="/transactions/distribusi-makanan" class="btn btn-outline-primary rounded-pill btn-sm px-4">
              Semua Data
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="recentDistributions.length === 0" class="text-center py-5">
              <p class="text-muted mb-0 small">Menunggu data distribusi...</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light border-bottom-0">
                  <tr>
                    <th class="ps-4 py-3 border-0 small text-uppercase fw-bold text-muted">ID</th>
                    <th class="py-3 border-0 small text-uppercase fw-bold text-muted">Tanggal</th>
                    <th class="py-3 border-0 small text-uppercase fw-bold text-muted">Penerima</th>
                    <th class="py-3 border-0 small text-uppercase fw-bold text-muted">Menu</th>
                    <th class="py-3 border-0 small text-uppercase fw-bold text-muted">Jumlah</th>
                    <th class="py-3 border-0 small text-uppercase fw-bold text-muted">Status</th>
                    <th class="pe-4 py-3 border-0 text-end small text-uppercase fw-bold text-muted">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in recentDistributions" :key="item.id">
                    <td class="ps-4 py-3 small fw-bold text-primary">#{{ item.id }}</td>
                    <td class="py-3 small text-dark">{{ formatDate(item.tanggal) }}</td>
                    <td class="py-3 small fw-semibold text-dark">
                      <div v-if="Array.isArray(item.penerima) && item.penerima.length > 0">
                        <ul class="list-unstyled mb-0 recipient-list">
                          <li v-for="(name, idx) in item.penerima" :key="idx" class="d-flex align-items-center mb-1">
                            <span class="bullet-dot me-2"></span>
                            {{ name }}
                          </li>
                        </ul>
                      </div>
                      <div v-else-if="typeof item.penerima === 'string'">
                        {{ item.penerima }}
                      </div>
                      <span v-else class="text-muted">No recipients</span>
                    </td>
                    <td class="py-3 small text-muted">
                      <div v-if="item.menu && item.menu.includes(',')">
                        <ul class="list-unstyled mb-0 recipient-list">
                          <li v-for="(m, idx) in item.menu.split(',')" :key="idx" class="d-flex align-items-center mb-1">
                            <span class="bullet-dot bg-secondary me-2" style="width: 4px; height: 4px; opacity: 0.4;"></span>
                            {{ m.trim() }}
                          </li>
                        </ul>
                      </div>
                      <div v-else>
                        {{ item.menu }}
                      </div>
                    </td>
                    <td class="py-3 small fw-bold text-dark">{{ item.jumlah }} Porsi</td>
                    <td class="py-3 small">
                      <span :class="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="pe-4 py-3 text-end">
                      <button class="btn btn-light btn-sm rounded-circle shadow-sm border-0" @click="viewDetail(item)">
                        <i class="bi bi-eye text-primary"></i>
                      </button>
                    </td>
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import dashboardService from '@/services/dashboardService'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'DashboardView',
  components: {
    Bar
  },
  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const stats = ref({
      totalPenerima: 0,
      totalMenu: 0,
      stokTersedia: 0,
      distribusiHariIni: 0
    })

    const activities = ref([])
    const recentDistributions = ref([])
    const chartData = ref(null)
    
    const quickStats = computed(() => [
      { label: 'Penerima Manfaat', value: stats.value.totalPenerima, icon: 'bi-people', color: 'primary' },
      { label: 'Total Menu', value: stats.value.totalMenu, icon: 'bi-menu-app', color: 'success' },
      { label: 'Stok Bahan Baku', value: stats.value.stokTersedia, icon: 'bi-basket', color: 'info' },
      { label: 'Kirim Hari Ini', value: stats.value.distribusiHariIni, icon: 'bi-truck', color: 'warning' }
    ])

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { display: true, drawBorder: false, color: '#f0f0f0' }, ticks: { stepSize: 1, color: '#999' } },
        x: { grid: { display: false }, ticks: { color: '#999' } }
      }
    }

    const updateTime = () => {
      // Logic removed - now in LayoutView
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    }

    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num || 0)

    const getStatusBadgeClass = (status) => {
      const s = status?.toLowerCase() || ''
      if (s.includes('selesai') || s.includes('complete')) return 'badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2'
      if (s.includes('proses') || s.includes('progress')) return 'badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2'
      return 'badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2'
    }

    const viewDetail = (item) => console.log('View detail:', item)
    
    const fetchDashboardData = async () => {
      loading.value = true
      try {
        const [statsRes, activitiesRes, distributionsRes, monthlyRes] = await Promise.allSettled([
          dashboardService.getStatistics(),
          dashboardService.getRecentActivities(),
          dashboardService.getRecentDistributions(),
          dashboardService.getMonthlyDistribution()
        ])
        
        if (statsRes.status === 'fulfilled') {
            const data = statsRes.value.data.data
            stats.value = {
                totalPenerima: data.total_penerima || 0,
                totalMenu: data.total_menu || 0,
                stokTersedia: data.stok_tersedia || 0,
                distribusiHariIni: data.distribusi_hari_ini || 0
            }
        }

        if (activitiesRes.status === 'fulfilled') {
            activities.value = activitiesRes.value.data.data
        }

        if (distributionsRes.status === 'fulfilled') {
            recentDistributions.value = distributionsRes.value.data.data
        }
        
        if (monthlyRes.status === 'fulfilled') {
            const apiData = monthlyRes.value.data.data
            chartData.value = {
              labels: apiData.labels,
              datasets: apiData.datasets.map(ds => ({
                 ...ds,
                 backgroundColor: '#0d6efd',
                 borderRadius: 20,
                 barThickness: 20
              }))
            }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      authStore, stats, quickStats, activities, recentDistributions,
      formatDate, formatNumber, getStatusBadgeClass, viewDetail, loading, chartData, chartOptions, fetchDashboardData
    }
  }
}
</script>

<style scoped>
.plumpy-card { border-radius: 1.25rem; }

.stat-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.timeline {
  position: relative;
  margin-top: 10px;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  left: 17px;
  height: 100%;
  width: 2px;
  background-color: #f0f0f0;
}

.activity-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
}

.timeline-item:last-child {
  padding-bottom: 0 !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

.recipient-list {
  max-width: 600px;
  column-count: 2;
  column-gap: 1.5rem;
}

.recipient-list li {
  break-inside: avoid-column;
}

.bullet-dot {
  width: 6px;
  height: 6px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  opacity: 0.6;
}

.table th {
  background-color: transparent !important;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.table tr:hover {
  background-color: rgba(13, 110, 253, 0.02);
}
</style>