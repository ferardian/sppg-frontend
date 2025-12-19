<template>
  <div class="app-container">
    <!-- Sidebar -->
    <nav class="sidebar d-none d-lg-block">
      <div class="sidebar-header p-4">
        <h4 class="text-white mb-0">
          <i class="bi bi-egg-fried me-2"></i>
          SPPG
        </h4>
      </div>

      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="bi bi-speedometer2 me-2"></i>
            Dashboard
          </router-link>
        </li>

        <!-- Master Data -->
        <li class="nav-item mt-3">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Data Master
          </h6>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/sppg" class="nav-link" active-class="active">
            <i class="bi bi-building me-2"></i>
            SPPG
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/pegawai" class="nav-link" active-class="active">
            <i class="bi bi-people me-2"></i>
            Pegawai
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/bahan-baku" class="nav-link" active-class="active">
            <i class="bi bi-basket me-2"></i>
            Bahan Baku
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/menu" class="nav-link" active-class="active">
            <i class="bi bi-menu-app me-2"></i>
            Menu
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/supplier" class="nav-link" active-class="active">
            <i class="bi bi-truck me-2"></i>
            Supplier
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/user-management" class="nav-link" active-class="active">
            <i class="bi bi-people-fill me-2"></i>
            Manajemen User
          </router-link>
        </li>

        <!-- Transactions -->
        <li class="nav-item mt-3">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Transaksi
          </h6>
        </li>
        <li class="nav-item">
          <router-link to="/transactions/penerima-manfaat" class="nav-link" active-class="active">
            <i class="bi bi-person-check me-2"></i>
            Penerima Manfaat
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/transactions/stok-opname" class="nav-link" active-class="active">
            <i class="bi bi-clipboard-check me-2"></i>
            Stok Opname
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/transactions/distribusi-makanan" class="nav-link" active-class="active">
            <i class="bi bi-box-seam me-2"></i>
            Distribusi Makanan
          </router-link>
        </li>

        <!-- Menu Management -->
        <li class="nav-item mt-3">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Manajemen Menu
          </h6>
        </li>
        <li class="nav-item">
          <router-link to="/management/recipe-management" class="nav-link" active-class="active">
            <i class="bi bi-journal-text me-2"></i>
            Resep & Kalkulator
            <span class="badge bg-success ms-2" style="font-size: 0.6em;">NEW</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
        <div class="container-fluid">
          <!-- Mobile Menu Button -->
          <button
            class="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Breadcrumb -->
          <div class="d-none d-md-block">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0 custom-breadcrumb">
                <li class="breadcrumb-item">
                  <router-link to="/dashboard" class="breadcrumb-link">
                    <i class="bi bi-house-door me-1"></i>
                    <span>Home</span>
                  </router-link>
                </li>
                <li class="breadcrumb-item active">
                  <span class="breadcrumb-current">{{ getCurrentPageTitle() }}</span>
                </li>
              </ol>
            </nav>
          </div>

          <!-- User Menu -->
          <div class="navbar-nav ms-auto">
            <div class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                  <small class="fw-bold">{{ getUserInitials() }}</small>
                </div>
                <span class="d-none d-md-block">{{ authStore.userName }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="bi bi-person me-2"></i>
                    Profil
                  </router-link>
                </li>
                <li>
                  <router-link to="/settings" class="dropdown-item">
                    <i class="bi bi-gear me-2"></i>
                    Pengaturan
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="container-fluid p-0">
        <div class="p-4">
          <router-view />
        </div>
      </div>
    </main>

    <!-- Mobile Sidebar -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileSidebar">
      <div class="offcanvas-header bg-primary text-white">
        <h5 class="offcanvas-title">
          <i class="bi bi-egg-fried me-2"></i>
          SPPG
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-speedometer2 me-2"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item mt-3">
            <h6 class="nav-section-title px-3 text-uppercase small text-muted">
              Data Master
            </h6>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/sppg" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-building me-2"></i>
              SPPG
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/pegawai" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-people me-2"></i>
              Pegawai
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/bahan-baku" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-basket me-2"></i>
              Bahan Baku
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/menu" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-menu-app me-2"></i>
              Menu
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/supplier" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-truck me-2"></i>
              Supplier
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/user-management" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-people-fill me-2"></i>
              Manajemen User
            </router-link>
          </li>
          <li class="nav-item mt-3">
            <h6 class="nav-section-title px-3 text-uppercase small text-muted">
              Transaksi
            </h6>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/penerima-manfaat" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-person-check me-2"></i>
              Penerima Manfaat
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/stok-opname" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-clipboard-check me-2"></i>
              Stok Opname
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/distribusi-makanan" class="nav-link" active-class="active" data-bs-dismiss="offcanvas">
              <i class="bi bi-box-seam me-2"></i>
              Distribusi Makanan
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'LayoutView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const getUserInitials = () => {
      const name = authStore.userName || 'User'
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getCurrentPageTitle = () => {
      const routeName = route.name
      const titles = {
        'Dashboard': 'Dashboard',
        'SPPG': 'Data SPPG',
        'Pegawai': 'Data Pegawai',
        'BahanBaku': 'Data Bahan Baku',
        'Menu': 'Data Menu',
        'PenerimaManfaat': 'Penerima Manfaat',
        'Supplier': 'Data Supplier',
        'UserManagement': 'Manajemen User',
        'StokOpname': 'Stok Opname',
        'DistribusiMakanan': 'Distribusi Makanan'
      }
      return titles[routeName] || 'Dashboard'
    }

    const handleLogout = async () => {
      if (confirm('Apakah Anda yakin ingin logout?')) {
        await authService.logout()
        authStore.clearAuth()
        router.push('/login')
      }
    }

    return {
      authStore,
      getUserInitials,
      getCurrentPageTitle,
      handleLogout
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  overflow-y: auto;
  margin: 0;
  padding: 0;
}

.sidebar-header h4 {
  font-weight: 700;
}

.nav-section-title {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1.5rem;
  margin: 0.1rem 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
}

.main-content {
  position: fixed;
  top: 0;
  left: 250px;
  width: calc(100vw - 250px);
  padding: 0;
  background-color: #f8f9fa;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin: 0;
}

@media (max-width: 991px) {
  .main-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    margin: 0;
  }

  .sidebar {
    transform: translateX(-100%);
  }
}

