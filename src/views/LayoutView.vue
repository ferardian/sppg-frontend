<template>
  <div class="app-container">
    <!-- Sidebar -->
    <nav class="sidebar d-none d-lg-block" 
         :class="{ 'collapsed': isEffectivelyCollapsed }"
         @mouseenter="handleSidebarHover(true)"
         @mouseleave="handleSidebarHover(false)">
      <div class="sidebar-header p-4 d-flex align-items-center" :class="isEffectivelyCollapsed ? 'justify-content-center' : 'justify-content-between'">
        <h5 class="text-white mb-0 brand-logo" v-show="!isEffectivelyCollapsed" style="line-height: 1.3; max-width: 200px;">
          <i class="bi bi-egg-fried me-2"></i>
          {{ configStore.sppgName }}
        </h5>
        <h4 class="text-white mb-0 text-nowrap brand-logo-collapsed" v-show="isEffectivelyCollapsed">
           <i class="bi bi-egg-fried"></i>
        </h4>
      </div>
      
      <!-- Stylish Toggle Button -->
      <div class="toggle-container" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Expand' : 'Collapse'">
         <div class="toggle-icon">
             <i class="bi bi-pin-angle"></i>
         </div>
      </div>

      <!-- 
        MENU STRUCTURE: 
        Menu items didefinisikan di script section (variable menuItems).
        Untuk menambah/edit/hapus menu, edit array menuItems di bawah.
        Lihat MENU_STRUCTURE.md untuk dokumentasi lengkap.
        
        TODO: Refactor template ini untuk menggunakan v-for dari menuItems
        agar otomatis sinkron dengan mobile sidebar.
      -->
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Dashboard' : ''">
            <i class="bi bi-speedometer2 me-2"></i>
            <span v-show="!isEffectivelyCollapsed">Dashboard</span>
          </router-link>
        </li>

        <!-- Master Data -->
        <li class="nav-item mt-3" v-show="!isEffectivelyCollapsed">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Data Master
          </h6>
        </li>
        <li class="nav-item" v-show="isEffectivelyCollapsed">
           <div class="collapsed-divider"></div>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/sppg" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'SPPG' : ''">
            <i class="bi bi-building me-2"></i>
            <span v-show="!isEffectivelyCollapsed">SPPG</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/pegawai" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Pegawai' : ''">
            <i class="bi bi-people me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Pegawai</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/jabatan" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Jabatan' : ''">
            <i class="bi bi-briefcase me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Jabatan</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/bahan-baku" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Bahan Baku' : ''">
            <i class="bi bi-basket me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Bahan Baku</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/menu" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Menu' : ''">
            <i class="bi bi-menu-app me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Menu</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/supplier" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Supplier' : ''">
            <i class="bi bi-truck me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Supplier</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/master-data/user-management" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Manajemen User' : ''">
            <i class="bi bi-people-fill me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Manajemen User</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/transactions/penerima-manfaat" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Penerima Manfaat' : ''">
            <i class="bi bi-person-check me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Penerima Manfaat</span>
          </router-link>
        </li>

        <!-- Transactions -->
        <li class="nav-item mt-3" v-show="!isEffectivelyCollapsed">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Transaksi
          </h6>
        </li>
        <li class="nav-item" v-show="isEffectivelyCollapsed">
           <div class="collapsed-divider"></div>
        </li>

        <li class="nav-item">
          <router-link to="/transactions/stok-opname" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Stok Opname' : ''">
            <i class="bi bi-clipboard-check me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Stok Opname</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tools/shopping-list" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Rencana Menu' : ''">
            <i class="bi bi-cart-check me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Rencana Menu</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tools/rab" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Rencana Anggaran' : ''">
            <i class="bi bi-wallet2 me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Rencana Anggaran</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tools/buku-kas" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Buku Kas' : ''">
            <i class="bi bi-cash-coin me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Buku Kas</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tools/laporan-gaji" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Laporan Gaji' : ''">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Laporan Gaji</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/transactions/distribusi-makanan" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Distribusi Makanan' : ''">
            <i class="bi bi-box-seam me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Distribusi Makanan</span>
          </router-link>
        </li>

        <!-- Menu Management -->
        <li class="nav-item mt-3" v-show="!isEffectivelyCollapsed">
          <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
            Manajemen Menu
          </h6>
        </li>
        <li class="nav-item" v-show="isEffectivelyCollapsed">
           <div class="collapsed-divider"></div>
        </li>
        <li class="nav-item">
          <router-link to="/tools/komposisi-pangan" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Komposisi Pangan' : ''">
            <i class="bi bi-egg-fried me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Komposisi Pangan</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/management/recipe-management" class="nav-link" active-class="active" :title="isEffectivelyCollapsed ? 'Resep & Kalkulator' : ''">
            <i class="bi bi-journal-text me-2"></i>
             <span v-show="!isEffectivelyCollapsed">Resep & Kalkulator</span>
            <span class="badge bg-success ms-2" style="font-size: 0.6em;" v-show="!isEffectivelyCollapsed">NEW</span>
          </router-link>
        </li>


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
    <!-- Added custom-mobile-sidebar class for styling -->
    <div class="offcanvas offcanvas-start custom-mobile-sidebar" tabindex="-1" id="mobileSidebar" style="z-index: 1050;">
      <div class="offcanvas-header text-white border-bottom border-white-10 d-flex align-items-center justify-content-between">
        <h5 class="offcanvas-title brand-logo">
          <i class="bi bi-egg-fried me-2"></i>
          {{ configStore.sppgName }}
        </h5>
        <div class="d-flex align-items-center">
            <!-- Alternative arrow close button -->
            <button type="button" class="btn btn-link text-white me-2 p-0" data-bs-dismiss="offcanvas" style="font-size: 1.5rem;">
                <i class="bi bi-arrow-left-circle"></i>
            </button>
            <!-- Standard close button (keep as backup/standard) -->
            <!-- <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button> -->
        </div>
      </div>
      <div class="offcanvas-body p-0">
        <ul class="nav flex-column mobile-nav-list p-3">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-speedometer2 me-2"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item mt-3">
            <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
              Data Master
            </h6>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/sppg" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-building me-2"></i>
              SPPG
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/pegawai" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-people me-2"></i>
              Pegawai
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/jabatan" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-briefcase me-2"></i>
              Jabatan
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/bahan-baku" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-basket me-2"></i>
              Bahan Baku
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/menu" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-menu-app me-2"></i>
              Menu
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/supplier" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-truck me-2"></i>
              Supplier
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/master-data/user-management" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-people-fill me-2"></i>
              Manajemen User
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/penerima-manfaat" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-person-check me-2"></i>
              Penerima Manfaat
            </router-link>
          </li>
          <li class="nav-item mt-3">
            <h6 class="nav-section-title px-3 text-uppercase small text-white-50">
              Transaksi
            </h6>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/stok-opname" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-clipboard-check me-2"></i>
              Stok Opname
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tools/shopping-list" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-cart-check me-2"></i>
              Rencana Menu
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tools/rab" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-wallet2 me-2"></i>
              Rencana Anggaran
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tools/buku-kas" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-cash-coin me-2"></i>
              Buku Kas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tools/laporan-gaji" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-file-earmark-spreadsheet me-2"></i>
              Laporan Gaji
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/transactions/distribusi-makanan" class="nav-link" active-class="active" @click="closeMobileMenu">
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
            <router-link to="/tools/komposisi-pangan" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-egg-fried me-2"></i>
              Komposisi Pangan
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/management/recipe-management" class="nav-link" active-class="active" @click="closeMobileMenu">
              <i class="bi bi-journal-text me-2"></i>
              Resep & Kalkulator
            </router-link>
          </li>
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
          { to: '/transactions/stok-opname', icon: 'bi-clipboard-check', label: 'Stok Opname' },
          { to: '/tools/shopping-list', icon: 'bi-cart-check', label: 'Rencana Menu' },
          { to: '/tools/rab', icon: 'bi-wallet2', label: 'Rencana Anggaran' },
          { to: '/tools/buku-kas', icon: 'bi-cash-coin', label: 'Buku Kas' },
          { to: '/tools/laporan-gaji', icon: 'bi-file-earmark-spreadsheet', label: 'Laporan Gaji' },
          { to: '/transactions/distribusi-makanan', icon: 'bi-box-seam', label: 'Distribusi Makanan' }
        ]
      },
      {
        section: 'Manajemen Menu',
        items: [
          { to: '/tools/komposisi-pangan', icon: 'bi-egg-fried', label: 'Komposisi Pangan' },
          { to: '/management/recipe-management', icon: 'bi-journal-text', label: 'Resep & Kalkulator', badge: 'NEW' }
        ]
      }
    ]
    
    // Sidebar collapse state
    // Default to expanded
    const isSidebarCollapsed = ref(false)
    const isHovered = ref(false)
    const showUserMenu = ref(false)
    
    // Sidebar is effectively collapsed only if "locked" collapsed AND not currently hovered
    const isEffectivelyCollapsed = computed(() => isSidebarCollapsed.value && !isHovered.value)

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const handleSidebarHover = (value) => {
        // Only trigger hover effects on desktop
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
        'StokOpname': 'Stok Opname',
        'DistribusiMakanan': 'Distribusi Makanan',
        'KomposisiPangan': 'Komposisi Pangan',
        'BukuKas': 'Buku Kas & Keuangan',
        'LaporanGaji': 'Laporan Gaji Relawan'
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
      // Reliable way to close offcanvas without worrying about global bootstrap instance:
      // Find the trigger button inside the offcanvas and click it.
      const mobileSidebar = document.getElementById('mobileSidebar')
      if (mobileSidebar) {
        // Option 1: Try getting the bootstrap instance directly if available globally
        try {
            const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(mobileSidebar)
            if (bsOffcanvas) {
                bsOffcanvas.hide()
                return
            }
        } catch (e) {
            // ignore
        }
        
        // Option 2 (Fallback): Find the dismiss button and click it
        const closeBtn = mobileSidebar.querySelector('[data-bs-dismiss="offcanvas"]')
        if (closeBtn) {
            closeBtn.click()
        }
      }
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
      menuItems
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
  box-shadow: 4px 0 15px rgba(0,0,0,0.05); /* Softer shadow */
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scroll */
  margin: 0;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother bezier transition */
}

