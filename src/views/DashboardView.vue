<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-0">Dashboard</h2>
        <p class="text-muted mb-0">Selamat datang, {{ authStore.userName }}!</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="badge bg-primary fs-6">
          <i class="bi bi-clock me-1"></i>
          {{ currentTime }}
        </span>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Total Penerima Manfaat
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.totalPenerima }}
                </div>
              </div>
              <div class="col-auto">
                <i class="bi bi-people fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-success shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Total Menu
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.totalMenu }}
                </div>
              </div>
              <div class="col-auto">
                <i class="bi bi-menu-app fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-info shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Stok Tersedia
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.stokTersedia }}
                </div>
                <div class="small text-muted">Items</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-basket fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-warning shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Distribusi Hari Ini
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.distribusiHariIni }}
                </div>
                <div class="small text-muted">Porsi</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-box-seam fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Charts -->
    <div class="row mb-4">
      <div class="col-xl-8 col-lg-7">
        <div class="card shadow mb-4">
          <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">Statistik Distribusi</h6>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Export Data</a></li>
                <li><a class="dropdown-item" href="#">Refresh</a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
              <Bar
                v-if="chartData && chartData.labels"
                :data="chartData"
                :options="chartOptions"
              />
              <div v-else class="text-center py-5">
                 <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                 </div>
                 <p class="text-muted mt-2">Memuat data grafik...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="col-xl-4 col-lg-5">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Aktivitas Terkini</h6>
          </div>
          <div class="card-body">
            <div v-if="activities.length === 0" class="text-center py-3">
              <p class="text-muted mb-0">Belum ada aktivitas</p>
            </div>
            <div v-else>
              <div v-for="activity in activities" :key="activity.id" class="activity-item d-flex align-items-start mb-3">
                <div class="activity-icon me-3">
                  <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                    <i :class="activity.icon" class="text-primary"></i>
                  </div>
                </div>
                <div class="activity-content flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <p class="mb-1 fw-semibold">{{ activity.title }}</p>
                      <p class="text-muted small mb-1">{{ activity.description }}</p>
                    </div>
                    <small class="text-muted">{{ formatTime(activity.time) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Distributions -->
    <div class="row">
      <div class="col-12">
        <div class="card shadow mb-4">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Distribusi Terkini</h6>
            <router-link to="/transactions/distribusi-makanan" class="btn btn-sm btn-outline-primary">
              Lihat Semua
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="recentDistributions.length === 0" class="text-center py-3">
              <p class="text-muted mb-0">Belum ada data distribusi terkini</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanggal</th>
                    <th>Penerima</th>
                    <th>Menu</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in recentDistributions" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>{{ formatDate(item.tanggal) }}</td>
                    <td>{{ item.penerima }}</td>
                    <td>{{ item.menu }}</td>
                    <td>{{ item.jumlah }}</td>
                    <td>
                      <span :class="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-primary" @click="viewDetail(item)">
                        <i class="bi bi-eye"></i>
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
import { ref, onMounted } from 'vue'
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
    const currentTime = ref('')
    const loading = ref(false)
    const error = ref(null)

    // Dashboard statistics
    const stats = ref({
      totalPenerima: 0,
      totalMenu: 0,
      stokTersedia: 0,
      stokPercentage: 0, // Not available from API directly, might need calculation or removal
      distribusiHariIni: 0
    })

    const activities = ref([])
    const recentDistributions = ref([])
    const chartData = ref(null)
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
           display: false
        }
      },
      scales: {
        y: {
           beginAtZero: true,
           ticks: {
              stepSize: 1
           }
        }
      }
    }

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    const formatTime = (dateInput) => {
      if (!dateInput) return '-'
      const date = new Date(dateInput)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return 'Baru saja'
      if (minutes < 60) return `${minutes} menit lalu`
      if (hours < 24) return `${hours} jam lalu`
      return `${days} hari lalu`
    }
    
    // Helper for number formatting
    const formatNumber = (num) => {
       return new Intl.NumberFormat('id-ID').format(num || 0)
    }

    const getStatusBadgeClass = (status) => {
      const statusClasses = {
        completed: 'badge bg-success',
        selesai: 'badge bg-success',
        in_progress: 'badge bg-warning',
        proses: 'badge bg-warning',
        pending: 'badge bg-secondary',
        menunggu: 'badge bg-secondary',
        cancelled: 'badge bg-danger',
        dibatalkan: 'badge bg-danger'
      }
      return statusClasses[status?.toLowerCase()] || 'badge bg-secondary'
    }

    const viewDetail = (item) => {
      console.log('View detail for:', item)
    }
    
    const fetchDashboardData = async () => {
      loading.value = true
      error.value = null
      try {
        console.log('Fetching dashboard data...')
        
        // Parallel requests for better performance
        const [statsRes, activitiesRes, distributionsRes, monthlyRes] = await Promise.allSettled([
          dashboardService.getStatistics(),
          dashboardService.getRecentActivities(),
          dashboardService.getRecentDistributions(),
          dashboardService.getMonthlyDistribution()
        ])
        
        // Handle Statistics
        if (statsRes.status === 'fulfilled') {
            const data = statsRes.value.data.data
            stats.value = {
                totalPenerima: data.total_penerima || 0,
                totalMenu: data.total_menu || 0,
                stokTersedia: data.stok_tersedia || 0,
                distribusiHariIni: data.distribusi_hari_ini || 0,
                stokPercentage: 0 // Placeholder
            }
        } else {
             console.error('Failed to load stats:', statsRes.reason)
        }

        // Handle Activities
        if (activitiesRes.status === 'fulfilled') {
            activities.value = activitiesRes.value.data.data.map(act => ({
                id: act.id,
                title: act.title || 'Aktivitas',
                description: act.description || '',
                time: act.created_at || new Date(),
                icon: act.icon || 'bi bi-circle'
            }))
        }

        if (distributionsRes.status === 'fulfilled') {
            recentDistributions.value = distributionsRes.value.data.data.map(dist => ({
                id: dist.id,
                tanggal: dist.tanggal,
                penerima: dist.penerima || 'Unknown',
                menu: dist.menu || 'Unknown',
                jumlah: dist.jumlah,
                status: dist.status
            }))
        }
        
        // Handle Monthly Distribution (Chart)
        if (monthlyRes.status === 'fulfilled') {
            const apiData = monthlyRes.value.data.data
            chartData.value = {
              labels: apiData.labels,
              datasets: apiData.datasets.map(ds => ({
                 ...ds,
                 backgroundColor: '#667eea', // Use primary purple color
                 borderRadius: 4
              }))
            }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        error.value = 'Gagal memuat data dashboard'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      console.log('🏠 Dashboard component mounted!')
      updateTime()
      setInterval(updateTime, 1000)
      fetchDashboardData()
    })

    return {
      authStore,
      currentTime,
      stats,
      activities,
      recentDistributions,
      formatDate,
      formatTime,
      formatNumber,
      getStatusBadgeClass,
      viewDetail,
      loading,
      error,
      chartData,
      chartOptions
    }
  }
}
</script>

<style scoped>
.border-left-primary {
  border-left: 4px solid #4e73df !important;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.05) 0%, rgba(78, 115, 223, 0.1) 100%);
}

.border-left-success {
  border-left: 4px solid #1cc88a !important;
  background: linear-gradient(135deg, rgba(28, 200, 138, 0.05) 0%, rgba(28, 200, 138, 0.1) 100%);
}

.border-left-info {
  border-left: 4px solid #36b9cc !important;
  background: linear-gradient(135deg, rgba(54, 185, 204, 0.05) 0%, rgba(54, 185, 204, 0.1) 100%);
}

.border-left-warning {
  border-left: 4px solid #f6c23e !important;
  background: linear-gradient(135deg, rgba(246, 194, 62, 0.05) 0%, rgba(246, 194, 62, 0.1) 100%);
}

.activity-item {
  transition: all 0.3s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  flex-shrink: 0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

</style>