.breadcrumb-item.active {
  color: #6c757d;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dropdown-menu {
  min-width: 10rem;
}

.offcanvas-body .nav-link {
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0.2rem 0;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.offcanvas-body .nav-link:hover,
.offcanvas-body .nav-link.active {
  background: #f8f9fa;
  color: #0d6efd;
  text-decoration: none;
}

.nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

/* Ensure full width layout */
.container-fluid {
  padding: 0 !important;
  width: 100%;
  max-width: none;
  margin: 0 !important;
}

/* Override global reset for page content */
.main-content .container-fluid {
  padding: 0 !important;
  margin: 0 !important;
}

/* Fix navbar width */
.navbar {
  width: 100%;
  margin: 0;
  padding: 0;
}

.navbar .container-fluid {
  padding: 0.5rem 1rem;
  margin: 0;
  width: 100%;
}

/* Remove padding from row elements */
.row {
  margin: 0;
}

/* Remove all padding from cards container */
.main-content .row > * {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* Full width dashboard cards */
.dashboard-card {
  margin: 0 0 1rem 0;
}

/* Remove any default margins */
.card {
  margin-bottom: 1rem;
}

/* Custom Breadcrumb Styles */
.custom-breadcrumb {
  font-size: 0.875rem;
  display: inline-block;
}

.breadcrumb-link {
  color: #667eea !important;
  text-decoration: none;
  font-weight: 500;
  padding: 0.15rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.breadcrumb-link:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #5a67d8 !important;
  transform: translateY(-1px);
}

.breadcrumb-link i {
  font-size: 0.75rem;
}

.breadcrumb-current {
  color: #2c3e50;
  font-weight: 600;
  padding: 0.15rem 0.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 1px 2px rgba(102, 126, 234, 0.1);
}

.custom-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23667eea' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 0.6em;
  width: 1.2em;
  height: 1em;
  opacity: 0.5;
}
</style>