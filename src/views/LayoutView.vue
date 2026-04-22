<template>
  <div class="app-container">
    <!-- Sidebar -->
    <nav class="sidebar d-none d-lg-block" 
         :class="{ 'collapsed': isEffectivelyCollapsed }"
         @mouseenter="handleSidebarHover(true)"
         @mouseleave="handleSidebarHover(false)">
      <div class="sidebar-header p-3 mb-2 d-flex align-items-center justify-content-center" style="min-height: 70px;">
        <div class="d-flex align-items-center w-100" v-if="!isEffectivelyCollapsed">
          <img src="/logo.png" alt="Logo" class="me-2" style="width: 42px; height: 42px; object-fit: contain;">
          <div class="brand-info">
            <h6 class="text-white mb-0 fw-bold" style="line-height: 1.2; font-size: 1rem;">SPPG</h6>
            <h6 class="text-white mb-0 small opacity-75" style="line-height: 1.1;">Simbangwetan</h6>
          </div>
          <span class="badge bg-danger ms-2" style="font-size: 0.5em; align-self: flex-start; margin-top: 2px;">DEV</span>
        </div>
        <div class="brand-logo-collapsed" v-else>
           <img src="/logo.png" alt="Logo" style="width: 36px; height: 36px; object-fit: contain;">
        </div>
      </div>
      
      <!-- Stylish Toggle Button -->
      <div class="toggle-container" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Expand' : 'Collapse'">
         <div class="toggle-icon">
             <i class="bi bi-pin-angle"></i>
         </div>
      </div>

      <!-- Sidebar Menu -->
      <ul class="nav flex-column">
        <template v-for="(section, idx) in menuItems" :key="idx">
          <!-- Section Title -->
          <li class="nav-item mt-3" v-if="section.section !== 'main' && !isEffectivelyCollapsed && hasVisibleItems(section)">
            <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
              {{ section.section }}
            </h6>
          </li>
          <li class="nav-item" v-if="section.section !== 'main' && isEffectivelyCollapsed && hasVisibleItems(section)">
             <div class="collapsed-divider"></div>
          </li>

          <!-- Items -->
          <li v-for="item in section.items" :key="item.to" class="nav-item">
            <router-link 
              v-if="item.label === 'Dashboard' || authStore.hasAccess(getMenuKey(item))"
              :to="item.to" 
              class="nav-link" 
              active-class="active" 
              :title="isEffectivelyCollapsed ? item.label : ''"
            >
              <i :class="['bi', item.icon, 'me-2']"></i>
              <span v-show="!isEffectivelyCollapsed">{{ item.label }}</span>
              <span v-if="item.badge && !isEffectivelyCollapsed" class="badge bg-success ms-2" style="font-size: 0.6em;">{{ item.badge }}</span>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'collapsed': isEffectivelyCollapsed }">
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
            <div class="nav-item dropdown position-relative">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                @click.prevent="showUserMenu = !showUserMenu"
                aria-expanded="false"
              >
                <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                  <small class="fw-bold">{{ getUserInitials() }}</small>
                </div>
                <span class="d-none d-md-block">{{ authStore.userName }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" :class="{ 'show': showUserMenu }">
                <li>
                  <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                    <i class="bi bi-person me-2"></i>
                    Profil
                  </router-link>
                </li>
                <li>
                  <router-link to="/settings" class="dropdown-item" @click="showUserMenu = false">
                    <i class="bi bi-gear me-2"></i>
                    Pengaturan
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
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
        <div class="p-4 page-content-wrapper">
          <router-view />
        </div>
      </div>
    </main>

    <!-- Mobile Sidebar -->
    <div class="offcanvas offcanvas-start custom-mobile-sidebar" tabindex="-1" id="mobileSidebar" style="z-index: 1050;">
      <div class="offcanvas-header text-white border-bottom border-white-10 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <img src="/logo.png" alt="Logo" class="me-2" style="width: 42px; height: 42px; object-fit: contain;">
          <div class="brand-info">
            <h6 class="text-white mb-0 fw-bold" style="line-height: 1.2; font-size: 1rem;">SPPG</h6>
            <h6 class="text-white mb-0 small opacity-75" style="line-height: 1.1;">Simbangwetan</h6>
          </div>
        </div>
        <div class="d-flex align-items-center">
            <button type="button" class="btn btn-link text-white me-2 p-0" data-bs-dismiss="offcanvas" style="font-size: 1.5rem;">
                <i class="bi bi-arrow-left-circle"></i>
            </button>
        </div>
      </div>
      <div class="offcanvas-body p-0">
        <ul class="nav flex-column mobile-nav-list p-3">
          <template v-for="(section, idx) in menuItems" :key="'mob-' + idx">
            <!-- Section Title -->
            <li class="nav-item mt-3" v-if="section.section !== 'main' && hasVisibleItems(section)">
              <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
                {{ section.section }}
              </h6>
            </li>

            <!-- Items -->
            <li v-for="item in section.items" :key="'mob-' + item.to" class="nav-item">
              <router-link 
                v-if="item.label === 'Dashboard' || authStore.hasAccess(getMenuKey(item))"
                :to="item.to" 
                class="nav-link" 
                active-class="active" 
                @click="closeMobileMenu"
              >
                <i :class="['bi', item.icon, 'me-2']"></i>
                {{ item.label }}
                <span v-if="item.badge" class="badge bg-success ms-2" style="font-size: 0.6em;">{{ item.badge }}</span>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import authService from '@/services/authService'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'

export default {
  name: 'LayoutView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    
    // Centralized menu structure
    const menuItems = [
      {
        section: 'main',
        items: [
          { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' }
        ]
      },
      {
        section: 'Data Master',
        items: [
          { to: '/master-data/sppg', icon: 'bi-building', label: 'SPPG' },
          { to: '/master-data/pegawai', icon: 'bi-people', label: 'Pegawai' },
          { to: '/master-data/jabatan', icon: 'bi-briefcase', label: 'Jabatan' },
          { to: '/master-data/kader', icon: 'bi-person-vcard', label: 'Kader PIC' },
          { to: '/master-data/bahan-baku', icon: 'bi-basket', label: 'Bahan Baku' },
          { to: '/master-data/menu', icon: 'bi-menu-app', label: 'Menu' },
          { to: '/master-data/supplier', icon: 'bi-truck', label: 'Supplier' },
          { to: '/master-data/user-management', icon: 'bi-people-fill', label: 'Manajemen User' },
          { to: '/transactions/penerima-manfaat', icon: 'bi-person-check', label: 'Penerima Manfaat' }
        ]
      },
      {
        section: 'Transaksi',
        items: [
          { to: '/transactions/penerimaan-barang', icon: 'bi-truck', label: 'Penerimaan Barang' },
          { to: '/transactions/laporan-sampah', icon: 'bi-trash3', label: 'Laporan Sampah' },
          { to: '/transactions/stok-opname', icon: 'bi-clipboard-check', label: 'Stok Opname' },
          { to: '/tools/shopping-list', icon: 'bi-cart-check', label: 'Rencana Menu' },
          { to: '/tools/rab', icon: 'bi-wallet2', label: 'Rencana Anggaran' },
          { to: '/transactions/distribusi-makanan', icon: 'bi-box-seam', label: 'Distribusi Makanan' }
        ]
      },
      {
        section: 'Laporan & Analisis',
        items: [
          { to: '/reports/inventory', icon: 'bi-box-seam', label: 'Laporan Bahan Baku' },
          { to: '/reports/operational', icon: 'bi-activity', label: 'Laporan Operasional' },
          { to: '/reports/kader-incentive', icon: 'bi-cash-stack', label: 'Laporan Insentif Kader' },
          { to: '/tools/buku-kas', icon: 'bi-cash-coin', label: 'Buku Kas' },
          { to: '/tools/laporan-gaji', icon: 'bi-file-earmark-spreadsheet', label: 'Laporan Gaji' }
        ]
      },
      {
        section: 'Manajemen Menu',
        items: [
          { to: '/tools/komposisi-pangan', icon: 'bi-egg-fried', label: 'Komposisi Pangan' },
          { to: '/management/recipe-management', icon: 'bi-journal-text', label: 'Resep & Kalkulator', badge: 'NEW' },
          { to: '/management/menu-permissions', icon: 'bi-shield-lock', label: 'Pengaturan Hak Akses' }
        ]
      }
    ]
    
    const isSidebarCollapsed = ref(false)
    const isHovered = ref(false)
    const showUserMenu = ref(false)
    
    const isEffectivelyCollapsed = computed(() => isSidebarCollapsed.value && !isHovered.value)

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const handleSidebarHover = (value) => {
        if (window.innerWidth >= 992) {
            isHovered.value = value
        }
    }

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
        'SPPG': `Data ${configStore.sppgName}`,
        'Pegawai': 'Data Pegawai',
        'Jabatan': 'Master Jabatan',
        'BahanBaku': 'Data Bahan Baku',
        'Menu': 'Data Menu',
        'PenerimaManfaat': 'Penerima Manfaat',
        'Supplier': 'Data Supplier',
        'UserManagement': 'Manajemen User',
        'PenerimaanBarang': 'Penerimaan Barang',
        'LaporanSampah': 'Laporan Sampah',
        'StokOpname': 'Stok Opname',
        'DistribusiMakanan': 'Distribusi Makanan',
        'KomposisiPangan': 'Komposisi Pangan',
        'BukuKas': 'Buku Kas & Keuangan',
        'LaporanGaji': 'Laporan Gaji Relawan',
        'MenuPermissions': 'Pengaturan Hak Akses Menu'
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

    const closeMobileMenu = () => {
      const mobileSidebar = document.getElementById('mobileSidebar')
      if (mobileSidebar) {
        try {
            const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(mobileSidebar)
            if (bsOffcanvas) {
                bsOffcanvas.hide()
                return
            }
        } catch (e) {}
        
        const closeBtn = mobileSidebar.querySelector('[data-bs-dismiss="offcanvas"]')
        if (closeBtn) {
            closeBtn.click()
        }
      }
    }

    const getMenuKey = (item) => {
      const parts = item.to.split('/')
      return parts[parts.length - 1]
    }

    const hasVisibleItems = (section) => {
      return section.items.some(item => authStore.hasAccess(getMenuKey(item)))
    }

    return {
      authStore,
      configStore,
      getUserInitials,
      getCurrentPageTitle,
      handleLogout,
      closeMobileMenu,
      isSidebarCollapsed,
      isEffectivelyCollapsed,
      toggleSidebar,
      handleSidebarHover,
      showUserMenu,
      menuItems,
      hasVisibleItems,
      getMenuKey
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
  box-shadow: 4px 0 15px rgba(0,0,0,0.05);
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.brand-logo {
  font-weight: 800;
  letter-spacing: 0.5px;
}
.brand-info {
  display: flex;
  flex-direction: column;
}
.brand-logo-collapsed {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.toggle-container {
  display: flex;
  justify-content: flex-end;
  padding: 0 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.sidebar.collapsed .toggle-container {
  justify-content: center;
  padding: 0;
}
.toggle-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}
.toggle-container:hover .toggle-icon {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.8rem 0;
  margin: 0.2rem 0.5rem;
}

.sidebar.collapsed .nav-link i {
  margin-right: 0 !important;
  font-size: 1.4rem;
  transition: transform 0.3s ease;
}

.sidebar.collapsed .nav-link:hover i {
  transform: scale(1.2);
}

.collapsed-divider {
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  margin: 5px auto;
  width: 30px;
  border-radius: 2px;
}

.sidebar-header h4 {
  font-weight: 700;
}

.nav-section-title {
  font-weight: 600;
  letter-spacing: 0.5px;
  opacity: 0.7;
  font-size: 0.75rem;
  transition: opacity 0.3s;
}

.sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.85rem 1.5rem;
  margin: 0.2rem 0.8rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.sidebar .nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(3px);
}

.sidebar .nav-link.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(5px);
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
  transition: all 0.3s ease;
}

@media (min-width: 992px) {
  .main-content.collapsed {
    left: 80px;
    width: calc(100vw - 80px);
  }
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

.container-fluid {
  padding: 0 !important;
  width: 100%;
  max-width: none;
  margin: 0 !important;
}

.main-content .container-fluid {
  padding: 0 !important;
  margin: 0 !important;
}

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

.row {
  margin: 0;
}

.main-content .row > * {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.dashboard-card {
  margin: 0 0 1rem 0;
}

.card {
  margin-bottom: 1rem;
}

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

.mobile-nav-list {
  padding-bottom: 100px !important;
}

.custom-mobile-sidebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  width: 75vw !important;
  max-width: 320px !important;
}

.custom-mobile-sidebar .offcanvas-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-mobile-sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0.2rem 0;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.custom-mobile-sidebar .nav-link:hover,
.custom-mobile-sidebar .nav-link.active,
.custom-mobile-sidebar .nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

.offcanvas-body .nav-link:hover,
.offcanvas-body .nav-link.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.page-content-wrapper {
  min-height: calc(100vh + 1px);
}
</style>