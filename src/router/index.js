import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import components
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LayoutView from '@/views/LayoutView.vue'

// Import route components
import SPPGView from '@/views/master/SPPGView.vue'
import PegawaiView from '@/views/master/PegawaiView.vue'
import BahanBakuView from '@/views/master/BahanBakuView.vue'
import MenuView from '@/views/master/MenuView.vue'
import PenerimaManfaatView from '@/views/transaction/PenerimaManfaatView.vue'
import SupplierView from '@/views/master/SupplierView.vue'
import StokOpnameView from '@/views/transaction/StokOpnameView.vue'
import DistribusiMakananView from '@/views/transaction/DistribusiMakananView.vue'
import UserManagementView from '@/views/master/UserManagementView.vue'
import RecipeManagementView from '@/views/management/RecipeManagementView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: LayoutView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'master-data/sppg',
        name: 'SPPG',
        component: SPPGView
      },
      {
        path: 'master-data/pegawai',
        name: 'Pegawai',
        component: PegawaiView
      },
      {
        path: 'master-data/bahan-baku',
        name: 'BahanBaku',
        component: BahanBakuView
      },
      {
        path: 'master-data/menu',
        name: 'Menu',
        component: MenuView
      },
      {
        path: 'master-data/supplier',
        name: 'Supplier',
        component: SupplierView
      },
      {
        path: 'master-data/user-management',
        name: 'UserManagement',
        component: UserManagementView
      },
      {
        path: 'transactions/penerima-manfaat',
        name: 'PenerimaManfaat',
        component: PenerimaManfaatView
      },
      {
        path: 'transactions/stok-opname',
        name: 'StokOpname',
        component: StokOpnameView
      },
      {
        path: 'transactions/distribusi-makanan',
        name: 'DistribusiMakanan',
        component: DistribusiMakananView
      },
      {
        path: 'management/recipe-management',
        name: 'RecipeManagement',
        component: RecipeManagementView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state
  authStore.initializeAuth()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
      return
    }
  }

  // Handle redirect from login
  if (to.name === 'Login' && authStore.isAuthenticated && to.query.redirect) {
    next(to.query.redirect)
    return
  }

  next()
})

export default router
