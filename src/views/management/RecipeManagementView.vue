<template>
  <div class="recipe-management-view">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">
          <i class="bi bi-journal-text text-primary me-2"></i>
          Manajemen Resep & Kalkulator Bahan Baku
        </h4>
        <p class="text-muted mb-0">
          Kelola resep menu dan hitung kebutuhan bahan baku untuk produksi
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-primary"
          @click="exportAllRecipes"
        >
          <i class="bi bi-download me-1"></i>
          Export All Recipes
        </button>
        <button
          class="btn btn-success"
          @click="showCalculator = true; showRecipeManagement = false"
          v-if="!showCalculator"
        >
          <i class="bi bi-calculator me-1"></i>
          Buka Kalkulator
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-tabs mb-4" id="recipeTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: showRecipeManagement }"
          @click="showRecipeManagement = true; showCalculator = false; showShoppingList = false"
          type="button"
        >
          <i class="bi bi-journal-text me-2"></i>
          Manajemen Resep
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: showCalculator }"
          @click="showCalculator = true; showRecipeManagement = false; showShoppingList = false"
          type="button"
        >
          <i class="bi bi-calculator me-2"></i>
          Kalkulator Bahan
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: showShoppingList }"
          @click="showShoppingList = true; showRecipeManagement = false; showCalculator = false"
          type="button"
        >
          <i class="bi bi-cart-plus me-2"></i>
          Shopping List
          <span
            v-if="shoppingListCount > 0"
            class="badge bg-danger ms-1"
          >
            {{ shoppingListCount }}
          </span>
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Recipe Management Tab -->
      <div
        class="tab-pane fade"
        :class="{ 'show active': showRecipeManagement }"
        role="tabpanel"
      >
        <RecipeManagement
          :initial-menu-id="initialMenuId"
          @openCalculator="openCalculatorWithData"
        />
      </div>

      <!-- Calculator Tab -->
      <div
        class="tab-pane fade"
        :class="{ 'show active': showCalculator }"
        role="tabpanel"
      >
        <IngredientCalculator
          :initial-menu="calculatorData?.menu"
          :initial-recipe-items="calculatorData?.recipeItems"
          @shopping-list-generated="onShoppingListGenerated"
        />
      </div>

      <!-- Shopping List Tab -->
      <div
        class="tab-pane fade"
        :class="{ 'show active': showShoppingList }"
        role="tabpanel"
      >
        <ShoppingList
          :requirements="shoppingListRequirements"
          :shoppingListData="shoppingListData"
          @back-to-calculator="showCalculator = true; showShoppingList = false"
        />
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row g-3 mb-4" v-if="showRecipeManagement">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Total Menu</h6>
                <h3 class="mb-0">{{ stats.totalMenus }}</h3>
              </div>
              <i class="bi bi-journal-text display-6 opacity-25"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Menu dengan Resep</h6>
                <h3 class="mb-0">{{ stats.menusWithRecipes }}</h3>
              </div>
              <i class="bi bi-check-circle display-6 opacity-25"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Total Resep Item</h6>
                <h3 class="mb-0">{{ stats.totalRecipeItems }}</h3>
              </div>
              <i class="bi bi-list-ul display-6 opacity-25"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Bahan Unik</h6>
                <h3 class="mb-0">{{ stats.uniqueIngredients }}</h3>
              </div>
              <i class="bi bi-box display-6 opacity-25"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card" v-if="showRecipeManagement && recentActivity.length > 0">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-clock-history me-2"></i>
          Aktivitas Terkini
        </h6>
      </div>
      <div class="card-body">
        <div class="timeline">
          <div
            v-for="activity in recentActivity.slice(0, 5)"
            :key="activity.id"
            class="timeline-item"
          >
            <div class="timeline-marker" :class="getActivityClass(activity.type)"></div>
            <div class="timeline-content">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-semibold">{{ activity.title }}</div>
                  <small class="text-muted">{{ activity.description }}</small>
                </div>
                <small class="text-muted">{{ formatTime(activity.timestamp) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeManagement from '@/components/recipe/RecipeManagement.vue'
import IngredientCalculator from '@/components/calculator/IngredientCalculator.vue'
import ShoppingList from '@/components/calculator/ShoppingList.vue'
import recipeService from '@/services/recipeService'
import { useToast } from 'vue-toastification'

export default {
  name: 'RecipeManagementView',
  components: {
    RecipeManagement,
    IngredientCalculator,
    ShoppingList
  },
  setup() {
    const toast = useToast()
    const route = useRoute()
    const router = useRouter()

    // State
    const showRecipeManagement = ref(true)
    const showCalculator = ref(false)
    const showShoppingList = ref(false)

    // Data
    const initialMenuId = ref(null)
    const calculatorData = ref(null)
    const shoppingListRequirements = ref([])
    const shoppingListCount = ref(0)
    const shoppingListData = ref(null)

    // Stats
    const stats = reactive({
      totalMenus: 0,
      menusWithRecipes: 0,
      totalRecipeItems: 0,
      uniqueIngredients: 0
    })

    // Recent Activity
    const recentActivity = ref([])

    // Methods
    const loadStats = async () => {
      try {
        const response = await recipeService.getStatistics()
        if (response.success && response.data) {
          const data = response.data
          // Update stats
          stats.totalMenus = data.stats.totalMenus
          stats.menusWithRecipes = data.stats.menusWithRecipes
          stats.totalRecipeItems = data.stats.totalRecipeItems
          stats.uniqueIngredients = data.stats.uniqueIngredients

          // Update activities
          recentActivity.value = data.recentActivity.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }))
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
        toast.error('Gagal memuat statistik resep')
      }
    }

    const openCalculatorWithData = (data) => {
      calculatorData.value = data
      showCalculator.value = true
      showRecipeManagement.value = false
      showShoppingList.value = false

      // Scroll to top
      window.scrollTo(0, 0)
    }

    const getActivityClass = (type) => {
      switch (type) {
        case 'create':
          return 'bg-success'
        case 'update':
          return 'bg-warning'
        case 'delete':
          return 'bg-danger'
        case 'calculate':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'Baru saja'
      if (minutes < 60) return `${minutes} menit lalu`
      if (hours < 24) return `${hours} jam lalu`
      return `${days} hari lalu`
    }

    const exportAllRecipes = () => {
      toast.info('Fitur export all recipes akan segera tersedia')
    }

    const onShoppingListGenerated = (generatedData) => {
      console.log('RecipeManagementView - Shopping list generated:', generatedData)

      // Validate the received data
      if (!generatedData || !generatedData.shopping_list) {
        console.error('RecipeManagementView - Invalid shopping list data received:', generatedData)
        toast.error('Data shopping list tidak valid')
        return
      }

      console.log('RecipeManagementView - Valid data received, preparing to set values...')

      // Prepare requirements for ShoppingList component (backward compatibility)
      const requirements = generatedData.shopping_list.map(item => ({
        id_bahan_baku: item.id_bahan_baku,
        total_dibutuhkan: item.jumlah_beli // Use jumlah_beli instead of total_dibutuhkan
      }))

      console.log('RecipeManagementView - Prepared requirements:', requirements)

      // Set all the data the ShoppingList component needs
      shoppingListData.value = generatedData
      shoppingListRequirements.value = requirements
      shoppingListCount.value = generatedData.total_items

      console.log('RecipeManagementView - shoppingListData.value after setting:', shoppingListData.value)
      console.log('RecipeManagementView - shoppingListData.value type:', typeof shoppingListData.value)
      console.log('RecipeManagementView - About to switch to shopping list tab')

      // Switch to shopping list tab
      showShoppingList.value = true
      showCalculator.value = false

      toast.success('Shopping list tersedia di tab Shopping List')
    }

    // Handle route query params
    const handleRouteQuery = () => {
      if (route.query.tab === 'calculator') {
        showCalculator.value = true
        showRecipeManagement.value = false
      } else if (route.query.tab === 'shopping-list') {
        showShoppingList.value = true
        showRecipeManagement.value = false
      } else if (route.query.menu) {
        initialMenuId.value = parseInt(route.query.menu)
      }
    }

    // Watch for debugging
    watch(shoppingListData, (newValue) => {
      console.log('RecipeManagementView - shoppingListData watcher triggered:', newValue)
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      handleRouteQuery()
      loadStats()
    })

    return {
      // State
      showRecipeManagement,
      showCalculator,
      showShoppingList,

      // Data
      initialMenuId,
      calculatorData,
      shoppingListData,
      shoppingListRequirements,
      shoppingListCount,
      stats,
      recentActivity,

      // Methods
      openCalculatorWithData,
      getActivityClass,
      formatTime,
      exportAllRecipes,
      onShoppingListGenerated
    }
  }
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -24px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e9ecef;
}

.timeline-content {
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
  border-left: 4px solid #e9ecef;
}

.nav-tabs .nav-link {
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  color: #495057;
  font-weight: 600;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.6em;
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }

  .btn-group {
    width: 100%;
  }

  .btn {
    flex: 1;
  }
}
</style>