<template>
  <div class="app-container">
    <!-- Sidebar -->
    <nav class="sidebar d-none d-lg-block" 
         :class="{ 'collapsed': isEffectivelyCollapsed }"
         @mouseenter="handleSidebarHover(true)"
         @mouseleave="handleSidebarHover(false)">
      <div class="sidebar-header p-3 pb-2 mb-2 d-flex flex-column align-items-center justify-content-center">
        <div class="d-flex align-items-center w-100 mb-3" v-if="!isEffectivelyCollapsed">
          <img src="/logo.png" alt="Logo" class="me-2" style="width: 42px; height: 42px; object-fit: contain;">
          <div class="brand-info">
            <h6 class="text-dark mb-0 fw-bold" style="line-height: 1.2; font-size: 1rem;">SPPG</h6>
            <h6 class="text-muted mb-0 small" style="line-height: 1.1; font-size: 0.75rem;">Simbangwetan</h6>
          </div>
          <span class="badge bg-danger ms-2" style="font-size: 0.5em; align-self: flex-start; margin-top: 2px;">DEV</span>
        </div>
        <div class="brand-logo-collapsed text-center mb-3" v-else>
           <img src="/logo.png" alt="Logo" style="width: 36px; height: 36px; object-fit: contain;">
        </div>

        <!-- Date Time & Toggle Row -->
        <div class="d-flex align-items-center justify-content-between w-100 px-1" :class="{ 'justify-content-center': isEffectivelyCollapsed }">
          <div class="date-time-wrapper d-flex flex-column" v-if="!isEffectivelyCollapsed">
             <div class="fw-bold text-primary mb-0" style="font-size: 1.1rem; line-height: 1;">{{ currentTime }}</div>
             <div class="text-muted smaller" style="font-size: 0.65rem; margin-top: 2px; font-weight: 600;">{{ currentDate }}</div>
          </div>
          <div class="toggle-container m-0 p-0" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Expand' : 'Collapse'">
             <button class="toggle-icon shadow-sm">
                 <i class="bi" :class="isSidebarCollapsed ? 'bi-pin' : 'bi-pin-angle-fill'"></i>
             </button>
          </div>
        </div>
      </div>

      <!-- Sidebar Menu -->
      <ul class="nav flex-column">
        <template v-for="(section, idx) in menuItems" :key="idx">
          <!-- Section Title -->
          <li class="nav-item mt-3" v-if="section.section !== 'main' && !isEffectivelyCollapsed && hasVisibleItems(section)">
            <h6 class="nav-section-title px-3">
              {{ section.section }}
            </h6>
          </li>
          <li class="nav-item px-3" v-if="section.section !== 'main' && isEffectivelyCollapsed && hasVisibleItems(section)">
             <hr class="my-2 opacity-10">
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
              <i :class="['bi', item.icon]"></i>
              <div class="d-flex flex-column" v-show="!isEffectivelyCollapsed">
                <span class="menu-label">{{ item.label }}</span>
                <span v-if="item.subtext" class="menu-subtext text-muted smaller" style="font-size: 0.75rem; margin-top: -2px;">{{ item.subtext }}</span>
              </div>
              <span v-if="item.badge && !isEffectivelyCollapsed" class="badge bg-success ms-auto" style="font-size: 0.6em;">{{ item.badge }}</span>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'collapsed': isEffectivelyCollapsed }">
      <!-- Top Navigation -->
      <nav class="navbar navbar-expand-lg bg-white border-bottom mb-4">
        <div class="container-fluid px-4">
          <!-- Mobile Menu Button -->
          <button
            class="navbar-toggler border-0 d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
          >
            <i class="bi bi-list fs-3"></i>
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
                <li class="breadcrumb-item active" aria-current="page">
                  <span class="breadcrumb-current">{{ getCurrentPageTitle() }}</span>
                </li>
              </ol>
            </nav>
          </div>

          <!-- User Menu -->
          <div class="navbar-nav ms-auto align-items-center">
            <div class="nav-item dropdown position-relative">
              <div
                class="avatar"
                @click="showUserMenu = !showUserMenu"
              >
                {{ authStore.userName?.charAt(0).toUpperCase() }}
              </div>
              
              <ul v-if="showUserMenu" class="dropdown-menu show shadow border-0 position-absolute end-0 mt-2" style="border-radius: 12px; min-width: 200px;">
                <li class="px-3 py-2 border-bottom mb-1">
                   <div class="fw-bold small">{{ authStore.userName }}</div>
                   <div class="text-muted smaller">{{ authStore.userRole }}</div>
                </li>
                <li><a class="dropdown-item py-2" href="#"><i class="bi bi-person me-2"></i> Profile</a></li>
                <li><a class="dropdown-item py-2" href="#"><i class="bi bi-gear me-2"></i> Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-danger" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="page-content-wrapper">
        <router-view></router-view>
      </div>
    </main>

    <!-- Mobile Sidebar (Offcanvas) -->
    <div class="offcanvas offcanvas-start custom-mobile-sidebar border-0" tabindex="-1" id="mobileSidebar">
      <div class="offcanvas-header border-bottom">
        <div class="d-flex align-items-center">
          <img src="/logo.png" alt="Logo" class="me-2" style="width: 32px; height: 32px;">
          <h5 class="offcanvas-title fw-bold">SPPG Simbangwetan</h5>
        </div>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="mobile-nav-list p-3">
          <template v-for="(section, idx) in menuItems" :key="idx">
             <div class="text-muted small fw-bold text-uppercase mb-2 mt-3 ps-2" v-if="section.section !== 'main' && hasVisibleItems(section)">
                {{ section.section }}
             </div>
             <router-link 
                v-for="item in section.items" 
                :key="item.to"
                v-show="item.label === 'Dashboard' || authStore.hasAccess(getMenuKey(item))"
                :to="item.to" 
                class="nav-link py-2 px-3 mb-1 rounded-3 d-flex align-items-center"
                active-class="active"
                data-bs-dismiss="offcanvas"
             >
                <i :class="['bi', item.icon, 'me-3']"></i>
                <div class="d-flex flex-column">
                  <span class="menu-label">{{ item.label }}</span>
                  <span v-if="item.subtext" class="menu-subtext text-muted smaller" style="font-size: 0.75rem; margin-top: -2px;">{{ item.subtext }}</span>
                </div>
             </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'

