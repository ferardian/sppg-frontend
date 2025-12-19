<template>
  <div class="recipe-management">
    <!-- Header -->
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="bi bi-journal-text me-2"></i>
          Manajemen Resep Menu
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Menu Selection -->
          <div class="col-md-4">
            <label class="form-label">Pilih Menu</label>
            <select
              v-model="selectedMenuId"
              class="form-select"
              @change="loadMenuRecipe"
              :disabled="loading"
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

          <!-- Menu Info -->
          <div class="col-md-8" v-if="selectedMenu">
            <div class="alert alert-info mb-0">
              <h6 class="mb-1">{{ selectedMenu.nama_menu }}</h6>
              <small class="text-muted" v-if="selectedMenu.deskripsi">
                {{ selectedMenu.deskripsi }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipe Items List -->
    <div class="card" v-if="selectedMenu">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>
          Bahan-bahan Resep
        </h6>
        <button
          class="btn btn-primary btn-sm"
          @click="showAddForm = true"
          :disabled="loading"
        >
          <i class="bi bi-plus-circle me-1"></i>
          Tambah Bahan
        </button>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 mb-0 text-muted">Memuat data resep...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="recipeItems.length === 0" class="text-center py-4">
          <i class="bi bi-inbox display-4 text-muted"></i>
          <p class="mt-3 text-muted">
            Belum ada bahan yang ditambahkan untuk menu ini
          </p>
          <button
            class="btn btn-outline-primary"
            @click="showAddForm = true"
          >
            <i class="bi bi-plus-circle me-1"></i>
            Tambah Bahan Pertama
          </button>
        </div>

        <!-- Recipe Items Table -->
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th width="5%">#</th>
                  <th width="25%">Bahan Baku</th>
                  <th width="8%">Kategori</th>
                  <th width="18%">Jumlah</th>
                  <th width="10%">Tipe</th>
                  <th width="8%">Waste</th>
                  <th width="8%">Utama</th>
                  <th width="18%">Catatan</th>
                  <th width="10%">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in recipeItems" :key="item.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="fw-semibold">{{ item.bahan_baku?.nama_bahan_baku }}</div>
                    <small class="text-muted">{{ item.satuan }}</small>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ item.bahan_baku?.kategori }}</span>
                  </td>
                  <td>
                    <!-- Dynamic Amount Input -->
                    <div class="input-group input-group-sm" v-if="!item.is_fixed_amount">
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="item.jumlah_per_porsi"
                        @change="updateRecipeItem(item)"
                        step="0.01"
                        min="0.01"
                      >
                      <span class="input-group-text">/porsi</span>
                    </div>
                    <div class="input-group input-group-sm" v-else>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="item.fixed_amount"
                        @change="updateRecipeItem(item)"
                        step="0.01"
                        min="0.01"
                      >
                      <span class="input-group-text">/batch</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="item.is_fixed_amount ? 'bg-warning' : 'bg-info'">
                      <i :class="item.is_fixed_amount ? 'bi bi-hash' : 'bi bi-calculator'" class="me-1"></i>
                      {{ item.is_fixed_amount ? 'Tetap' : 'Per Porsi' }}
                    </span>
                  </td>
                  <td>
                    <select
                      class="form-select form-select-sm"
                      v-model="item.waste_factor"
                      @change="updateRecipeItem(item)"
                    >
                      <option value="1.0">0%</option>
                      <option value="1.05">5%</option>
                      <option value="1.10">10%</option>
                      <option value="1.15">15%</option>
                      <option value="1.20">20%</option>
                      <option value="1.25">25%</option>
                      <option value="1.30">30%</option>
                    </select>
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`primary-${item.id}`"
                        v-model="item.is_primary"
                        @change="updateRecipeItem(item)"
                      >
                      <label class="form-check-label" :for="`primary-${item.id}`"></label>
                    </div>
                  </td>
                  <td>
                    <small class="text-muted">{{ item.catatan || '-' }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="editRecipeItem(item)"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="confirmDelete(item)"
                        title="Hapus"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="row mt-3">
            <div class="col-md-3">
              <div class="card bg-light border-info">
                <div class="card-body p-2">
                  <h6 class="text-info mb-1">Total Bahan</h6>
                  <h4 class="mb-0">{{ recipeItems.length }}</h4>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-light border-warning">
                <div class="card-body p-2">
                  <h6 class="text-warning mb-1">Bahan Utama</h6>
                  <h4 class="mb-0">{{ recipeItems.filter(item => item.is_primary).length }}</h4>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex gap-2 justify-content-end">
                <button
                  class="btn btn-outline-success"
                  @click="openCalculator"
                >
                  <i class="bi bi-calculator me-1"></i>
                  Hitung Kebutuhan
                </button>
                <button
                  class="btn btn-outline-primary"
                  @click="exportRecipe"
                >
                  <i class="bi bi-download me-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Recipe Item Modal -->
    <div class="modal fade" :class="{ show: showAddForm }" :style="{ display: showAddForm ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              {{ editingItem ? 'Edit' : 'Tambah' }} Bahan Resep
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRecipeItem" id="recipeForm">
              <div class="row g-3">
                <!-- Bahan Baku -->
                <div class="col-md-6">
                  <label class="form-label">Bahan Baku *</label>
                  <select
                    v-model="form.id_bahan_baku"
                    class="form-select"
                    :class="{ 'is-invalid': errors.id_bahan_baku }"
                    :disabled="!!editingItem"
                  >
                    <option value="">-- Pilih Bahan Baku --</option>
                    <option
                      v-for="ingredient in availableIngredients"
                      :key="ingredient.id_bahan_baku"
                      :value="ingredient.id_bahan_baku"
                    >
                      {{ ingredient.nama_bahan_baku }} ({{ ingredient.kategori }})
                    </option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.id_bahan_baku">
                    {{ errors.id_bahan_baku }}
                  </div>
                </div>

                <!-- Jenis Perhitungan -->
                <div class="col-md-12">
                  <label class="form-label">Jenis Perhitungan *</label>
                  <div class="btn-group" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      name="amountType"
                      id="perPorsi"
                      v-model="form.is_fixed_amount"
                      :value="false"
                    >
                    <label class="btn btn-outline-primary" for="perPorsi">
                      <i class="bi bi-calculator me-1"></i>
                      Per Porsi
                    </label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="amountType"
                      id="fixedAmount"
                      v-model="form.is_fixed_amount"
                      :value="true"
                    >
                    <label class="btn btn-outline-primary" for="fixedAmount">
                      <i class="bi bi-hash me-1"></i>
                      Tetap (per batch)
                    </label>
                  </div>
                  <small class="form-text text-muted">
                    <span v-if="!form.is_fixed_amount">
                      Digunakan untuk bahan yang dihitung per porsi (daging, sayuran, dll)
                    </span>
                    <span v-else>
                      Digunakan untuk bahan yang jumlahnya tetap per batch (minyak, tepung, gula, dll)
                    </span>
                  </small>
                </div>

                <!-- Jumlah Per Porsi (Default) -->
                <div class="col-md-6" v-if="!form.is_fixed_amount">
                  <label class="form-label">Jumlah Per Porsi *</label>
                  <div class="input-group">
                    <input
                      type="number"
                      v-model.number="form.jumlah_per_porsi"
                      class="form-control"
                      :class="{ 'is-invalid': errors.jumlah_per_porsi }"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                    >
                    <span class="input-group-text">per porsi</span>
                  </div>
                  <div class="invalid-feedback" v-if="errors.jumlah_per_porsi">
                    {{ errors.jumlah_per_porsi }}
                  </div>
                  <small class="form-text text-muted">
                    Contoh: 200 gram per porsi ayam
                  </small>
                </div>

                <!-- Fixed Amount (Baru) -->
                <div class="col-md-6" v-if="form.is_fixed_amount">
                  <label class="form-label">Jumlah Tetap *</label>
                  <div class="input-group">
                    <input
                      type="number"
                      v-model.number="form.fixed_amount"
                      class="form-control"
                      :class="{ 'is-invalid': errors.fixed_amount }"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                    >
                    <span class="input-group-text">per batch</span>
                  </div>
                  <div class="invalid-feedback" v-if="errors.fixed_amount">
                    {{ errors.fixed_amount }}
                  </div>
                  <small class="form-text text-muted">
                    Contoh: 500 ml minyak goreng per batch
                  </small>
                </div>

                <!-- Satuan -->
                <div class="col-md-6">
                  <label class="form-label">Satuan *</label>
                  <select
                    v-model="form.satuan"
                    class="form-select"
                    :class="{ 'is-invalid': errors.satuan }"
                  >
                    <option value="">-- Pilih Satuan --</option>
                    <option
                      v-for="unit in unitOptions"
                      :key="unit.value"
                      :value="unit.value"
                    >
                      {{ unit.label }}
                    </option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.satuan">
                    {{ errors.satuan }}
                  </div>
                </div>

                <!-- Waste Factor -->
                <div class="col-md-4">
                  <label class="form-label">Waste Factor</label>
                  <select
                    v-model="form.waste_factor"
                    class="form-select"
                  >
                    <option
                      v-for="waste in wasteFactorOptions"
                      :key="waste.value"
                      :value="waste.value"
                    >
                      {{ waste.label }}
                    </option>
                  </select>
                  <small class="form-text text-muted">
                    {{ wasteFactorOptions.find(w => w.value === form.waste_factor)?.description }}
                  </small>
                </div>

                <!-- Primary Ingredient -->
                <div class="col-md-4">
                  <label class="form-label">Bahan Utama</label>
                  <div class="form-check form-switch mt-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="form.is_primary"
                    >
                    <label class="form-check-label">
                      Tandai sebagai bahan utama
                    </label>
                  </div>
                </div>

                <!-- Catatan -->
                <div class="col-md-4">
                  <label class="form-label">Catatan</label>
                  <input
                    type="text"
                    v-model="form.catatan"
                    class="form-control"
                    placeholder="Opsional"
                  >
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeForm">Batal</button>
            <button type="submit" form="recipeForm" class="btn btn-primary" :disabled="saving">
              <i class="bi me-2" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle text-warning me-2"></i>
              Konfirmasi Hapus
            </h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus bahan "<strong>{{ deletingItem?.bahan_baku?.nama_bahan_baku }}</strong>" dari resep?</p>
            <p class="text-muted mb-0">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Batal</button>
            <button type="button" class="btn btn-danger" @click="deleteRecipeItem">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import recipeService from '@/services/recipeService'
import menuService from '@/services/menuService'
import { useToast } from 'vue-toastification'

export default {
  name: 'RecipeManagement',
  props: {
    initialMenuId: {
      type: Number,
      default: null
    }
  },
  emits: ['openCalculator'],
  setup(props, { emit }) {
    const toast = useToast()

    // Data
    const loading = ref(false)
    const saving = ref(false)
    const selectedMenuId = ref('')
    const menuList = ref([])
    const selectedMenu = ref(null)
    const recipeItems = ref([])
    const availableIngredients = ref([])

    // Form state
    const showAddForm = ref(false)
    const editingItem = ref(null)
    const form = reactive({
      id_bahan_baku: '',
      jumlah_per_porsi: '',
      fixed_amount: '',
      is_fixed_amount: false, // Default: per porsi
      satuan: '',
      catatan: '',
      is_primary: false,
      waste_factor: 1.20
    })
    const errors = ref({})

    // Delete state
    const showDeleteModal = ref(false)
    const deletingItem = ref(null)

    // Options
    const unitOptions = recipeService.getUnitOptions()
    const wasteFactorOptions = recipeService.getWasteFactorOptions()

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

    const loadAvailableIngredients = async () => {
      try {
        const response = await recipeService.getAvailableIngredients()
        availableIngredients.value = response.data || response
      } catch (error) {
        toast.error('Gagal memuat daftar bahan baku')
        console.error(error)
      }
    }

    const loadMenuRecipe = async () => {
      if (!selectedMenuId.value) {
        selectedMenu.value = null
        recipeItems.value = []
        return
      }

      loading.value = true

      try {
        const [menuData, recipeData] = await Promise.all([
          menuService.getById(selectedMenuId.value),
          recipeService.getMenuRecipe(selectedMenuId.value)
        ])

        selectedMenu.value = menuData.data || menuData
        recipeItems.value = recipeData.data?.recipe_items || []
      } catch (error) {
        toast.error('Gagal memuat data resep')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      Object.assign(form, {
        id_bahan_baku: '',
        jumlah_per_porsi: '',
        fixed_amount: '',
        is_fixed_amount: false,
        satuan: '',
        catatan: '',
        is_primary: false,
        waste_factor: 1.20
      })
      errors.value = {}
      editingItem.value = null
    }

    const editRecipeItem = (item) => {
      editingItem.value = item
      Object.assign(form, {
        id_bahan_baku: item.id_bahan_baku,
        jumlah_per_porsi: item.jumlah_per_porsi,
        fixed_amount: item.fixed_amount,
        is_fixed_amount: item.is_fixed_amount,
        satuan: item.satuan,
        catatan: item.catatan || '',
        is_primary: item.is_primary,
        waste_factor: item.waste_factor
      })
      showAddForm.value = true
    }

    const prepareFormData = () => {
      // Clean form data based on amount type
      const cleanedForm = { ...form }

      if (form.is_fixed_amount) {
        // For fixed amount, ensure jumlah_per_porsi is null/0
        cleanedForm.jumlah_per_porsi = 0
      } else {
        // For per-portion, ensure fixed_amount is null/0
        cleanedForm.fixed_amount = 0
      }

      return cleanedForm
    }

    const saveRecipeItem = async () => {
      console.log('saveRecipeItem called')
      console.log('Form data:', form)
      console.log('Editing item:', editingItem.value)

      // Prepare clean form data
      const cleanForm = prepareFormData()
      console.log('Clean form data:', cleanForm)

      // Validation
      const validation = recipeService.validateRecipeItem(cleanForm)
      if (!validation.isValid) {
        console.log('Validation failed:', validation.errors)
        errors.value = validation.errors
        return
      }

      saving.value = true

      try {
        let response
        if (editingItem.value) {
          response = await recipeService.updateRecipeItem(editingItem.value.id, {
            id_menu: selectedMenuId.value,
            id_bahan_baku: cleanForm.id_bahan_baku,
            jumlah_per_porsi: cleanForm.jumlah_per_porsi,
            fixed_amount: cleanForm.fixed_amount,
            is_fixed_amount: cleanForm.is_fixed_amount,
            satuan: cleanForm.satuan,
            catatan: cleanForm.catatan,
            is_primary: cleanForm.is_primary,
            waste_factor: cleanForm.waste_factor
          })
        } else {
          response = await recipeService.addRecipeItem({
            id_menu: selectedMenuId.value,
            ...cleanForm
          })
        }

        toast.success(response.message || 'Data berhasil disimpan')
        closeForm()
        await loadMenuRecipe()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menyimpan data')
        console.error(error)
      } finally {
        saving.value = false
      }
    }

    const updateRecipeItem = async (item) => {
      try {
        await recipeService.updateRecipeItem(item.id, {
          jumlah_per_porsi: item.jumlah_per_porsi,
          waste_factor: item.waste_factor,
          is_primary: item.is_primary
        })
      } catch (error) {
        toast.error('Gagal mengupdate data')
        console.error(error)
        // Reload to restore original values
        await loadMenuRecipe()
      }
    }

    const closeForm = () => {
      showAddForm.value = false
      resetForm()
    }

    const confirmDelete = (item) => {
      deletingItem.value = item
      showDeleteModal.value = true
    }

    const deleteRecipeItem = async () => {
      try {
        await recipeService.deleteRecipeItem(deletingItem.value.id)
        toast.success('Bahan berhasil dihapus dari resep')
        showDeleteModal.value = false
        await loadMenuRecipe()
      } catch (error) {
        toast.error('Gagal menghapus bahan')
        console.error(error)
      }
    }

    const openCalculator = () => {
      emit('openCalculator', {
        menu: selectedMenu.value,
        recipeItems: recipeItems.value
      })
    }

    const exportRecipe = () => {
      // Create CSV content
      let csvContent = "No,Bahan Baku,Kategori,Jumlah/Porsi,Satuan,Waste Factor,Bahan Utama,Catatan\n"

      recipeItems.value.forEach((item, index) => {
        const row = [
          index + 1,
          `"${item.bahan_baku?.nama_bahan_baku || ''}"`,
          `"${item.bahan_baku?.kategori || ''}"`,
          item.jumlah_per_porsi || 0,
          `"${item.satuan || ''}"`,
          `${((item.waste_factor - 1) * 100).toFixed(0)}%`,
          item.is_primary ? 'Ya' : 'Tidak',
          `"${item.catatan || ''}"`
        ]
        csvContent += row.join(',') + '\n'
      })

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `resep-${selectedMenu.value?.nama_menu || 'menu'}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Resep berhasil diekspor')
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadMenus(),
        loadAvailableIngredients()
      ])

      if (props.initialMenuId) {
        selectedMenuId.value = props.initialMenuId
        await loadMenuRecipe()
      }
    })

    return {
      // Data
      loading,
      saving,
      selectedMenuId,
      menuList,
      selectedMenu,
      recipeItems,
      availableIngredients,
      showAddForm,
      editingItem,
      form,
      errors,
      showDeleteModal,
      deletingItem,

      // Options
      unitOptions,
      wasteFactorOptions,

      // Methods
      loadMenuRecipe,
      editRecipeItem,
      saveRecipeItem,
      updateRecipeItem,
      closeForm,
      confirmDelete,
      deleteRecipeItem,
      openCalculator,
      exportRecipe
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.badge {
  font-size: 0.75em;
}
</style>