<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-2">
          <i class="bi bi-cart4 text-primary me-2"></i>Perencanaan Belanja
        </h2>
        <p class="text-muted">Hitung kebutuhan belanja berdasarkan menu dan jenis porsi</p>
      </div>
    </div>

    <!-- Saved Plans List -->
    <div class="card mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-primary">
          <i class="bi bi-clock-history me-2"></i>Riwayat Rencana Belanja
        </h5>
        <button class="btn btn-sm btn-outline-secondary" @click="loadPlans">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
          <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                   <th>Tanggal Rencana</th>
                   <th>Menu</th>
                   <th>Keterangan</th>
                   <th>Waktu Dibuat</th>
                   <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="plan in planList" :key="plan.id_shopping_plan" :class="{'table-info': editPlanId === plan.id_shopping_plan}">
                   <td>{{ formatDate(plan.tanggal_rencana) }}</td>
                   <td>
                      <span v-if="plan.nama_menu" class="badge bg-info text-dark">
                        {{ plan.nama_menu }}
                      </span>
                      <span v-else class="text-muted small">-</span>
                   </td>
                   <td>{{ plan.keterangan || '-' }}</td>
                   <td>{{ formatTime(plan.created_at) }}</td>
                   <td class="text-center">
                   <button 
                      class="btn btn-sm me-2" 
                      :class="editPlanId === plan.id_shopping_plan ? 'btn-primary' : 'btn-outline-primary'"
                      @click="selectPlan(plan.id_shopping_plan)"
                   >
                      <i class="bi" :class="editPlanId === plan.id_shopping_plan ? 'bi-pencil-fill' : 'bi-pencil'"></i>
                      {{ editPlanId === plan.id_shopping_plan ? 'Sedang Diedit' : 'Edit' }}
                   </button>
                   <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="deletePlan(plan.id_shopping_plan)"
                      title="Hapus Rencana"
                   >
                      <i class="bi bi-trash"></i>
                   </button>
                </td>
              </tr>
              <tr v-if="planList.length === 0">
                 <td colspan="4" class="text-center py-4 text-muted">Belum ada data rencana belanja.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Planning Form -->
    <div class="card mb-4 border-primary border-top-3 shadow-sm" style="border-top-width: 4px !important;">
       <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <h5 class="mb-0">
             <i class="bi bi-ui-checks me-2"></i>Formulir Perencanaan
             <span v-if="editPlanId" class="badge bg-warning text-dark ms-2">Mode Edit</span>
             <span v-else class="badge bg-success ms-2">Mode Baru</span>
          </h5>
          <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
             <!-- Import Menu Button -->
             <div class="dropdown w-100 w-md-auto" :class="{ 'show': menuDropdownOpen }">
                <button 
                  class="btn btn-outline-secondary dropdown-toggle d-flex justify-content-between align-items-center mb-0 w-100 w-md-auto" 
                  type="button" 
                  @click="menuDropdownOpen = !menuDropdownOpen"
                  :aria-expanded="menuDropdownOpen"
                  style="min-width: 0;"
                >
                  {{ selectedImportMenuIds.length ? selectedImportMenuIds.length + ' Menu Dipilih' : '-- Pilih Menu --' }}
                </button>
                <ul class="dropdown-menu p-2" :class="{ 'show': menuDropdownOpen }" style="max-height: 300px; overflow-y: auto; display: block; width: 300px;" v-if="menuDropdownOpen">
                  <li v-for="m in menuList" :key="m.id_menu" class="mb-1">
                    <div class="px-2 py-1 rounded hover-bg d-flex align-items-center gap-2" @click.stop>
                      <input class="form-check-input mt-0" type="checkbox" :value="m.id_menu" v-model="selectedImportMenuIds" :id="'menu-chk-'+m.id_menu" style="cursor: pointer;">
                      <label class="form-check-label w-100" :for="'menu-chk-'+m.id_menu" style="cursor: pointer;">
                        {{ m.nama_menu }}
                      </label>
                    </div>
                  </li>
                  <li v-if="menuList.length === 0" class="text-center text-muted py-2">
                     Tidak ada menu
                  </li>
                </ul>
                <!-- Overlay -->
                 <div v-if="menuDropdownOpen" @click="menuDropdownOpen = false" style="position: fixed; top:0; left:0; width:100%; height:100%; z-index: 900;"></div>
             </div>
             <button class="btn btn-outline-success" type="button" @click="importFromMenu" :disabled="selectedImportMenuIds.length === 0">
                <i class="bi bi-box-arrow-in-down me-1"></i>Impor
             </button>

             <button v-if="editPlanId" class="btn btn-outline-danger btn-sm" @click="resetForm">
                <i class="bi bi-x-circle me-1"></i>Batal Edit
             </button>
          </div>
       </div>
       <div class="card-body">
         <div class="row align-items-end mb-3">
            <div class="col-md-4">
               <label class="form-label">Tanggal Rencana</label>
               <input type="date" class="form-control" v-model="form.tanggal_rencana">
            </div>
            <div class="col-md-4">
               <label class="form-label">Penerima Manfaat</label>
               <div class="dropdown" :class="{ 'show': dropdownOpen }">
                  <button 
                    class="btn btn-outline-secondary dropdown-toggle w-100 text-start d-flex justify-content-between align-items-center" 
                    type="button" 
                    @click="dropdownOpen = !dropdownOpen"
                    :aria-expanded="dropdownOpen"
                  >
                    {{ form.penerima_ids.length ? form.penerima_ids.length + ' Dipilih' : '-- Pilih Penerima Manfaat --' }}
                  </button>
                  <ul class="dropdown-menu w-100 p-2" :class="{ 'show': dropdownOpen }" style="max-height: 300px; overflow-y: auto; display: block;" v-if="dropdownOpen">
                    <li v-for="pm in penerimaManfaatList" :key="pm.id_penerima" class="mb-1">
                      <div class="px-2 py-1 rounded hover-bg d-flex align-items-start gap-2" @click.stop>
                        <input class="form-check-input mt-1" type="checkbox" :value="pm.id_penerima" v-model="form.penerima_ids" :id="'chk-'+pm.id_penerima" style="cursor: pointer;">
                        <label class="form-check-label w-100" :for="'chk-'+pm.id_penerima" style="cursor: pointer;">
                          <div><strong>{{ pm.nama_lembaga }}</strong></div>
                          <div class="text-muted small" style="font-size: 0.8em">
                             Porsi: {{ pm.porsi_besar }}/{{ pm.porsi_sedang }}/{{ pm.porsi_kecil }}
                          </div>
                        </label>
                      </div>
                    </li>
                    <li v-if="penerimaManfaatList.length === 0" class="text-center text-muted py-2">
                       Tidak ada data
                    </li>
                  </ul>
               </div>
               <!-- Overlay to close dropdown when clicking outside -->
               <div v-if="dropdownOpen" @click="dropdownOpen = false" style="position: fixed; top:0; left:0; width:100%; height:100%; z-index: 900;"></div>
            </div>
            <div class="col-md-4">
               <label class="form-label">Keterangan</label>
               <input type="text" class="form-control" v-model="form.keterangan" placeholder="Contoh: Belanja Mingguan Periode A">
            </div>
         </div>

          <div class="card bg-light border-0 mb-3" v-if="uniqueImportedMenus.length > 0">
             <div class="card-body p-2">
                <h6 class="text-primary mb-2 small fw-bold"><i class="bi bi-calculator me-1"></i>Ringkasan Target Porsi per Kategori Menu</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered mb-0 bg-white" style="font-size: 0.85em;">
                      <thead class="table-secondary text-center">
                        <tr>
                          <th>Kategori</th>
                          <th>Menu Included</th>
                          <th>Porsi Besar</th>
                          <th>Porsi Sedang</th>
                          <th>Porsi Kecil</th>
                          <th>Total Porsi</th>
                        </tr>
                      </thead>
                      <tbody class="text-center align-middle">
                        <tr v-for="(val, cat) in portionsByCategory" :key="cat" :class="{'table-warning': cat==='Kering', 'table-info': cat==='Basah'}">
                          <td class="fw-bold text-start ps-3">{{ cat }}</td>
                          <td class="text-start fst-italic text-muted">{{ val.menuNames.join(', ') }}</td>
                          <td>{{ val.besar }}</td>
                          <td>{{ val.sedang }}</td>
                          <td>{{ val.kecil }}</td>
                          <td class="fw-bold">{{ val.besar + val.sedang + val.kecil }}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
             </div>
          </div>
          <div v-else class="alert alert-info d-flex align-items-center gap-3 py-2 mb-0">
             <i class="bi bi-info-circle-fill fs-5"></i>
             <div>
                 <strong>Info:</strong> Belum ada menu yang dipilih. Silahkan pilih menu untuk melihat ringkasan porsi.
             </div>
          </div>
       </div>
    </div>

    <!-- Planning Form -->
    <div class="card mb-4">
      <div class="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <h5 class="mb-0 w-100 w-md-auto">
           Rencana Menu 
           <span v-if="uniqueImportedMenus.length > 0" class="badge bg-info text-dark ms-2 text-start d-inline-block align-middle">
              <ul class="list-unstyled mb-0 d-inline-block text-start align-middle">
                 <li v-for="menu in uniqueImportedMenus" :key="menu.id_menu">
                    <i class="bi bi-journal-text me-1"></i> {{ menu.nama_menu }}
                 </li>
              </ul>
           </span>
        </h5>
        <div class="d-flex gap-2 mt-2 mt-md-0 w-100 w-md-auto">
            <button class="btn btn-outline-secondary btn-sm flex-grow-1 flex-md-grow-0" @click="showDistribusi = !showDistribusi" v-if="uniqueImportedMenus.length > 0">
               <i class="bi bi-people-fill me-1"></i>Distribusi Menu
            </button>
            <button class="btn btn-outline-primary btn-sm flex-grow-1 flex-md-grow-0" @click="addRow">
              <i class="bi bi-plus-lg me-1"></i>Tambah Baris
            </button>
        </div>
      </div>
      
      <!-- Menu Distribution Config -->
      <div class="card-body bg-light border-bottom" v-if="showDistribusi && uniqueImportedMenus.length > 0">
          <h6 class="text-primary mb-3"><i class="bi bi-sliders me-2"></i>Konfigurasi Penerima per Menu</h6>
          <div class="row g-3">
             <div class="col-md-6 col-lg-4" v-for="menu in uniqueImportedMenus" :key="menu.id_menu">
                 <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-white py-2 fw-bold text-truncate" :title="menu.nama_menu">
                       {{ menu.nama_menu }}
                    </div>
                    <div class="card-body p-2" style="max-height: 200px; overflow-y: auto;">
                       <div v-if="form.penerima_ids.length === 0" class="text-muted small text-center py-2">
                          Pilih Penerima Manfaat utama terlebih dahulu.
                       </div>
                       <div v-else>
                          <div class="form-check mb-1" v-for="pid in form.penerima_ids" :key="pid">
                             <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :checked="isBeneficiarySelectedForMenu(menu.id_menu, pid)"
                                @change="toggleBeneficiaryForMenu(menu.id_menu, pid)"
                                :id="'dist-'+menu.id_menu+'-'+pid"
                             >
                             <label class="form-check-label small text-truncate d-block" :for="'dist-'+menu.id_menu+'-'+pid">
                                {{ getPenerimaName(pid) }}
                             </label>
                          </div>
                       </div>
                    </div>
                    <div class="card-footer bg-white p-1 text-center">
                       <button class="btn btn-link btn-xs text-decoration-none p-0" style="font-size: 0.75rem;" @click="selectAllForMenu(menu.id_menu)">Pilih Semua</button>
                    </div>
                 </div>
             </div>
          </div>
      </div>

      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered align-middle table-sm" style="font-size: 0.9em;">
            <thead class="table-light text-center align-middle">
              <tr>

                <th rowspan="2" style="min-width: 200px;">Bahan Pangan</th>
                <th colspan="4" class="bg-success bg-opacity-10">Porsi Kecil (K)</th>
                <th colspan="4" class="bg-warning bg-opacity-10">Porsi Besar (B)</th>
                <th rowspan="2" style="width: 8%">Total</th>
                <th rowspan="2" style="width: 7%">Buffer (%)</th>
                <th rowspan="2" style="width: 8%">Total + Buffer</th>
                <th rowspan="2" style="width: 5%">Aksi</th>
              </tr>
              <tr>
                <!-- Kecil -->
                <th class="bg-success bg-opacity-10" style="min-width: 80px;">Net (g)</th>
                <th class="bg-success bg-opacity-10" style="min-width: 80px;">Gross (g)</th>
                <th class="bg-success bg-opacity-10" style="width: 6%">Jml</th>
                <th class="bg-success bg-opacity-10" style="width: 7%">Butuh (kg)</th>
                <!-- Besar -->
                <th class="bg-warning bg-opacity-10" style="min-width: 80px;">Net (g)</th>
                <th class="bg-warning bg-opacity-10" style="min-width: 80px;">Gross (g)</th>
                <th class="bg-warning bg-opacity-10" style="width: 6%">Jml</th>
                <th class="bg-warning bg-opacity-10" style="width: 7%">Butuh (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index">

                <td>
                  <select class="form-select form-select-sm" v-model="item.id_bahan_baku" @change="onIngredientSelect(item)" required>
                    <option value="" disabled>Pilih Bahan</option>
                    <option v-for="bahan in bahanBakuList" :key="bahan.id_bahan_baku" :value="bahan.id_bahan_baku">
                      {{ bahan.nama_bahan_baku }}
                    </option>
                  </select>
                  <div class="text-muted text-xs mt-1" v-if="item.bdd && item.bdd != 100">BDD: {{ item.bdd }}%</div>
                </td>

                <!-- Porsi Kecil -->
                <td class="bg-success bg-opacity-10">
                   <input type="number" class="form-control form-control-sm text-end" v-model.number="item.bb_k" placeholder="0" step="0.1">
                </td>
                <td class="bg-success bg-opacity-10">
                   <input type="number" class="form-control form-control-sm text-end" v-model.number="item.bk_k" placeholder="0" step="0.1">
                </td>
                <td class="bg-success bg-opacity-10 text-center">
                   {{ item.jml_k }}
                </td>
                <td class="bg-success bg-opacity-10 text-end fw-bold">
                   {{ calcNeed(item.bb_k, item.jml_k, item.id_bahan_baku) }}
                </td>

                <!-- Porsi Besar -->
                <td class="bg-warning bg-opacity-10">
                   <input type="number" class="form-control form-control-sm text-end" v-model.number="item.bb_b" placeholder="0" step="0.1">
                </td>
                <td class="bg-warning bg-opacity-10">
                   <input type="number" class="form-control form-control-sm text-end" v-model.number="item.bk_b" placeholder="0" step="0.1">
                </td>
                <td class="bg-warning bg-opacity-10 text-center">
                   {{ item.jml_b }}
                </td>
                <td class="bg-warning bg-opacity-10 text-end fw-bold">
                   {{ calcNeed(item.bb_b, item.jml_b, item.id_bahan_baku) }}
                </td>

                <!-- Totals -->
                <td class="text-end fw-bold bg-light">
                   {{ calculateRowTotal(item) }}
                </td>
                <td>
                   <input type="number" class="form-control form-control-sm text-center" v-model.number="item.buffer_percent" placeholder="0">
                </td>
                <td class="text-end fw-bold text-primary">
                    {{ calculateRowGrandTotal(item) }}
                </td>
                 <td class="text-center">
                   <button class="btn btn-outline-danger btn-sm py-0 border-0" @click="removeRow(index)" v-if="items.length > 1">
                     <i class="bi bi-trash"></i>
                   </button>
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-end mt-3">
         <button class="btn btn-primary" @click="calculateAndSave" :disabled="loading || !isValid">
            <i class="bi bi-save me-1"></i>
            <span v-if="loading">Menyimpan...</span>
            <span v-else>Simpan Rencana</span>
          </button>
       </div>
    </div>
  </div>
  </div>
</template>

<script>
import api from '@/services/api'
import distribusiMakananService from '@/services/distribusiMakananService'
import bahanBakuService from '@/services/bahanBakuService'
import penerimaManfaatService from '@/services/penerimaManfaatService'
import { useToast } from 'vue-toastification'

export default {
  name: 'ShoppingListView',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      loading: false,
      editPlanId: '',
      selectedImportMenuIds: [],
      menuDropdownOpen: false,
      planList: [],
      form: {
         id_shopping_plan: null,
         tanggal_rencana: new Date().toISOString().split('T')[0],
         keterangan: '',
         penerima_ids: []
      },
      dropdownOpen: false,
      menuList: [],
      jenisPorsiList: [],
      bahanBakuList: [],
      penerimaManfaatList: [],
      items: [
        { 
          type: 'manual', 
          id_menu: '', 
          id_bahan_baku: '',
          berat_bersih: 0,
          berat_kotor: 0,
          buffer_percent: 5,
          bdd: 100
        }
      ],
      results: [],
      // Map of menu_id -> [penerima_ids]
      menuBeneficiaryMap: {},
      isEditing: false, 
      showDistribusi: true
    }
  },
  computed: {
    isValid() {
      // Menu is optional, Bahan is required, Weights required (check > 0)
      return this.items.every(i => i.id_bahan_baku && (i.bk_k > 0 || i.bk_b > 0))
    },
    totalPortions() {
      if (!this.form.penerima_ids.length) return null
      
      const total = { besar: 0, sedang: 0, kecil: 0 }
      this.form.penerima_ids.forEach(id => {
         const p = this.penerimaManfaatList.find(pm => pm.id_penerima === id)
         if (p) {
            total.besar += (p.porsi_besar || 0)
            total.sedang += (p.porsi_sedang || 0)
            total.kecil += (p.porsi_kecil || 0)
         }
      })
      return total
    },
    totalPortionsCount() {
       if (!this.totalPortions) return 0
       return this.totalPortions.besar + this.totalPortions.sedang + this.totalPortions.kecil
    },
    importedMenusString() {
      if (!this.items || this.items.length === 0) return ''
      const uniqueIds = [...new Set(this.items.map(i => i.id_menu).filter(id => id))]
      if (uniqueIds.length === 0) return ''
      
       return uniqueIds.map(id => {
          const m = this.menuList.find(x => x.id_menu === id)
          return m ? m.nama_menu : '?'
       }).join(', ')
    },
    uniqueImportedMenus() {
       if (!this.items) return []
       const uniqueIds = [...new Set(this.items.map(i => i.id_menu).filter(id => id))]
       return uniqueIds.map(id => this.menuList.find(m => m.id_menu === id)).filter(m => m)
    },
    portionsByCategory() {
        const stats = {
            'Basah': { besar: 0, sedang: 0, kecil: 0, menuNames: [] },
            'Kering': { besar: 0, sedang: 0, kecil: 0, menuNames: [] },
            'Lainnya': { besar: 0, sedang: 0, kecil: 0, menuNames: [] }
        }

        this.uniqueImportedMenus.forEach(menu => {
            const cat = (menu.kategori === 'Basah' || menu.kategori === 'Kering') ? menu.kategori : 'Lainnya'
            
            // Get beneficiaries for this menu
            let pIds = this.menuBeneficiaryMap[menu.id_menu]
            // Fallback if not in map yet (should be init, but safety first)
            if (!pIds) pIds = [...this.form.penerima_ids]
            
            // Calc stats
            let b=0, s=0, k=0
            pIds.forEach(id => {
                 if (!this.form.penerima_ids.includes(id)) return // Filter out unselected global
                 const pm = this.penerimaManfaatList.find(p => p.id_penerima === id)
                 if (pm) {
                    b += (pm.porsi_besar || 0)
                    s += (pm.porsi_sedang || 0)
                    k += (pm.porsi_kecil || 0)
                 }
            })

            stats[cat].besar += b
            stats[cat].sedang += s
            stats[cat].kecil += k
            stats[cat].menuNames.push(menu.nama_menu)
        })

        // Filter out empty categories
        const result = {}
        if (stats['Basah'].menuNames.length) result['Basah'] = stats['Basah']
        if (stats['Kering'].menuNames.length) result['Kering'] = stats['Kering']
        if (stats['Lainnya'].menuNames.length) result['Lainnya'] = stats['Lainnya']
        
        return result
    }
  },
  watch: {
    'form.penerima_ids': {
       deep: true,
       handler(newIds) {
          // Sync map: Remove unchecked global IDs from all menu maps
          // Add new global IDs to all menu maps (default: include)
          
          const currentMap = { ...this.menuBeneficiaryMap }
          
          this.uniqueImportedMenus.forEach(m => {
             const mid = m.id_menu
             if (!currentMap[mid]) {
                 currentMap[mid] = [...newIds]
             } else {
                 // Filter to only valid IDs
                 // Filter to only valid IDs
                 currentMap[mid] = currentMap[mid].filter(id => newIds.includes(id))
                 // Optionally: Auto-add new IDs? Yes, default behavior usually expects newly added PMs to get everything.
                 if (!this.isEditing) {
                     newIds.forEach(id => {
                         if (!currentMap[mid].includes(id)) currentMap[mid].push(id)
                     })
                 }
             }
          })
          
          this.menuBeneficiaryMap = currentMap
          this.recalcAllPortions()
       }
    }
  },
    async created() {
    await this.loadMasterData()
    await this.loadPlans()
  },
  methods: {
     formatDate(date) {
       if (!date) return '-'
       return new Date(date).toLocaleDateString('id-ID', {
         day: '2-digit', month: '2-digit', year: 'numeric'
       })
     },
     formatTime(date) {
       if (!date) return '-'
       return new Date(date).toLocaleString('id-ID', {
         day: '2-digit', month: '2-digit', year: 'numeric',
         hour: '2-digit', minute: '2-digit'
       })
     },
    async loadPlans() {
       try {
          const res = await api.get('/calculator/plans')
          this.planList = res.data.data
       } catch (err) {
          console.error(err)
       }
    },
    async loadMasterData() {
      // 1. Load Menus
      try {
        const menuRes = await distribusiMakananService.getMenu()
        this.menuList = menuRes.data || []
      } catch (err) {
        console.error('Error loading menus:', err)
      }

      // 2. Load Jenis Porsi
      try {
        const porsiRes = await distribusiMakananService.getJenisPorsi()
        this.jenisPorsiList = porsiRes.data || []
      } catch (err) {
        console.error('Error loading jenis porsi:', err)
      }

      // 3. Load Bahan Baku
      try {
        const bahanRes = await api.get('/bahan-baku?per_page=1000')
        this.bahanBakuList = bahanRes.data?.data || []
      } catch (err) {
        console.error('Error loading bahan baku:', err)
      }

      // 4. Load Penerima Manfaat
      try {
        console.log('Fetching penerima manfaat...')
        const penerimaRes = await penerimaManfaatService.getAll()
        console.log('Penerima Manfaat Response:', penerimaRes)
        
        if (penerimaRes && penerimaRes.data) {
           this.penerimaManfaatList = penerimaRes.data
        } else if (Array.isArray(penerimaRes)) {
           this.penerimaManfaatList = penerimaRes
        } else {
           console.warn('Unexpected format for Penerima Manfaat:', penerimaRes)
           this.penerimaManfaatList = []
        }
      } catch (err) {
        console.error('Error loading penerima manfaat:', err)
        this.toast.error('Gagal memuat data penerima manfaat: ' + err.message)
      }
    },
    async deletePlan(id) {
       if (!confirm('Apakah Anda yakin ingin menghapus rencana belanja ini? Data yang dihapus tidak dapat dikembalikan.')) return;
       
       this.loading = true
       try {
          const res = await api.delete(`/calculator/plans/${id}`)
          if (res.data.success) {
             this.toast.success('Rencana berhasil dihapus')
             this.loadPlans() // Reload list
             
             // Reset form if deleting currently edited plan
             if (this.editPlanId === id) {
                 this.resetForm()
             }
          }
       } catch (err) {
          console.error(err)
          this.toast.error('Gagal menghapus rencana')
       } finally {
          this.loading = false
       }
    },
    async selectPlan(id) {
       if (this.editPlanId === id) return;
       this.editPlanId = id;
       await this.loadPlanForEdit();
    },
    resetForm() {
       this.editPlanId = '';
       this.selectedImportMenuIds = [];
       this.loadPlanForEdit(); 
    },
    async importFromMenu() {
        if (!this.selectedImportMenuIds.length) return;
        
        this.loading = true;
        try {
            let totalAdded = 0;
            const portions = this.totalPortions || { besar: 0, sedang: 0, kecil: 0 };
            
            // Clear default empty row if present and it's the only one
            if (this.items.length === 1 && !this.items[0].id_bahan_baku && !this.items[0].id_menu) {
                this.items = [];
            } else {
               // If existing items, confirm? No, just append.
            }

            for (const menuId of this.selectedImportMenuIds) {
                 const menu = this.menuList.find(m => m.id_menu === menuId);
                 if (!menu) continue;

                 const ingredients = menu.menu_bahans || [];
                 if (ingredients.length === 0) continue;

                 ingredients.forEach(ing => {
                     // Try to get bahan directly or look it up in master list
                     let bahan = ing.bahan_baku;
                     if (!bahan && ing.id_bahan_baku && this.bahanBakuList) {
                        bahan = this.bahanBakuList.find(b => b.id_bahan_baku === ing.id_bahan_baku);
                     }
                     
                     if (!bahan) return;

                     // Get BDD
                     const bddVal = parseFloat(bahan.komposisi_pangan?.bdd || 100);

                     const newItem = {
                         type: 'menu',
                         id_menu: menu.id_menu, 
                         id_bahan_baku: bahan.id_bahan_baku,
                         // Zero / Empty Defaults
                         bb_k: null, 
                         bk_k: null, 
                         jml_k: portions.kecil,
                         
                         bb_b: null,
                         bk_b: null,
                         jml_b: (portions.besar + portions.sedang),
                         
                         buffer_percent: 5,
                         bdd: bddVal
                     };
                     
                     this.items.push(newItem);
                     totalAdded++;
                 });
            }

            if (totalAdded > 0) {
                this.toast.success(`Berhasil mengimpor items dari ${this.selectedImportMenuIds.length} menu.`);
                this.selectedImportMenuIds = []; 
                this.menuDropdownOpen = false;
                
                // Initialize Map for new menus
                const newMap = { ...this.menuBeneficiaryMap };
                this.uniqueImportedMenus.forEach(m => {
                   if (!newMap[m.id_menu]) {
                       newMap[m.id_menu] = [...this.form.penerima_ids];
                   }
                });
                this.menuBeneficiaryMap = newMap;
                
                this.recalcAllPortions();
            } else {
               this.toast.warning("Tidak ada bahan baku yang ditemukan dalam menu yang dipilih.");
            }

        } catch (err) {
            console.error(err);
            this.toast.error("Gagal mengimpor menu: " + err.message);
        } finally {
            this.loading = false;
        }
    },
    async loadPlanForEdit() {
       if (!this.editPlanId) {
          // Reset
          this.form.id_shopping_plan = null
          this.form.tanggal_rencana = new Date().toISOString().split('T')[0]
          this.form.keterangan = ''
          this.form.penerima_ids = []
          
          this.items = [{ 
               type: 'manual', id_menu: '', id_bahan_baku: '', 
               bb_k: 0, bk_k: 0, bb_b: 0, bk_b: 0, 
               jml_k: 0, jml_b: 0, buffer_percent: 5, bdd: 100 
          }]
          this.addRow()
          return
       }

       this.loading = true
       this.isEditing = true
       try {
          const res = await api.get(`/calculator/plans/${this.editPlanId}`)
          if (res.data.success) {
             const data = res.data.data
             const plan = data.plan
             const details = data.details || []
             
             this.form.id_shopping_plan = plan.id_shopping_plan
             this.form.tanggal_rencana = plan.tanggal_rencana
             this.form.keterangan = plan.keterangan || ''
             this.form.penerima_ids = data.beneficiaries.map(b => b.id_penerima)
             
             // Normalize distributions map (Integrify keys and values)
             const rawDist = plan.distributions || {}
             const normDist = {}
             Object.keys(rawDist).forEach(k => {
                 normDist[parseInt(k)] = (rawDist[k] || []).map(id => parseInt(id))
             })
             this.menuBeneficiaryMap = normDist

             // Reconstruct Items
             const grouped = {}
             // Map IDs
             const getIdPorsi = (name) => {
                if (!this.jenisPorsiList) return null
                const found = this.jenisPorsiList.find(p => p.nama_jenis_porsi.toLowerCase().includes(name.toLowerCase()))
                return found ? found.id_jenis_porsi : null
             }
             const idKecil = getIdPorsi('kecil')
             const idBesar = getIdPorsi('besar')

             details.forEach(d => {
                 const key = `${d.id_menu || ''}_${d.id_bahan_baku}`
                 if (!grouped[key]) {
                      grouped[key] = {
                         type: 'manual',
                         id_menu: d.id_menu || '',
                         id_bahan_baku: d.id_bahan_baku,
                         bb_k: 0, bk_k: 0, jml_k: 0,
                         bb_b: 0, bk_b: 0, jml_b: 0,
                         buffer_percent: parseFloat(d.buffer_percent || 5),
                         bdd: 100
                      }
                 }
                 
                 const g = grouped[key]
                 if (d.id_jenis_porsi == idKecil) {
                     g.bb_k = parseFloat(d.berat_bersih); g.bk_k = parseFloat(d.berat_kotor); g.jml_k = parseFloat(d.jumlah_porsi)
                 } else if (d.id_jenis_porsi == idBesar) {
                     g.bb_b = parseFloat(d.berat_bersih); g.bk_b = parseFloat(d.berat_kotor); g.jml_b = parseFloat(d.jumlah_porsi)
                 }
             })
             this.items = Object.values(grouped)
              
              // Imported menu display is now handled by importedMenusString computed prop

              if (this.items.length === 0) this.addRow()
          }
       } catch (err) {
          console.error(err)
          this.toast.error('Gagal memuat rencana')
       } finally {
          this.loading = false
          this.$nextTick(() => {
              this.isEditing = false
          })
       }
    },
    resetItem(item) {
       // Reset fields when type changes
       item.id_menu = ''
       item.id_bahan_baku = ''
       item.bb_k = 0; item.bk_k = 0;
       item.bb_b = 0; item.bk_b = 0;
       item.bdd = 100
    },
    isWeightBased(id) {
       const bahan = this.bahanBakuList.find(b => b.id_bahan_baku === id)
       if (!bahan) return true // default to weight behavior if unknown
       const u = (bahan.satuan || '').toLowerCase()
       // List units that act as weights/volumes (div by 1000 for display)
       return ['gram', 'gr', 'g', 'kg', 'kilogram', 'ml', 'l', 'liter', 'cc', 'mg'].includes(u)
    },
    calcNeed(net, jml, id) {
       if (!net || !jml) return 0
       const val = net * jml
       // Only divide by 1000 if it is a weight/volume based unit (converting to Kg/L)
       if (this.isWeightBased(id)) {
          return (val / 1000).toFixed(2)
       }
       // Otherwise (pcs, butir, etc) return direct value
       return val
    },
    onIngredientSelect(item) {
       const bahan = this.bahanBakuList.find(b => b.id_bahan_baku === item.id_bahan_baku)
       if (bahan) {
          // 1. Handle BDD
          if (bahan.komposisi_pangan) {
             item.bdd = parseFloat(bahan.komposisi_pangan.bdd) || 100
          } else {
             item.bdd = 100
          }

          // 2. Handle Unit-based Defaulting
          // If NOT weight based (e.g. pcs, butir), default Net to 1 so Total = Porsi
          if (!this.isWeightBased(item.id_bahan_baku)) {
             item.bb_k = 1; item.bk_k = 1;
             item.bb_b = 1; item.bk_b = 1;
          } else {
             // Reset for manual weight input
             item.bb_k = 0; item.bk_k = 0;
             item.bb_b = 0; item.bk_b = 0;
          }
       }
    },
    // Calcs for Kecil
    calcGrossK(item) {
       // Gross = Net / (BDD/100)
       if (item.bdd > 0) {
          item.bk_k = parseFloat((item.bb_k / (item.bdd / 100)).toFixed(2))
       } else {
          item.bk_k = item.bb_k
       }
    },
    calcNetK(item) {
       // Net = Gross * (BDD/100)
       if (item.bdd > 0) {
          item.bb_k = parseFloat((item.bk_k * (item.bdd / 100)).toFixed(2))
       } else {
          item.bb_k = item.bk_k
       }
    },
    // Calcs for Besar
    calcGrossB(item) {
       if (item.bdd > 0) {
          item.bk_b = parseFloat((item.bb_b / (item.bdd / 100)).toFixed(2))
       } else {
          item.bk_b = item.bb_b
       }
    },
    calcNetB(item) {
       if (item.bdd > 0) {
          item.bb_b = parseFloat((item.bk_b * (item.bdd / 100)).toFixed(2))
       } else {
          item.bb_b = item.bk_b
       }
    },
    calculateRowTotal(item) {
       const wBased = this.isWeightBased(item.id_bahan_baku)
       const totK = (item.bb_k || 0) * (item.jml_k || 0)
       const totB = (item.bb_b || 0) * (item.jml_b || 0)
       const total = totK + totB
       
       if (wBased) return (total / 1000).toFixed(2)
       return total.toFixed(2)
    },
    calculateRowGrandTotal(item) {
       const rawTotal = parseFloat(this.calculateRowTotal(item))
       // Note: calculateRowTotal already handles /1000 logic appropriately
       const buffer = (item.buffer_percent || 0) / 100
       const grand = rawTotal * (1 + buffer)
       return grand.toFixed(2)
    },
    getMenuName(id) {
       const m = this.menuList.find(x => x.id_menu === id);
       return m ? m.nama_menu : '-';
    },
    getBahanName(id) {
       const b = this.bahanBakuList.find(x => x.id_bahan_baku === id);
       return b ? b.nama_bahan : '-';
    },
    addRow() {
      this.items.push({
        type: 'manual',
        id_menu: '',
        id_bahan_baku: '',
        bb_k: 0,
        bk_k: 0,
        bb_b: 0,
        bk_b: 0,
        jml_k: 0,
        jml_b: 0,
        buffer_percent: 5,
        bdd: 100
      })
    },

    // Menu Distribution Helpers
    getPenerimaName(id) {
        const pm = this.penerimaManfaatList.find(p => p.id_penerima === id)
        return pm ? pm.nama_lembaga : id
    },
    isBeneficiarySelectedForMenu(menuId, pId) {
        const list = this.menuBeneficiaryMap[menuId]
        if (!list) return true // Default to selected if no map entry
        return list.includes(pId)
    },
    toggleBeneficiaryForMenu(menuId, pId) {
        if (!this.menuBeneficiaryMap[menuId]) {
            this.menuBeneficiaryMap[menuId] = [...this.form.penerima_ids]
        }
        
        const list = this.menuBeneficiaryMap[menuId]
        const idx = list.indexOf(pId)
        if (idx > -1) {
            list.splice(idx, 1)
        } else {
            list.push(pId)
        }
        this.recalcAllPortions()
    },
    selectAllForMenu(menuId) {
        this.menuBeneficiaryMap[menuId] = [...this.form.penerima_ids]
        this.recalcAllPortions()
    },
    
    // Core Logic
    recalcAllPortions() {
        this.items.forEach(item => {
             // Calculate portions for this item
             let pIds = []
             if (item.id_menu) {
                 // Use map or default to all
                 // Ensure map exists
                 if (!this.menuBeneficiaryMap[item.id_menu]) {
                      pIds = [...this.form.penerima_ids]
                 } else {
                      pIds = this.menuBeneficiaryMap[item.id_menu]
                 }
             } else {
                 // Manual item -> Use all global
                 pIds = this.form.penerima_ids
             }

             // Sum up
             let total = { besar: 0, sedang: 0, kecil: 0 }
             pIds.forEach(id => {
                 // IMPORTANT: Only count if ID is in global list (safety check)
                 if (!this.form.penerima_ids.includes(id)) return
                 
                 const pm = this.penerimaManfaatList.find(p => p.id_penerima === id)
                 if (pm) {
                    total.besar += (pm.porsi_besar || 0)
                    total.sedang += (pm.porsi_sedang || 0)
                    total.kecil += (pm.porsi_kecil || 0)
                 }
             })
             
             item.jml_k = total.kecil
             item.jml_b = total.besar + total.sedang
        })
    },

    removeRow(index) {
      this.items.splice(index, 1)
    },
    async calculateAndSave() {
      this.loading = true
      // Transform UI items to Backend items (Split K and B)
      const splitItems = []
      
      // Try to map porsi IDs
      const getIdPorsi = (name) => {
         if (!this.jenisPorsiList) return null
         const found = this.jenisPorsiList.find(p => p.nama_jenis_porsi.toLowerCase().includes(name.toLowerCase()))
         return found ? found.id_jenis_porsi : null
      }
      const idKecil = getIdPorsi('kecil')
      const idBesar = getIdPorsi('besar')

      this.items.forEach(item => {
          if (!item.id_bahan_baku) return
          
          if (item.jml_k > 0) {
             splitItems.push({
                type: 'manual',
                id_menu: item.id_menu,
                id_bahan_baku: item.id_bahan_baku,
                id_jenis_porsi: idKecil,
                jumlah_porsi: item.jml_k,
                berat_bersih: item.bb_k,
                berat_kotor: item.bk_k,
                buffer_percent: item.buffer_percent
             })
          }
          if (item.jml_b > 0) {
              splitItems.push({
                type: 'manual',
                id_menu: item.id_menu,
                id_bahan_baku: item.id_bahan_baku,
                id_jenis_porsi: idBesar,
                jumlah_porsi: item.jml_b,
                berat_bersih: item.bb_b,
                berat_kotor: item.bk_b,
                buffer_percent: item.buffer_percent
             })
          }
      })
      
      try {
         // Direct Save
         const payload = {
            id_shopping_plan: this.form.id_shopping_plan, // Send ID for update
            tanggal_rencana: this.form.tanggal_rencana,
            keterangan: this.form.keterangan,
            penerima_ids: this.form.penerima_ids,
            distributions: this.menuBeneficiaryMap, // Save distribution map
            items: splitItems
         }

         const res = await api.post('/calculator/planning/save', payload)
         
         if (res.data.success) {
             this.toast.success('Rencana menu berhasil disimpan!')
             // Reload list
             await this.loadPlans()
             
             // Reset
             this.results = [] 
             this.editPlanId = ''
             this.form.id_shopping_plan = null
             this.form.penerima_ids = []
             this.form.keterangan = ''
             this.items = [{ type: 'manual', id_menu: '', id_bahan_baku: '', bb_k: 0, bk_k: 0, bb_b: 0, bk_b: 0, jml_k: 0, jml_b: 0, buffer_percent: 5, bdd: 100 }]
             this.addRow()
         } else {
             this.toast.error(res.data.message || 'Gagal menyimpan rencana')
         }

      } catch (err) {
         console.error(err)
         this.toast.error('Terjadi kesalahan: ' + err.message)
      } finally {
         this.loading = false
      }
    },
    formatNumber(val) {
      if (!val) return '0'
      return parseFloat(val).toLocaleString('id-ID', { maximumFractionDigits: 2 })
    },
    print() {
      window.print()
    }
  }
}
</script>

<style scoped>
.table th {
  vertical-align: middle;
}
.hover-bg:hover {
  background-color: #f8f9fa;
}
/* Ensure dropdown menu is above overlay */
.dropdown-menu.show {
  z-index: 1050; 
}
</style>