/* Sidebar Branding */
.brand-logo {
  font-weight: 800;
  letter-spacing: 1px;
}
.brand-logo-collapsed {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Toggle Button Styling */
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
  margin: 0.2rem 0.5rem; /* Centered with margin */
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
  margin: 0.2rem 0.8rem; /* Add side margins for floating feel */
  border-radius: 12px; /* More rounded */
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
  transform: translateX(3px); /* Subtle nudge */
}

.sidebar .nav-link.active {
  background: rgba(255, 255, 255, 0.25); /* Stronger active background */
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); /* Subtle depth */
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

/* Helper for mobile menu scrolling */
.mobile-nav-list {
  padding-bottom: 100px !important; /* Ensure last item is reachable */
}

/* Match mobile sidebar aesthetic to desktop */
.custom-mobile-sidebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  width: 75vw !important; /* 3/4 width */
  max-width: 320px !important; /* Cap it for larger mobile screens/tablets */
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

/* Override existing offcanvas body link styles if any conflict */
.offcanvas-body .nav-link:hover,
.offcanvas-body .nav-link.active {
  background: rgba(255, 255, 255, 0.15); /* Match desktop hover */
  color: white;
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Force scrollability to enable pull-to-refresh on mobile */
.page-content-wrapper {
  min-height: calc(100vh + 1px);
}
</style>