export default {
  name: 'LayoutView',
  setup() {
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    const router = useRouter()
    const route = useRoute()
    
    const isSidebarCollapsed = ref(false)
    const isMobile = ref(false)
    const isHovered = ref(false)
    const showUserMenu = ref(false)
    const currentTime = ref('')
    const currentDate = ref('')
    let timer = null

    const isEffectivelyCollapsed = computed(() => {
      return isSidebarCollapsed.value && !isHovered.value && !isMobile.value
    })

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 992
    }

    const updateDateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/\./g, ':')

      currentDate.value = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
      })
    }

    onMounted(() => {
      checkMobile()
      updateDateTime()
      timer = setInterval(updateDateTime, 1000)
      window.addEventListener('resize', checkMobile)
      
      // Close user menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.avatar')) {
          showUserMenu.value = false
        }
      })
    })

    onUnmounted(() => {
      if (timer) clearInterval(timer)
      window.removeEventListener('resize', checkMobile)
    })

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const handleSidebarHover = (status) => {
      if (isSidebarCollapsed.value) {
        isHovered.value = status
      }
    }

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const getCurrentPageTitle = () => {
      return route.name || 'Dashboard'
    }

    const menuItems = [
      {
        section: 'main',
        items: [
          { label: 'Dashboard', to: '/dashboard', icon: 'bi-speedometer2' }
        ]
      },
      {
        section: 'Transaksi Utama',
        items: [
          { label: 'Rencana Menu', to: '/tools/shopping-list', icon: 'bi-cart-check' },
          { label: 'RAB SPPG', to: '/tools/rab', icon: 'bi-calculator' },
          { label: 'Penerimaan Barang', to: '/transactions/penerimaan-barang', icon: 'bi-download' },
          { label: 'Stok Opname', to: '/transactions/stok-opname', icon: 'bi-clipboard-check' },
          { label: 'Distribusi Makanan', to: '/transactions/distribusi-makanan', icon: 'bi-send' },
          { label: 'Laporan Sampah', to: '/transactions/laporan-sampah', icon: 'bi-trash' }
        ]
      },
      {
        section: 'Tools & Perencanaan',
        items: [
          { label: 'Komposisi Pangan', to: '/tools/komposisi-pangan', icon: 'bi-search' },
          { label: 'Buku Kas', to: '/tools/buku-kas', icon: 'bi-bank' },
          { label: 'Laporan Gaji', to: '/tools/laporan-gaji', icon: 'bi-cash-stack' }
        ]
      },
      {
        section: 'Management',
        items: [
          { label: 'Kader PIC', to: '/master-data/kader', icon: 'bi-person-badge' },
          { label: 'Recipe Management', to: '/management/recipe-management', icon: 'bi-journal-text' },
          { label: 'Menu Permissions', to: '/management/menu-permissions', icon: 'bi-shield-lock' }
        ]
      },
      {
        section: 'Laporan & Analisis',
        items: [
          { label: 'Laporan Inventory', to: '/reports/inventory', icon: 'bi-box-seam' },
          { label: 'Laporan Operasional', to: '/reports/operational', icon: 'bi-activity' },
          { label: 'Insentif Kader', to: '/reports/kader-incentive', icon: 'bi-cash-coin' }
        ]
      },
      {
        section: 'Master Data',
        items: [
          { label: 'Penerima Manfaat', to: '/transactions/penerima-manfaat', icon: 'bi-people' },
          { label: 'Data SPPG', to: '/master-data/sppg', icon: 'bi-building' },
          { label: 'Data Pegawai', to: '/master-data/pegawai', icon: 'bi-person-vcard' },
          { label: 'Data Jabatan', to: '/master-data/jabatan', icon: 'bi-briefcase' },
          { label: 'Bahan Baku', to: '/master-data/bahan-baku', icon: 'bi-egg' },
          { label: 'Menu Makanan', to: '/master-data/menu', icon: 'bi-card-list' },
          { label: 'Supplier', to: '/master-data/supplier', icon: 'bi-truck' },
          { label: 'User Management', to: '/master-data/user-management', icon: 'bi-person-gear' }
        ]
      }
    ]

    const hasVisibleItems = (section) => {
      return section.items.some(item => 
        item.label === 'Dashboard' || authStore.hasAccess(getMenuKey(item))
      )
    }

    const getMenuKey = (item) => {
      // Logic to convert label/to to menu key used in authStore
      return item.label.replace(/\s+/g, '')
    }

    return {
      authStore,
      configStore,
      isSidebarCollapsed,
      isEffectivelyCollapsed,
      showUserMenu,
      toggleSidebar,
      handleSidebarHover,
      handleLogout,
      getCurrentPageTitle,
      menuItems,
      hasVisibleItems,
      getMenuKey,
      currentTime,
      currentDate
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
  background-color: var(--bg-app);
}

