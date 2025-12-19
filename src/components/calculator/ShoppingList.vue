<template>
  <div class="shopping-list">
    <!-- Shopping List Header -->
    <div class="card mb-4">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">
          <i class="bi bi-cart-plus me-2"></i>
          Shopping List - Daftar Belanja Bahan Baku
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Summary Info -->
          <div class="col-md-3">
            <div class="card bg-light border-success">
              <div class="card-body p-2">
                <h6 class="text-success mb-1">Total Item</h6>
                <h4 class="mb-0">{{ shoppingListData?.total_items || 0 }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light border-primary">
              <div class="card-body p-2">
                <h6 class="text-primary mb-1">Estimasi Total Biaya</h6>
                <h4 class="mb-0 text-primary">{{ shoppingListData?.estimated_total_cost_formatted || 'Rp 0' }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="d-flex gap-2 h-100">
              <button
                class="btn btn-success flex-fill"
                @click="exportShoppingList"
                :disabled="!shoppingListData?.shopping_list || shoppingListData.shopping_list.length === 0"
              >
                <i class="bi bi-download me-1"></i>
                Export Excel
              </button>
              <button
                class="btn btn-primary flex-fill"
                @click="printShoppingList"
              >
                <i class="bi bi-printer me-1"></i>
                Cetak
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <!-- Shopping List Table -->
    <div class="card" v-if="shoppingListData?.shopping_list && shoppingListData.shopping_list.length > 0">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-list-check me-2"></i>
          Detail Shopping List
        </h6>
      </div>
      <div class="card-body">
        <!-- Filter and Search -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Cari bahan baku..."
              >
            </div>
          </div>
          <div class="col-md-3">
            <select
              v-model="selectedCategory"
              class="form-select"
            >
              <option value="">Semua Kategori</option>
              <option
                v-for="category in availableCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select
              v-model="sortBy"
              class="form-select"
            >
              <option value="name">Urutkan: Nama</option>
              <option value="category">Urutkan: Kategori</option>
              <option value="amount">Urutkan: Jumlah</option>
              <option value="cost">Urutkan: Biaya</option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="form-check form-switch mt-2">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="groupByCategory"
              >
              <label class="form-check-label">Group Kategori</label>
            </div>
          </div>
        </div>

        <!-- Grouped by Category View -->
        <div v-if="groupByCategory">
          <div v-for="(items, category) in groupedShoppingList" :key="category" class="mb-4">
            <h6 class="text-primary mb-3">
              <i class="bi bi-folder me-2"></i>
              {{ category }} ({{ items.length }} item)
            </h6>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th width="5%">No</th>
                    <th width="30%">Bahan Baku</th>
                    <th width="15%">Satuan</th>
                    <th width="15%">Stok Tersedia</th>
                    <th width="12%">Jumlah Beli</th>
                    <th width="12%">Harga/Satuan</th>
                    <th width="15%">Estimasi Harga</th>
                    <th width="5%"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="item.id_bahan_baku">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="fw-semibold">{{ item.nama_bahan_baku }}</div>
                      <small class="text-muted">Kategori: {{ item.kategori }}</small>
                    </td>
                    <td>{{ item.satuan }}</td>
                    <td>{{ item.stok_tersedia }}</td>
                    <td>
                      <div class="fw-bold text-primary">{{ item.jumlah_beli_formatted }}</div>
                    </td>
                    <td>
                      <div class="fw-bold text-info" v-if="item.harga_per_satuan">
                        {{ formatCurrency(item.harga_per_satuan) }}
                      </div>
                      <div class="text-muted small" v-else>
                        <span class="badge bg-warning">Belum ada harga</span>
                      </div>
                    </td>
                    <td>
                      <div class="fw-bold text-success">{{ formatCurrency(item.estimated_cost) }}</div>
                    </td>
                    <td>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="`check-${item.id_bahan_baku}`"
                          v-model="item.checked"
                        >
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="5" class="text-end fw-bold">Subtotal {{ category }}:</td>
                    <td colspan="2" class="fw-bold text-success">
                      {{ formatCurrency(getCategoryTotal(items)) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Normal Table View -->
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th width="3%">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      v-model="selectAllChecked"
                      @change="toggleSelectAll"
                    >
                  </th>
                  <th width="5%">No</th>
                  <th width="30%">Bahan Baku</th>
                  <th width="15%">Kategori</th>
                  <th width="10%">Satuan</th>
                  <th width="10%">Stok Ada</th>
                  <th width="12%">Jumlah Beli</th>
                  <th width="12%">Harga/Satuan</th>
                  <th width="15%">Estimasi Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredShoppingList" :key="item.id_bahan_baku">
                  <td>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`check-${item.id_bahan_baku}`"
                        v-model="item.checked"
                      >
                    </div>
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="fw-semibold">{{ item.nama_bahan_baku }}</div>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ item.kategori }}</span>
                  </td>
                  <td>{{ item.satuan }}</td>
                  <td>{{ item.stok_tersedia }}</td>
                  <td>
                    <div class="fw-bold text-primary">{{ item.jumlah_beli_formatted }}</div>
                  </td>
                  <td>
                    <div class="fw-bold text-info" v-if="item.harga_per_satuan">
                      {{ formatCurrency(item.harga_per_satuan) }}
                    </div>
                    <div class="text-muted small" v-else>
                      <span class="badge bg-warning">Belum ada harga</span>
                    </div>
                  </td>
                  <td>
                    <div class="fw-bold text-success">{{ formatCurrency(item.estimated_cost) }}</div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <td colspan="4" class="text-end">
                    <strong>Selected Items ({{ selectedCount }}):</strong>
                  </td>
                  <td colspan="4" class="fw-bold text-success">
                    {{ formatCurrency(selectedTotal) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row mt-4">
          <div class="col-md-6">
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-danger"
                @click="clearUnselected"
                :disabled="selectedCount === 0"
              >
                <i class="bi bi-trash me-1"></i>
                Hapus Tidak Dicentang
              </button>
              <button
                class="btn btn-outline-warning"
                @click="sendToSupplier"
                :disabled="selectedCount === 0"
              >
                <i class="bi bi-send me-1"></i>
                Kirim ke Supplier
              </button>
            </div>
          </div>
          <div class="col-md-6 text-end">
            <button
              class="btn btn-outline-primary me-2"
              @click="duplicateShoppingList"
            >
              <i class="bi bi-files me-1"></i>
              Duplicate
            </button>
            <button
              class="btn btn-outline-success"
              @click="saveShoppingList"
            >
              <i class="bi bi-save me-1"></i>
              Simpan Template
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-cart-x display-4 text-muted"></i>
        <h5 class="mt-3 text-muted">Shopping List Kosong</h5>
        <p class="text-muted">
          Semua bahan tersedia dengan cukup di stok. Tidak ada yang perlu dibeli.
        </p>
        <button
          class="btn btn-outline-primary"
          @click="$emit('backToCalculator')"
        >
          <i class="bi bi-arrow-left me-1"></i>
          Kembali ke Kalkulator
        </button>
      </div>
    </div>

    <!-- Print View (Hidden by default) -->
    <div id="printArea" class="d-none">
      <div class="print-header">
        <h2>Shopping List - SPPG System</h2>
        <p>Tanggal: {{ new Date().toLocaleDateString('id-ID') }}</p>
        <hr>
      </div>

      <div v-if="groupByCategory">
        <div v-for="(items, category) in groupedShoppingList" :key="category" class="mb-4">
          <h5>{{ category }}</h5>
          <table class="print-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Bahan Baku</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items.filter(i => i.checked !== false)" :key="item.id_bahan_baku">
                <td>{{ index + 1 }}</td>
                <td>{{ item.nama_bahan_baku }}</td>
                <td>{{ item.jumlah_beli_formatted }}</td>
                <td>{{ item.satuan }}</td>
                <td>Stok tersedia: {{ item.stok_tersedia }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="print-footer">
        <p class="text-end"><strong>Total Estimasi: {{ formatCurrency(selectedTotal) }}</strong></p>
        <p class="text-center mt-5">Dibuat pada {{ new Date().toLocaleString('id-ID') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import calculatorService from '@/services/calculatorService'
import { useToast } from 'vue-toastification'

export default {
  name: 'ShoppingList',
  props: {
    requirements: {
      type: Array,
      default: () => []
    },
    shoppingListData: {
      type: Object,
      default: null
    }
  },
  emits: ['backToCalculator'],
  setup(props) {
    const toast = useToast()

    // Data
    const internalShoppingListData = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('name')
    const groupByCategory = ref(false)
    const mounted = ref(false)

    // Computed
    const availableCategories = computed(() => {
      if (!internalShoppingListData.value?.shopping_list) return []
      const categories = new Set(internalShoppingListData.value.shopping_list.map(item => item.kategori))
      return Array.from(categories).sort()
    })

    const filteredShoppingList = computed(() => {
      if (!internalShoppingListData.value?.shopping_list) return []

      let filtered = internalShoppingListData.value.shopping_list

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item =>
          item.nama_bahan_baku.toLowerCase().includes(query) ||
          item.kategori.toLowerCase().includes(query)
        )
      }

      // Filter by category
      if (selectedCategory.value) {
        filtered = filtered.filter(item => item.kategori === selectedCategory.value)
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'category':
            return a.kategori.localeCompare(b.kategori)
          case 'amount':
            return b.jumlah_beli - a.jumlah_beli
          case 'cost':
            return b.estimated_cost - a.estimated_cost
          default: // name
            return a.nama_bahan_baku.localeCompare(b.nama_bahan_baku)
        }
      })

      return filtered
    })

    const groupedShoppingList = computed(() => {
      if (!internalShoppingListData.value?.shopping_list) return {}
      return calculatorService.groupByCategory(filteredShoppingList.value)
    })

    const selectedCount = computed(() => {
      if (!internalShoppingListData.value?.shopping_list) return 0
      return internalShoppingListData.value.shopping_list.filter(item => item.checked !== false).length
    })

    const selectedTotal = computed(() => {
      if (!internalShoppingListData.value?.shopping_list) return 0
      return internalShoppingListData.value.shopping_list
        .filter(item => item.checked !== false)
        .reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
    })

    const selectAllChecked = computed({
      get() {
        if (!internalShoppingListData.value?.shopping_list) return false
        return internalShoppingListData.value.shopping_list.length > 0 &&
               internalShoppingListData.value.shopping_list.every(item => item.checked !== false)
      },
      set(value) {
        if (internalShoppingListData.value?.shopping_list) {
          internalShoppingListData.value.shopping_list.forEach(item => {
            item.checked = value
          })
        }
      }
    })

    // Computed for accessing props safely
    const hasPropsData = computed(() => {
      return props.shoppingListData !== null && props.shoppingListData !== undefined
    })

    // Methods
    const toggleSelectAll = () => {
      const newValue = !selectAllChecked.value
      if (internalShoppingListData.value?.shopping_list) {
        internalShoppingListData.value.shopping_list.forEach(item => {
          item.checked = newValue
        })
      }
    }

    const getCategoryTotal = (items) => {
      return items.filter(item => item.checked !== false)
                   .reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
    }

    const formatCurrency = (amount) => {
      return calculatorService.formatCurrency(amount)
    }

    const clearUnselected = () => {
      if (!shoppingListData.value?.shopping_list) return

      shoppingListData.value.shopping_list = shoppingListData.value.shopping_list.filter(
        item => item.checked !== false
      )

      toast.info('Item tidak dicentang dihapus')
    }

    const sendToSupplier = () => {
      // Placeholder for sending to supplier functionality
      toast.info('Fitur kirim ke supplier akan segera tersedia')
    }

    const duplicateShoppingList = () => {
      // Create a copy of current shopping list
      const duplicated = JSON.parse(JSON.stringify(shoppingListData.value))
      toast.success('Shopping list berhasil diduplikat')
    }

    const saveShoppingList = () => {
      // Placeholder for saving template functionality
      toast.info('Fitur simpan template akan segera tersedia')
    }

    const exportShoppingList = () => {
      const selectedItems = shoppingListData.value?.shopping_list?.filter(item => item.checked !== false) || []
      if (selectedItems.length === 0) {
        toast.warning('Pilih minimal 1 item untuk export')
        return
      }

      calculatorService.exportShoppingListToExcel(selectedItems, 'shopping-list')
      toast.success('Shopping list berhasil diekspor')
    }

    const printShoppingList = () => {
      window.print()
    }

    // Watch for prop changes
    watch(() => props.shoppingListData, (newShoppingListData) => {
      console.log('ShoppingList - shoppingListData prop changed:', newShoppingListData)
      if (newShoppingListData) {
        internalShoppingListData.value = newShoppingListData
        console.log('ShoppingList - set internalShoppingListData.value to:', internalShoppingListData.value)
        console.log('ShoppingList - shopping_list length:', newShoppingListData?.shopping_list?.length)

        // Set all items as checked by default
        if (newShoppingListData?.shopping_list) {
          newShoppingListData.shopping_list.forEach(item => {
            item.checked = true
          })
          console.log('ShoppingList - items after setting checked:', newShoppingListData.shopping_list)
        }
      }
    }, { immediate: true })

    // Also watch requirements for backward compatibility
    watch(() => props.requirements, (newRequirements) => {
      if (newRequirements && newRequirements.length > 0 && !props.shoppingListData) {
        generateShoppingListFromRequirements()
      }
    }, { immediate: true })

    const generateShoppingListFromRequirements = async () => {
      if (!props.requirements || props.requirements.length === 0) return

      try {
        const response = await calculatorService.generateShoppingList(props.requirements)
        internalShoppingListData.value = response.data

        // Set all items as checked by default
        if (response.data?.shopping_list) {
          response.data.shopping_list.forEach(item => {
            item.checked = true
          })
        }

        toast.success('Shopping list berhasil dibuat')
      } catch (error) {
        toast.error('Gagal membuat shopping list')
        console.error(error)
      }
    }

    // Lifecycle
    onMounted(() => {
      mounted.value = true
      console.log('ShoppingList component mounted')
    })

    return {
      // Data
      shoppingListData: internalShoppingListData,
      searchQuery,
      selectedCategory,
      sortBy,
      groupByCategory,
      mounted,

      // Computed
      availableCategories,
      filteredShoppingList,
      groupedShoppingList,
      selectedCount,
      selectedTotal,
      selectAllChecked,
      hasPropsData,

      // Methods
      getCategoryTotal,
      formatCurrency,
      toggleSelectAll,
      clearUnselected,
      sendToSupplier,
      duplicateShoppingList,
      saveShoppingList,
      exportShoppingList,
      printShoppingList,
      generateShoppingListFromRequirements
    }
  }
}
</script>

<style scoped>
.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.print-table th,
.print-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.print-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

@media print {
  .d-none {
    display: block !important;
  }

  .card {
    border: none !important;
    box-shadow: none !important;
  }

  .btn, .form-check-input {
    display: none !important;
  }

  body {
    font-size: 12px;
  }
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.badge {
  font-size: 0.75em;
}
</style>