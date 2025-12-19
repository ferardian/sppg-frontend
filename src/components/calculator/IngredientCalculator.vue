<template>
  <div class="ingredient-calculator">
    <!-- Calculator Header -->
    <div class="card mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-calculator me-2"></i>
          Kalkulator Kebutuhan Bahan Baku
        </h5>
      </div>
      <div class="card-body">
        <!-- Input Selection -->
        <div class="row g-3 mb-4">
          <!-- Menu Selection -->
          <div class="col-md-3">
            <label class="form-label">Pilih Menu</label>
            <select
              v-model="selectedMenuId"
              class="form-select"
              @change="onMenuChange"
              :disabled="loading || multipleMenusMode"
            >
              <option value="">-- Pilih Menu --</option>
              <option
                v-for="menu in menuList"
                :key="menu.id_menu"
                :value="menu.id_menu"
              >
                {{ menu.nama_menu }}
              </option>
            </select>
          </div>

          <!-- Date Selection -->
          <div class="col-md-2">
            <label class="form-label">Tanggal</label>
            <input
              v-model="selectedDate"
              type="date"
              class="form-control"
              @change="onDateChange"
              :disabled="loading || !selectedMenuId || multipleMenusMode"
            >
          </div>

          <!-- Portion Display (Read-only) -->
          <div class="col-md-2">
            <label class="form-label">Total Porsi</label>
            <div class="form-control-plaintext">
              <span v-if="totalPortions > 0" class="fw-bold text-primary">{{ totalPortions }} porsi</span>
              <span v-else class="text-muted">Pilih menu dan tanggal</span>
            </div>
          </div>

          <!-- Mode Toggle -->
          <div class="col-md-4 d-flex align-items-end">
            <div class="form-check form-switch me-3">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="multipleMenusMode"
                @change="onModeChange"
              >
              <label class="form-check-label">
                Mode Multiple Menu
              </label>
            </div>

            <button
              v-if="multipleMenusMode"
              class="btn btn-outline-primary"
              @click="showAddMenuForm = true"
            >
              <i class="bi bi-plus-circle me-1"></i>
              Tambah Menu
            </button>
          </div>

          <!-- Calculate Button -->
          <div class="col-md-3 d-flex align-items-end">
            <button
              class="btn btn-success w-100"
              @click="calculate"
              :disabled="loading || !canCalculate"
            >
              <i class="bi me-2" :class="loading ? 'bi-hourglass-split' : 'bi-calculator'"></i>
              {{ loading ? 'Menghitung...' : 'Hitung Kebutuhan' }}
            </button>
          </div>
        </div>

        <!-- Info Section -->
        <div class="row" v-if="!multipleMenusMode">
          <div class="col-12">
            <div class="alert alert-info d-flex align-items-center" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <div>
                <strong>Informasi:</strong> Jumlah porsi akan dihitung otomatis berdasarkan data distribusi makanan pada tanggal yang dipilih.
                Pastikan sudah ada data distribusi untuk menu dan tanggal yang dipilih.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiple Menus List -->
    <div class="card mb-4" v-if="multipleMenusMode && menuCalculationList.length > 0">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>
          Daftar Menu
        </h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="table-light">
              <tr>
                <th width="40%">Menu</th>
                <th width="20%">Jumlah Porsi</th>
                <th width="20%">Total Bahan</th>
                <th width="20%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in menuCalculationList" :key="index">
                <td>{{ item.menu.nama_menu }}</td>
                <td>
                  <input
                    type="number"
                    class="form-control form-control-sm"
                    v-model.number="item.total_porsi"
                    @input="calculateMultipleMenus"
                    min="1"
                  >
                </td>
                <td>
                  <span class="badge bg-primary">
                    {{ getRecipeItemCount(item.menu.id_menu) }} bahan
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeMenuFromList(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span class="badge bg-info">
              {{ menuCalculationList.length }} menu
            </span>
            <span class="badge bg-success ms-2">
              {{ getTotalIngredients() }} total bahan unik
            </span>
          </div>
          <button
            class="btn btn-success"
            @click="calculateMultipleMenus"
            :disabled="loading"
          >
            <i class="bi-calculator me-1"></i>
            Hitung Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Calculation Results -->
    <div v-if="calculationResults && calculationResults.requirements">
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-light border-info">
            <div class="card-body p-3">
              <h6 class="text-info mb-2">Total Bahan</h6>
              <h3 class="mb-0">{{ calculationResults.total_bahan || 0 }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light border-success">
            <div class="card-body p-3">
              <h6 class="text-success mb-2">Stok Cukup</h6>
              <h3 class="mb-0">{{ calculationResults.summary?.stok_cukup || 0 }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light border-danger">
            <div class="card-body p-3">
              <h6 class="text-danger mb-2">Stok Kurang</h6>
              <h3 class="mb-0">{{ calculationResults.summary?.stok_kurang || 0 }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-light border-warning">
            <div class="card-body p-3">
              <h6 class="text-warning mb-2">Persentase Cukup</h6>
              <h3 class="mb-0">{{ calculationResults.summary?.persentase_cukup || 0 }}%</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold">Status Ketersediaan Stok</span>
            <span class="badge" :class="getStockStatusBadge(calculationResults.summary?.persentase_cukup || 0)">
              {{ getStockStatusText(calculationResults.summary?.persentase_cukup || 0) }}
            </span>
          </div>
          <div class="progress" style="height: 25px;">
            <div
              class="progress-bar bg-success"
              :style="{ width: (calculationResults.summary?.persentase_cukup || 0) + '%' }"
            >
              {{ calculationResults.summary?.persentase_cukup || 0 }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="bi bi-list-check me-2"></i>
            Detail Kebutuhan Bahan
          </h6>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-warning btn-sm"
              @click="generateShoppingList"
              :disabled="!calculationResults.requirements || calculationResults.requirements.length === 0"
            >
              <i class="bi bi-cart-plus me-1"></i>
              Generate Shopping List
            </button>
            <button
              class="btn btn-outline-primary btn-sm"
              @click="exportResults"
            >
              <i class="bi bi-download me-1"></i>
              Export Excel
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th width="5%">#</th>
                  <th width="25%">Bahan Baku</th>
                  <th width="10%">Kategori</th>
                  <th width="12%">Per Porsi</th>
                  <th width="15%">Total Dibutuhkan</th>
                  <th width="12%">Stok Tersedia</th>
                  <th width="8%">Status</th>
                  <th width="13%">Kekurangan</th>
                  <th width="5%">Utama</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in sortedRequirements"
                  :key="item.id_bahan_baku"
                  :class="{ 'table-warning': item.is_primary && item.stok_status === 'kurang' }"
                >
                  <td>
                    <span class="badge bg-secondary">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="fw-semibold">{{ item.nama_bahan_baku }}</div>
                    <small class="text-muted">{{ item.satuan }}</small>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ item.kategori }}</span>
                  </td>
                  <td>
                    <small>{{ item.jumlah_per_porsi }}</small>
                  </td>
                  <td>
                    <div class="fw-bold" :class="getTextClassForAmount(item.total_dibutuhkan)">
                      {{ item.total_dibutuhkan_formatted }}
                    </div>
                  </td>
                  <td>
                    <div class="fw-bold">{{ item.stok_tersedia_formatted || '-' }}</div>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusClass(item.stok_status)">
                      <i :class="getStockStatusIcon(item.stok_status)" class="me-1"></i>
                      {{ item.stok_status }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-danger" v-if="item.selisih > 0">
                      {{ item.selisih_formatted }}
                    </div>
                    <span class="text-success" v-else>
                      <i class="bi bi-check-circle-fill"></i> Cukup
                    </span>
                  </td>
                  <td>
                    <i v-if="item.is_primary" class="bi bi-star-fill text-warning" title="Bahan Utama"></i>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="!calculationResults.requirements || calculationResults.requirements.length === 0" class="text-center py-4">
            <i class="bi bi-inbox display-4 text-muted"></i>
            <p class="mt-3 text-muted">Tidak ada data perhitungan yang tersedia</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Menu Modal (for Multiple Menus Mode) -->
    <div class="modal fade" :class="{ show: showAddMenuForm }" :style="{ display: showAddMenuForm ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Tambah Menu ke Perhitungan
            </h5>
            <button type="button" class="btn-close" @click="showAddMenuForm = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addMenuToCalculation">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Menu</label>
                  <select
                    v-model="newMenu.id_menu"
                    class="form-select"
                    required
                  >
                    <option value="">-- Pilih Menu --</option>
                    <option
                      v-for="menu in availableMenusForMultiple"
                      :key="menu.id_menu"
                      :value="menu.id_menu"
                    >
                      {{ menu.nama_menu }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Porsi</label>
                  <input
                    type="number"
                    v-model.number="newMenu.total_porsi"
                    class="form-control"
                    required
                    min="1"
                    placeholder="100"
                  >
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddMenuForm = false">Batal</button>
            <button type="button" class="btn btn-primary" @click="addMenuToCalculation">Tambah</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import calculatorService from '@/services/calculatorService'
import menuService from '@/services/menuService'
import { useToast } from 'vue-toastification'

export default {
  name: 'IngredientCalculator',
  props: {
    initialMenu: {
      type: Object,
      default: null
    },
    initialRecipeItems: {
      type: Array,
      default: () => []
    }
  },
  emits: ['shoppingListGenerated'],
  setup(props, { emit }) {
    const toast = useToast()

    // Data
    const loading = ref(false)
    const selectedMenuId = ref('')
    const selectedDate = ref(new Date().toISOString().split('T')[0]) // Today's date
    const totalPortions = ref(0) // Will be calculated from date
    const calculationResults = ref(null)
    const shoppingListData = ref(null)
    const multipleMenusMode = ref(false)
    const menuCalculationList = ref([])

    // Menu data
    const menuList = ref([])
    const selectedMenu = ref(null)

    // Form state
    const showAddMenuForm = ref(false)
    const newMenu = reactive({
      id_menu: '',
      total_porsi: 100
    })

    // Constants
    const quickPortions = [50, 100, 150, 200, 250, 500]

    // Computed
    const canCalculate = computed(() => {
      if (multipleMenusMode.value) {
        return menuCalculationList.value.length > 0
      }
      return selectedMenuId.value && selectedDate.value
    })

    const availableMenusForMultiple = computed(() => {
      return menuList.value.filter(menu =>
        !menuCalculationList.value.some(item => item.menu.id_menu === menu.id_menu)
      )
    })

    const sortedRequirements = computed(() => {
      if (!calculationResults.value?.requirements) return []
      return calculatorService.sortByPriority(calculationResults.value.requirements)
    })

    // Methods
    const loadMenus = async () => {
      try {
        const response = await menuService.getAll()
        menuList.value = response.data || response
      } catch (error) {
        toast.error('Gagal memuat daftar menu')
        console.error(error)
      }
    }

    const onMenuChange = () => {
      selectedMenu.value = menuList.value.find(menu => menu.id_menu === selectedMenuId.value)
      if (selectedMenuId.value && selectedDate.value) {
        calculate()
      }
    }

    const onDateChange = () => {
      if (selectedMenuId.value && selectedDate.value) {
        calculate()
      }
    }

    const onModeChange = () => {
      calculationResults.value = null
      if (multipleMenusMode.value) {
        // Add current selection to list if exists
        if (selectedMenuId.value && totalPortions.value) {
          menuCalculationList.value = [{
            menu: selectedMenu.value,
            total_porsi: totalPortions.value
          }]
          selectedMenuId.value = ''
          totalPortions.value = 100
        }
      } else {
        // Switch back to single mode
        menuCalculationList.value = []
      }
    }

    const calculate = async () => {
      if (!selectedMenuId.value || !selectedDate.value) return

      loading.value = true

      try {
        const response = await calculatorService.calculateMenuIngredientsByDate(
          selectedMenuId.value,
          selectedDate.value
        )

        if (response.success === false) {
          // Handle case when no distribution exists
          calculationResults.value = response.data
          totalPortions.value = 0
          toast.warning(response.message || 'Tidak ada data distribusi untuk tanggal yang dipilih')
        } else {
          // Handle successful calculation
          calculationResults.value = response.data

          // Update total portions from the response
          if (response.data?.menu?.total_porsi) {
            totalPortions.value = response.data.menu.total_porsi
          }

          const message = response.data?.tanggal
            ? `Perhitungan berhasil untuk tanggal ${response.data.tanggal}`
            : 'Perhitungan berhasil'
          toast.success(message)
        }
      } catch (error) {
        calculationResults.value = null
        totalPortions.value = 0
        toast.error(error.response?.data?.message || 'Gagal menghitung kebutuhan')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const calculateMultipleMenus = async () => {
      if (menuCalculationList.value.length === 0) return

      loading.value = true

      try {
        const response = await calculatorService.calculateMultipleMenus(menuCalculationList.value)
        calculationResults.value = response.data
        toast.success('Perhitungan multiple menu berhasil')
      } catch (error) {
        toast.error('Gagal menghitung kebutuhan multiple menu')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const addMenuToCalculation = () => {
      if (!newMenu.id_menu || !newMenu.total_porsi) return

      const menu = menuList.value.find(m => m.id_menu === newMenu.id_menu)
      if (menu) {
        menuCalculationList.value.push({
          menu: menu,
          total_porsi: newMenu.total_porsi
        })

        // Reset form
        newMenu.id_menu = ''
        newMenu.total_porsi = 100
        showAddMenuForm.value = false

        // Auto calculate
        calculateMultipleMenus()
      }
    }

    const removeMenuFromList = (index) => {
      menuCalculationList.value.splice(index, 1)
      if (menuCalculationList.value.length === 0) {
        calculationResults.value = null
      } else {
        calculateMultipleMenus()
      }
    }

    const getRecipeItemCount = (menuId) => {
      // This would ideally come from recipe data
      return 0 // Placeholder
    }

    const getTotalIngredients = () => {
      return calculationResults.value?.total_unique_ingredients || 0
    }

    const getStatusClass = (status) => {
      const colorClass = calculatorService.getStockStatusColor(status)
      return `bg-${colorClass}`
    }

    const getStockStatusIcon = (status) => {
      return calculatorService.getStockStatusIcon(status)
    }

    const getStockStatusBadge = (percentage) => {
      if (percentage >= 90) return 'bg-success'
      if (percentage >= 70) return 'bg-warning'
      return 'bg-danger'
    }

    const getStockStatusText = (percentage) => {
      if (percentage >= 90) return 'Baik'
      if (percentage >= 70) return 'Perlu Perhatian'
      return 'Kritis'
    }

    const getTextClassForAmount = (amount) => {
      if (amount >= 1000) return 'text-primary'
      if (amount >= 500) return 'text-info'
      return 'text-dark'
    }

    const generateShoppingList = async () => {
      if (!calculationResults.value?.requirements) return

      try {
        loading.value = true

        // Prepare requirements for API
        const requirements = calculationResults.value.requirements
          .filter(item => item.stok_status === 'kurang')
          .map(item => ({
            id_bahan_baku: item.id_bahan_baku,
            total_dibutuhkan: item.total_dibutuhkan
          }))

        if (requirements.length === 0) {
          toast.info('Semua bahan tersedia dengan cukup')
          return
        }

        // Call API to generate shopping list
        const response = await calculatorService.generateShoppingList(requirements)
        shoppingListData.value = response.data

        console.log('IngredientCalculator - Shopping list generated successfully:', response.data)
        console.log('IngredientCalculator - About to emit shoppingListGenerated event')

        // Emit event to parent component
        emit('shoppingListGenerated', response.data)
        console.log('IngredientCalculator - Event emitted successfully')

        toast.success('Shopping list dibuat dengan ' + response.data.total_items + ' item')
      } catch (error) {
        toast.error('Gagal membuat shopping list')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const exportResults = () => {
      if (!calculationResults.value?.requirements) return

      calculatorService.exportToExcel(
        calculationResults.value.requirements,
        multipleMenusMode.value ? 'multiple-menus-calculation' : `${selectedMenu.value?.nama_menu || 'menu'}-calculation`
      )
      toast.success('Data berhasil diekspor')
    }

    // Watch for prop changes
    watch(() => props.initialMenu, (newMenu) => {
      if (newMenu) {
        selectedMenu.value = newMenu
        selectedMenuId.value = newMenu.id_menu
      }
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      loadMenus()
    })

    return {
      // Data
      loading,
      selectedMenuId,
      selectedDate,
      totalPortions,
      calculationResults,
      multipleMenusMode,
      menuCalculationList,
      menuList,
      selectedMenu,
      showAddMenuForm,
      newMenu,
      quickPortions,

      // Computed
      canCalculate,
      availableMenusForMultiple,
      sortedRequirements,

      // Methods
      onMenuChange,
      onDateChange,
      onModeChange,
      calculate,
      calculateMultipleMenus,
      addMenuToCalculation,
      removeMenuFromList,
      getRecipeItemCount,
      getTotalIngredients,
      getStatusClass,
      getStockStatusIcon,
      getStockStatusBadge,
      getStockStatusText,
      getTextClassForAmount,
      generateShoppingList,
      exportResults
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.badge {
  font-size: 0.75em;
}

.table-warning {
  background-color: #fff3cd !important;
}

.progress {
  background-color: #e9ecef;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}
</style>