.sidebar {
  width: 260px;
  background: var(--bg-card);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar for Sidebar */
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(13, 110, 253, 0.1);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.sidebar:hover::-webkit-scrollbar-thumb {
  background: rgba(13, 110, 253, 0.3);
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(13, 110, 253, 0.5);
}

.sidebar.collapsed .sidebar-header {
  padding: 1rem 0 !important;
}

.sidebar.collapsed .brand-logo-collapsed {
  width: 100%;
  display: flex;
  justify-content: center;
}

.sidebar.collapsed .toggle-container {
  padding: 0;
  justify-content: center;
}

.sidebar.collapsed {
  width: 80px;
  overflow-x: hidden;
}

.sidebar.collapsed .menu-label,
.sidebar.collapsed .menu-subtext,
.sidebar.collapsed .nav-section-title,
.sidebar.collapsed .badge {
  display: none !important;
}

.sidebar-header {
  min-height: 70px;
}

.toggle-container {
  padding: 0 0.5rem;
  display: flex;
  justify-content: flex-end;
  width: auto;
}

.sidebar.collapsed .toggle-container {
  justify-content: center;
  width: 100%;
  padding: 0;
}

.date-time-wrapper {
  padding-left: 0.5rem;
}

.smaller {
  font-size: 0.75rem;
}

.toggle-icon {
  background: var(--primary-light);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--primary-color);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-icon:hover {
  background: var(--primary-color);
  color: white;
}

.nav-section-title {
  padding: 1rem 1.5rem 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-size: 0.7rem;
}

.sidebar .nav-link {
  color: var(--text-muted);
  padding: 0.75rem 1.25rem;
  margin: 0.15rem 0.75rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 0.9rem;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar .nav-link i {
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .nav-link {
  margin: 0.15rem 10px;
  padding: 0.75rem 0;
  justify-content: center;
}

.sidebar.collapsed .nav-link i {
  margin-right: 0 !important;
  width: auto;
}

.sidebar .nav-link:hover {
  background-color: var(--bg-app);
  color: var(--primary-color);
}

.sidebar .nav-link.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
}

.main-content {
  position: fixed;
  top: 0;
  left: 260px;
  width: calc(100vw - 260px);
  background-color: var(--bg-app);
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.main-content.collapsed {
  left: 80px;
  width: calc(100vw - 80px);
}

.navbar {
  height: 70px;
  flex-shrink: 0;
}

.custom-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
  content: "→";
  color: var(--text-muted);
  padding: 0 0.5rem;
}

.breadcrumb-link {
  color: var(--text-muted) !important;
  text-decoration: none;
  font-size: 0.875rem;
}

.breadcrumb-current {
  color: var(--text-main);
  font-weight: 700;
  font-size: 0.875rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.page-content-wrapper {
  padding: 1.5rem;
  flex: 1;
}

@media (max-width: 991px) {
  .main-content {
    left: 0;
    width: 100vw;
  }
}
</style>