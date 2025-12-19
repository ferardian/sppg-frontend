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
            <div class="text-center py-4">
              <i class="bi bi-graph-up text-muted" style="font-size: 3rem;"></i>
              <h5 class="mt-3 text-muted">Grafik Distribusi Bulanan</h5>
              <p class="text-muted">Total distribusi bulan ini: 5.200 porsi</p>
              <div class="row mt-4">
                <div class="col-md-4">
                  <div class="small text-muted">Jan - Mar</div>
                  <div class="h5">3.200</div>
                </div>
                <div class="col-md-4">
                  <div class="small text-muted">Apr - Jun</div>
                  <div class="h5">4.000</div>
                </div>
                <div class="col-md-4">
                  <div class="small text-muted">Jul - Sep</div>
                  <div class="h5 text-success">5.200</div>
                </div>
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

export default {
  name: 'DashboardView',
  setup() {
    const authStore = useAuthStore()
    const currentTime = ref('')

    // Dashboard statistics - using dummy data
    const stats = ref({
      totalPenerima: 245,
      totalMenu: 12,
      stokTersedia: 856,
      stokPercentage: 85,
      distribusiHariIni: 156
    })

    // Recent activities - dummy data
    const activities = ref([
      {
        id: 1,
        title: 'Distribusi Makanan',
        description: '150 porsi makanan didistribusikan',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        icon: 'bi bi-box-seam'
      },
      {
        id: 2,
        title: 'Stok Bahan Baku',
        description: '10 kg beras ditambahkan',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        icon: 'bi bi-basket'
      },
      {
        id: 3,
        title: 'Penerima Manfaat Baru',
        description: '5 penerima manfaat baru didaftarkan',
        time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        icon: 'bi bi-person-check'
      },
      {
        id: 4,
        title: 'Update Menu',
        description: 'Menu makan siang diperbarui',
        time: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        icon: 'bi bi-menu-app'
      }
    ])

    // Recent distributions - dummy data
    const recentDistributions = ref([
      {
        id: 1001,
        tanggal: '2024-01-15',
        penerima: 'Ahmad Wijaya',
        menu: 'Nasi Goreng + Ayam',
        jumlah: 1,
        status: 'completed'
      },
      {
        id: 1002,
        tanggal: '2024-01-15',
        penerima: 'Siti Nurhaliza',
        menu: 'Mie Ayam',
        jumlah: 1,
        status: 'completed'
      },
      {
        id: 1003,
        tanggal: '2024-01-15',
        penerima: 'Budi Santoso',
        menu: 'Nasi Padang',
        jumlah: 2,
        status: 'in_progress'
      },
      {
        id: 1004,
        tanggal: '2024-01-14',
        penerima: 'Dewi Lestari',
        menu: 'Soto Ayam',
        jumlah: 1,
        status: 'completed'
      }
    ])

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    const formatTime = (date) => {
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

    const getStatusBadgeClass = (status) => {
      const statusClasses = {
        completed: 'badge bg-success',
        in_progress: 'badge bg-warning',
        pending: 'badge bg-secondary',
        cancelled: 'badge bg-danger'
      }
      return statusClasses[status] || 'badge bg-secondary'
    }

    const viewDetail = (item) => {
      console.log('View detail for:', item)
      // TODO: Implement detail view modal
    }

    onMounted(() => {
      console.log('🏠 Dashboard component mounted!')
      updateTime()
      setInterval(updateTime, 1000)
    })

    
    return {
      authStore,
      currentTime,
      stats,
      activities,
      recentDistributions,
      formatDate,
      formatTime,
      getStatusBadgeClass,
      viewDetail
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