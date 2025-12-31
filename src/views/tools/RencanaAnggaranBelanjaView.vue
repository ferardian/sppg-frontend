<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-2">
          <i class="bi bi-wallet2 text-primary me-2"></i>Rencana Anggaran Belanja
        </h2>
        <p class="text-muted">Hitung estimasi biaya dan pagu anggaran berdasarkan rencana belanja</p>
      </div>
    </div>

    <!-- Selection Card Replacement: List Table -->
    <div class="card mb-4" v-if="!selectedPlan">
      <div class="card-header bg-white">
        <h5 class="mb-0">Pilih Rencana Belanja</h5>
      </div>
      <div class="card-body p-0">
         <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
                  <tr>
                     <th>Tanggal</th>
                     <th>Menu</th>
                     <th>Keterangan</th>
                     <th class="text-center">Aksi</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="plan in planList" :key="plan.id_shopping_plan">
                     <td>{{ formatDate(plan.tanggal_rencana) }}</td>
                     <td>
                        <div v-if="plan.nama_menu">
                           <ul class="mb-0 ps-3">
                              <li v-for="(menu, mIdx) in plan.nama_menu.split('|||')" :key="mIdx">
                                 {{ menu.trim() }}
                              </li>
                           </ul>
                        </div>
                        <span v-else class="text-muted small">-</span>
                     </td>
                     <td>{{ plan.keterangan || '-' }}</td>
                     <td class="text-center">
                        <button class="btn btn-primary btn-sm" @click="selectAndLoadPlan(plan.id_shopping_plan)">
                           <i class="bi bi-eye me-1"></i> Tampilkan RAB
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

    <!-- Back Button when Plan is Selected -->
    <div class="mb-3" v-if="selectedPlan">
       <button class="btn btn-outline-secondary" @click="clearSelection">
          <i class="bi bi-arrow-left me-1"></i> Kembali ke Daftar Rencana
       </button>
    </div>

    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-primary" role="status"></div>
       <p class="mt-2 text-muted">Memuat data...</p>
    </div>

    <div v-else-if="selectedPlan">
       <!-- 1. Rincian Belanja Table -->
       <div class="card mb-4">
         <div class="card-header bg-white">
            <h5 class="mb-0">Rincian Belanja Barang</h5>
         </div>
         <div class="card-body p-0">
            <div class="table-responsive">
               <table class="table table-striped table-hover align-middle mb-0">
                  <thead class="table-primary">
                     <tr>
                        <th class="text-center" style="width: 5%">No</th>
                        <th>Barang / Bahan Baku</th>
                        <th class="text-center">Volume</th>
                        <th class="text-center">Satuan</th>
                        <th class="text-end">Harga Satuan</th>
                        <th class="text-end" style="width: 15%">Jumlah (Rp)</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(item, index) in shoppingItems" :key="index">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                           <div class="fw-bold">{{ item.nama_bahan_baku }}</div>
                        </td>
                        <td class="text-center">{{ formatNumber(item.total_qty) }}</td>
                        <td class="text-center">{{ item.satuan }}</td>
                        <td class="text-end">
                           Rp {{ formatCurrency(item.harga) }}
                        </td>
                        <td class="text-end fw-bold">
                           Rp {{ formatCurrency(item.total_cost) }}
                        </td>
                     </tr>
                     <tr class="table-light fw-bold">
                        <td colspan="5" class="text-end">TOTAL BELANJA</td>
                        <td class="text-end text-primary fs-5">Rp {{ formatCurrency(totalShoppingCost) }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
       </div>

       <!-- 2. Perhitungan Pagu -->
       <div class="card mb-4">
         <div class="card-header bg-white d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
            <h5 class="mb-0">Perhitungan Pagu Anggaran</h5>
            <div class="d-flex flex-column flex-md-row gap-2 mt-2 mt-lg-0 w-100 w-lg-auto align-items-end">
               <!-- Actions -->
               <div class="btn-group btn-group-sm w-100 w-md-auto">
                   <button class="btn btn-outline-secondary" @click="copyToClipboard" title="Salin ke Clipboard">
                       <i class="bi bi-clipboard"></i> Salin
                   </button>
                   <button class="btn btn-outline-success" @click="exportExcel" title="Export Excel">
                       <i class="bi bi-file-earmark-excel"></i> Excel
                   </button>
                   <button class="btn btn-outline-danger" @click="exportPdf" title="Export PDF">
                       <i class="bi bi-file-earmark-pdf"></i> PDF
                   </button>
               </div>
               
               <div class="input-group input-group-sm w-100 w-md-auto" style="min-width: 150px;">
                  <span class="input-group-text">Rate Besar</span>
                  <input type="number" class="form-control text-end" v-model="rateBesar" placeholder="10000">
               </div>
               <div class="input-group input-group-sm w-100 w-md-auto" style="min-width: 150px;">
                  <span class="input-group-text">Rate Kecil</span>
                  <input type="number" class="form-control text-end" v-model="rateKecil" placeholder="8000">
               </div>
            </div>
         </div>
         <div class="card-body p-0">
            <div class="table-responsive">
               <table class="table table-bordered align-middle mb-0 text-center">
                  <thead class="table-secondary">
                     <tr>
                        <th rowspan="2" class="align-middle">No</th>
                        <th rowspan="2" class="align-middle text-start">Nama Lembaga / Sekolah</th>
                        <th colspan="2" class="table-info">Porsi Besar</th>
                        <th colspan="2" class="table-success">Porsi Kecil</th>
                        <th colspan="2" class="table-secondary">Total Disetujui</th>
                        <th colspan="2">Pagu Harga (Rp)</th>
                        <th colspan="2">Total (Rp)</th>
                     </tr>
                     <tr>
                        <!-- Besar Breakdown -->
                        <th class="table-info">Basah</th>
                        <th class="table-info">Kering</th>
                        <!-- Kecil Breakdown -->
                        <th class="table-success">Basah</th>
                        <th class="table-success">Kering</th>
                        <!-- Totals -->
                        <th>Besar</th>
                        <th>Kecil</th>
                        <!-- Rates -->
                        <th>Besar (@{{ formatCurrency(rateBesar) }})</th>
                        <th>Kecil (@{{ formatCurrency(rateKecil) }})</th>
                        <th>Besar</th>
                        <th>Kecil</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(pm, idx) in beneficiarySummary" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td class="text-start">{{ pm.nama_lembaga }}</td>
                        <!-- Portions -->
                         <!-- Besar Breakdown -->
                         <td class="table-info">{{ pm.basah_besar }}</td>
                         <td class="table-info">{{ pm.kering_besar }}</td>
                         <!-- Kecil Breakdown -->
                         <td class="table-success">{{ pm.basah_kecil }}</td>
                         <td class="table-success">{{ pm.kering_kecil }}</td>
                         <!-- Total -->
                         <td class="fw-bold">{{ pm.total_besar }}</td>
                         <td class="fw-bold">{{ pm.total_kecil }}</td>
                         <!-- Rates (Static display based on input) -->
                         <td class="text-muted small">{{ formatCurrency(rateBesar) }}</td>
                         <td class="text-muted small">{{ formatCurrency(rateKecil) }}</td>
                         <!-- Totals -->
                         <td class="text-end">{{ formatCurrency(pm.total_besar * rateBesar) }}</td>
                         <td class="text-end">{{ formatCurrency(pm.total_kecil * rateKecil) }}</td>
                      </tr>
                     <tr class="table-light fw-bold">
                        <td colspan="2" class="text-end">TOTAL</td>
                        <!-- Besar Totals -->
                        <td class="table-info">{{ totalPortions.basah_besar }}</td>
                        <td class="table-info">{{ totalPortions.kering_besar }}</td>
                        <!-- Kecil Totals -->
                        <td class="table-success">{{ totalPortions.basah_kecil }}</td>
                        <td class="table-success">{{ totalPortions.kering_kecil }}</td>
                        <!-- Grand Totals -->
                        <td>{{ totalPortions.total_besar }}</td>
                        <td>{{ totalPortions.total_kecil }}</td>
                        
                        <td colspan="2"></td>
                        <td class="text-end">{{ formatCurrency(totalPagu.besar) }}</td>
                        <td class="text-end">{{ formatCurrency(totalPagu.kecil) }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
            
            <div class="bg-primary bg-opacity-10 p-3 text-center border-top border-primary">
               <h4 class="mb-0">PAGU BELANJA HARIAN: <span class="fw-bold">Rp {{ formatCurrency(totalPagu.total) }}</span></h4>
            </div>
         </div>
       </div>

       <!-- 3. Summary Surplus/Deficit -->
       <div class="card text-center text-white" :class="budgetDiff >= 0 ? 'bg-success' : 'bg-danger'">
          <div class="card-body">
             <h3 class="card-title display-6 fw-bold">
                {{ budgetDiff >= 0 ? 'SURPLUS' : 'KURANG' }} : Rp {{ formatCurrency(Math.abs(budgetDiff)) }}
             </h3>
             <p class="card-text fs-5">
                Total Pagu ({{ formatCurrency(totalPagu.total) }}) - Total Belanja ({{ formatCurrency(totalShoppingCost) }})
             </p>
          </div>
       </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ... methods ...



export default {
  name: 'RencanaAnggaranBelanjaView',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      loading: false,
      planList: [],
      selectedPlanId: null,
      selectedPlan: null,
      distributions: {},
      menus: [],
      
      // Data from backend
      shoppingItems: [],
      beneficiaries: [], // raw beneficiary data attached to plan
      
      // Configuration
      rateBesar: 10000,
      rateKecil: 8000
    }
  },
  computed: {
    totalShoppingCost() {
       return this.shoppingItems.reduce((sum, item) => sum + (item.total_cost || 0), 0)
    },
    // Aggregate beneficiaries for Pagu Table
    beneficiarySummary() {
       if (!this.beneficiaries) return []
       
       // Helper to check distribution
       const checkDist = (menuId, pId) => {
           const map = this.distributions
           if (!map || !map[menuId]) return true // Default to ALL if no config found (legacy/manual)
           return map[menuId].includes(pId)
       }

       const basahMenus = this.menus.filter(m => m.kategori === 'Basah')
       const keringMenus = this.menus.filter(m => m.kategori === 'Kering')
       const otherMenus = this.menus.filter(m => m.kategori !== 'Basah' && m.kategori !== 'Kering')

       return this.beneficiaries.map(b => {
          const pBesar = (b.pivot?.porsi_besar || b.porsi_besar || 0) + (b.pivot?.porsi_sedang || b.porsi_sedang || 0)
          const pKecil = (b.pivot?.porsi_kecil || b.porsi_kecil || 0)
          
          const inBasah = basahMenus.length > 0 && basahMenus.some(m => checkDist(m.id_menu, b.id_penerima))
          const inKering = keringMenus.length > 0 && keringMenus.some(m => checkDist(m.id_menu, b.id_penerima))
          const inOther = otherMenus.length > 0 && otherMenus.some(m => checkDist(m.id_menu, b.id_penerima))
          
          // If no menus loaded (e.g. manual plan), default to YES
          const noMenus = this.menus.length === 0
          
          const isParticipating = inBasah || inKering || inOther || noMenus

          return {
              nama_lembaga: b.nama_lembaga,
              
              basah_besar: inBasah ? pBesar : 0,
              basah_kecil: inBasah ? pKecil : 0,
              
              kering_besar: inKering ? pBesar : 0,
              kering_kecil: inKering ? pKecil : 0,
              
              // Total used for Pagu (Assumption: Union of participation)
              total_besar: (inBasah ? pBesar : 0) + (inKering ? pBesar : 0),
              total_kecil: (inBasah ? pKecil : 0) + (inKering ? pKecil : 0),
              
              porsi_besar: pBesar, // raw
              porsi_kecil: pKecil // raw
          }
       })
    },
    totalPortions() {
       return this.beneficiarySummary.reduce((acc, curr) => {
          acc.basah_besar += curr.basah_besar
          acc.basah_kecil += curr.basah_kecil
          acc.kering_besar += curr.kering_besar
          acc.kering_kecil += curr.kering_kecil
          
          acc.total_besar += curr.total_besar
          acc.total_kecil += curr.total_kecil
          return acc
       }, { basah_besar: 0, basah_kecil: 0, kering_besar: 0, kering_kecil: 0, total_besar: 0, total_kecil: 0 })
    },
    totalPagu() {
       const besar = this.totalPortions.total_besar * this.rateBesar
       const kecil = this.totalPortions.total_kecil * this.rateKecil
       return {
          besar,
          kecil,
          total: besar + kecil
       }
    },
    budgetDiff() {
       return this.totalPagu.total - this.totalShoppingCost
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    },
    formatNumber(val) {
      if (!val) return '0'
      // Determine percision based on value (int vs float)
      return parseFloat(val).toLocaleString('id-ID', { maximumFractionDigits: 2 })
    },
    formatCurrency(val) {
      return parseFloat(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    },
    async loadPlans() {
      try {
         const res = await api.get('/calculator/plans') // Needs endpoint
         if (res.data.success) {
            this.planList = res.data.data
         }
      } catch (err) {
         console.error(err)
         this.toast.error('Gagal memuat daftar rencana belanja')
      }
    },
    selectAndLoadPlan(id) {
       this.selectedPlanId = id
       this.loadPlanDetails()
    },
    clearSelection() {
       this.selectedPlanId = null
       this.selectedPlan = null
       this.shoppingItems = []
       this.beneficiaries = []
    },
    formatNumber(num) {
        return parseFloat(num).toLocaleString('id-ID')
     },
     
     formatDate(date) {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
           weekday: 'long', 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric'
        })
     },
     
     // Export Functions
     copyToClipboard() {
        if (!this.beneficiarySummary.length) return
        
        let text = ""
        
        // ===================================
        // 1. RINCIAN BELANJA
        // ===================================
        text += "RINCIAN BELANJA\n"
        text += "No\tNama Bahan\tQty\tSatuan\tHarga Satuan (@)\tTotal (Rp)\n"
        
        this.shoppingItems.forEach((item, idx) => {
           text += `${idx + 1}\t${item.nama_bahan_baku}\t${this.formatNumber(item.total_qty)}\t${item.satuan}\t${this.formatNumber(item.harga)}\t${this.formatNumber(item.total_cost)}\n`
        })
        
        text += `\tTOTAL BELANJA\t\t\t\t${this.formatNumber(this.totalShoppingCost)}\n\n`
        
        // ===================================
        // 2. RAB (PAGU ANGGARAN)
        // ===================================
        text += "RENCANA ANGGARAN BELANJA (RAB)\n"
        // Headers
        text += "No\tNama Lembaga\tPorsi Besar\t\tPorsi Kecil\t\tTotal\t\tPagu Harga (Rp)\t\tTotal Pagu (Rp)\n"
        text += `\t\tBasah\tKering\tBasah\tKering\tBesar\tKecil\tBesar (@${this.formatNumber(this.rateBesar)})\tKecil (@${this.formatNumber(this.rateKecil)})\t\n`
        
        this.beneficiarySummary.forEach((pm, idx) => {
            const paguBesar = pm.total_besar * this.rateBesar
            const paguKecil = pm.total_kecil * this.rateKecil
            const totalPagu = paguBesar + paguKecil
            
            text += `${idx + 1}\t${pm.nama_lembaga}\t${pm.basah_besar}\t${pm.kering_besar}\t${pm.basah_kecil}\t${pm.kering_kecil}\t${pm.total_besar}\t${pm.total_kecil}\t${this.formatNumber(paguBesar)}\t${this.formatNumber(paguKecil)}\t${this.formatNumber(totalPagu)}\n`
        })
        
        // Footer RAB
        const tp = this.totalPortions
        const totPagu = this.totalPagu.total
        text += `\tTOTAL\t${tp.basah_besar}\t${tp.kering_besar}\t${tp.basah_kecil}\t${tp.kering_kecil}\t${tp.total_besar}\t${tp.total_kecil}\t${this.formatNumber(this.totalPagu.besar)}\t${this.formatNumber(this.totalPagu.kecil)}\t${this.formatNumber(totPagu)}\n\n`
        
        // ===================================
        // 3. ANALISA ANGGARAN
        // ===================================
        text += "ANALISA ANGGARAN\n"
        const surplus = this.totalPagu.total - this.totalShoppingCost
        const status = surplus >= 0 ? "SURPLUS" : "DEFISIT"
        
        text += `\tTotal Pagu\tRp ${this.formatNumber(this.totalPagu.total)}\n`
        text += `\tTotal Belanja\tRp ${this.formatNumber(this.totalShoppingCost)}\n`
        text += `\t${status}\tRp ${this.formatNumber(Math.abs(surplus))}\n`

        navigator.clipboard.writeText(text).then(() => {
           this.toast.success("Data berhasil disalin ke clipboard")
        })
     },
     
     exportExcel() {
        if (!this.beneficiarySummary.length) return
        
        // Use Array of Arrays (AoA) for full control over rows/headers
        let wsData = []
        
        // ===================================
        // 1. RINCIAN BELANJA
        // ===================================
        wsData.push(["RINCIAN BELANJA"])
        wsData.push(["No", "Nama Bahan", "Qty", "Satuan", "Harga Satuan (@)", "Total (Rp)"]) // Table 1 Headers
        
        this.shoppingItems.forEach((item, idx) => {
            wsData.push([
                idx + 1,
                item.nama_bahan_baku,
                this.formatNumber(item.total_qty),
                item.satuan,
                this.formatNumber(item.harga),
                this.formatNumber(item.total_cost)
            ])
        })
        
        // Footer Table 1
        wsData.push(["", "TOTAL BELANJA", "", "", "", this.formatNumber(this.totalShoppingCost)])
        wsData.push([]) // spacer
        
        // ===================================
        // 2. RAB (PAGU ANGGARAN)
        // ===================================
        wsData.push(["RENCANA ANGGARAN BELANJA (RAB)"])
        // Headers for Table 2
        // Row 1 of Headers
        wsData.push([
            "No", 
            "Nama Lembaga", 
            "Porsi Besar", "", 
            "Porsi Kecil", "",
            "Total", "",
            "Pagu Harga (Rp)", "",
            "Total Pagu (Rp)"
        ])
        // Row 2 of Headers
        wsData.push([
            "", "", 
            "Basah", "Kering",
            "Basah", "Kering",
            "Besar", "Kecil",
            `Besar (@${this.formatNumber(this.rateBesar)})`, `Kecil (@${this.formatNumber(this.rateKecil)})`,
            ""
        ])
        
        this.beneficiarySummary.forEach((pm, idx) => {
            wsData.push([
                idx + 1,
                pm.nama_lembaga,
                pm.basah_besar,
                pm.kering_besar,
                pm.basah_kecil,
                pm.kering_kecil,
                pm.total_besar,
                pm.total_kecil,
                pm.total_besar * this.rateBesar,
                pm.total_kecil * this.rateKecil,
                (pm.total_besar * this.rateBesar) + (pm.total_kecil * this.rateKecil)
            ])
        })
        
        // Footer Table 2
        const tp = this.totalPortions
        wsData.push([
            "", 
            "TOTAL",
            tp.basah_besar,
            tp.kering_besar,
            tp.basah_kecil,
            tp.kering_kecil,
            tp.total_besar,
            tp.total_kecil,
            this.totalPagu.besar,
            this.totalPagu.kecil,
            this.totalPagu.total
        ])
        
        wsData.push([]) // spacer

        // ===================================
        // 3. ANALISA ANGGARAN
        // ===================================
        wsData.push(["ANALISA ANGGARAN"])
        
        const surplus = this.totalPagu.total - this.totalShoppingCost
        const status = surplus >= 0 ? "SURPLUS" : "DEFISIT"
        
        // Removed separate Rate rows as they are now in header
        wsData.push(["", "Total Pagu", "Rp " + this.formatNumber(this.totalPagu.total)])
        wsData.push(["", "Total Belanja", "Rp " + this.formatNumber(this.totalShoppingCost)])
        wsData.push(["", status, "Rp " + this.formatNumber(Math.abs(surplus))])
        
        // Create Sheet
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        
        // Adjust column widths (Optional but good)
        ws['!cols'] = [
            { wch: 5 },  // No
            { wch: 25 }, // Nama
            { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, // Totals
            { wch: 15 }, { wch: 15 }, // Rates
            { wch: 20 } // Total Pagu
        ]
        
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Laporan")
        
        const dateStr = this.selectedPlan ? this.selectedPlan.tanggal_rencana : new Date().toISOString().split('T')[0]
        XLSX.writeFile(wb, `Laporan_${dateStr}.xlsx`)
     },
     
     exportPdf() {
        if (!this.beneficiarySummary.length) return
        
        const doc = new jsPDF()
        
        // Header
        doc.setFontSize(16)
        doc.text("Rencana Anggaran Belanja", 14, 15)
        
        doc.setFontSize(10)
        const dateStr = this.selectedPlan ? this.formatDate(this.selectedPlan.tanggal_rencana) : '-'
        doc.text(`Tanggal Rencana: ${dateStr}`, 14, 22)
        doc.text(`Total Pagu: Rp ${this.formatCurrency(this.totalPagu.total)}`, 14, 27)
        
        // Prepare table data
        const body = this.beneficiarySummary.map((pm, idx) => [
           idx + 1,
           pm.nama_lembaga,
           pm.basah_besar, pm.kering_besar, // Besar Breakdown
           pm.basah_kecil, pm.kering_kecil, // Kecil Breakdown
           pm.total_besar, pm.total_kecil,  // Totals
           `Rp ${this.formatCurrency((pm.total_besar * this.rateBesar) + (pm.total_kecil * this.rateKecil))}`
        ])
        
        // Total row
        const tp = this.totalPortions
        body.push([
           '', 'TOTAL',
           tp.basah_besar, tp.kering_besar,
           tp.basah_kecil, tp.kering_kecil,
           tp.total_besar, tp.total_kecil,
           `Rp ${this.formatCurrency(this.totalPagu.total)}`
        ])
        
        doc.autoTable({
           startY: 32,
           head: [[
              { content: 'No', rowSpan: 2, styles: { valign: 'middle' } },
              { content: 'Nama Lembaga', rowSpan: 2, styles: { valign: 'middle' } },
              { content: 'Porsi Besar', colSpan: 2, styles: { halign: 'center', fillColor: [209, 236, 241], textColor: [0,0,0] } }, // table-info color approx
              { content: 'Porsi Kecil', colSpan: 2, styles: { halign: 'center', fillColor: [209, 231, 221], textColor: [0,0,0] } }, // table-success color approx
              { content: 'Total', colSpan: 2, styles: { halign: 'center' } },
              { content: 'Pagu (Rp)', rowSpan: 2, styles: { valign: 'middle' } }
           ], [
              { content: 'Basah', styles: { fillColor: [209, 236, 241], textColor: [0,0,0] } },
              { content: 'Kering', styles: { fillColor: [209, 236, 241], textColor: [0,0,0] } },
              { content: 'Basah', styles: { fillColor: [209, 231, 221], textColor: [0,0,0] } },
              { content: 'Kering', styles: { fillColor: [209, 231, 221], textColor: [0,0,0] } },
              'Besar', 'Kecil'
           ]],
           body: body,
           theme: 'grid',
           styles: { fontSize: 8, cellPadding: 2 },
           headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], lineColor: [200, 200, 200], lineWidth: 0.1 },
           columnStyles: {
              0: { halign: 'center' },
              2: { halign: 'center' }, 3: { halign: 'center' },
              4: { halign: 'center' }, 5: { halign: 'center' },
              6: { halign: 'center', fontStyle: 'bold' }, 7: { halign: 'center', fontStyle: 'bold' },
              8: { halign: 'right' }
           },
           didParseCell: function (data) {
               // Style the Last Row (Total)
               if (data.row.index === body.length - 1) {
                   data.cell.styles.fontStyle = 'bold';
                   data.cell.styles.fillColor = [240, 240, 240]; 
               }
           }
        })
        
        doc.save(`RAB_${dateStr}.pdf`)
     },

     exportPdf() {
        if (!this.beneficiarySummary.length) return
        
        const doc = new jsPDF()
        
        // Header
        doc.setFontSize(16)
        doc.text("Laporan Perencanaan & Anggaran", 14, 15)
        
        doc.setFontSize(10)
        const dateStr = this.selectedPlan ? this.formatDate(this.selectedPlan.tanggal_rencana) : '-'
        doc.text(`Tanggal Rencana: ${dateStr}`, 14, 22)
        
        // ============================================
        // TABLE 1: RINCIAN BELANJA
        // ============================================
        doc.setFontSize(12)
        doc.text("1. Rincian Belanja (Shopping List)", 14, 32)
        
        const shoppingBody = this.shoppingItems.map((item, idx) => [
            idx + 1,
            item.nama_bahan_baku,
            this.formatNumber(item.total_qty),
            item.satuan,
            `Rp ${this.formatCurrency(item.harga)}`,
            `Rp ${this.formatCurrency(item.total_cost)}`
        ])
        
        // Total row for shopping
        shoppingBody.push([
            '', 'TOTAL BELANJA', '', '', '',
            `Rp ${this.formatCurrency(this.totalShoppingCost)}`
        ])
        
        autoTable(doc, {
            startY: 36,
            head: [['No', 'Nama Bahan', 'Qty', 'Satuan', 'Harga Satuan', 'Total']],
            body: shoppingBody,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [50, 50, 50], textColor: [255,255,255] },
            columnStyles: {
                0: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'right' },
                5: { halign: 'right', fontStyle: 'bold' }
            },
            didParseCell: function (data) {
                if (data.row.index === shoppingBody.length - 1) {
                   data.cell.styles.fontStyle = 'bold';
                   data.cell.styles.fillColor = [240, 240, 240]; 
               }
            }
        })
        
        // Get end position of first table
        let finalY = doc.lastAutoTable.finalY || 40;
        
        // ============================================
        // TABLE 2: RAB
        // ============================================
        doc.setFontSize(12)
        doc.text("2. Rencana Anggaran Belanja (RAB)", 14, finalY + 10)
        doc.setFontSize(10)
        doc.text(`Total Pagu: Rp ${this.formatCurrency(this.totalPagu.total)}`, 14, finalY + 15)
        
        // Prepare table data including Rate Values
        const rabBody = this.beneficiarySummary.map((pm, idx) => [
           idx + 1,
           pm.nama_lembaga,
           pm.basah_besar, pm.kering_besar, // Besar Breakdown
           pm.basah_kecil, pm.kering_kecil, // Kecil Breakdown
           pm.total_besar, pm.total_kecil,  // Totals
           `Rp ${this.formatCurrency(pm.total_besar * this.rateBesar)}`, // Pagu Besar
           `Rp ${this.formatCurrency(pm.total_kecil * this.rateKecil)}`, // Pagu Kecil
           `Rp ${this.formatCurrency((pm.total_besar * this.rateBesar) + (pm.total_kecil * this.rateKecil))}`
        ])
        
        // Total row
        const tp = this.totalPortions
        rabBody.push([
           '', 'TOTAL',
           tp.basah_besar, tp.kering_besar,
           tp.basah_kecil, tp.kering_kecil,
           tp.total_besar, tp.total_kecil,
           `Rp ${this.formatCurrency(this.totalPagu.besar)}`,
           `Rp ${this.formatCurrency(this.totalPagu.kecil)}`,
           `Rp ${this.formatCurrency(this.totalPagu.total)}`
        ])
        
        autoTable(doc, {
           startY: finalY + 20,
           head: [[
              { content: 'No', rowSpan: 2, styles: { valign: 'middle' } },
              { content: 'Nama Lembaga', rowSpan: 2, styles: { valign: 'middle' } },
              { content: 'Porsi Besar', colSpan: 2, styles: { halign: 'center', fillColor: [209, 236, 241], textColor: [0,0,0] } },
              { content: 'Porsi Kecil', colSpan: 2, styles: { halign: 'center', fillColor: [209, 231, 221], textColor: [0,0,0] } },
              { content: 'Total', colSpan: 2, styles: { halign: 'center' } },
              { content: 'Pagu Harga (Rp)', colSpan: 2, styles: { halign: 'center' } },
              { content: 'Total (Rp)', rowSpan: 2, styles: { valign: 'middle' } }
           ], [
              { content: 'Basah', styles: { fillColor: [209, 236, 241], textColor: [0,0,0] } },
              { content: 'Kering', styles: { fillColor: [209, 236, 241], textColor: [0,0,0] } },
              { content: 'Basah', styles: { fillColor: [209, 231, 221], textColor: [0,0,0] } },
              { content: 'Kering', styles: { fillColor: [209, 231, 221], textColor: [0,0,0] } },
              'Besar', 'Kecil',
              `Besar (@${this.formatNumber(this.rateBesar)})`, `Kecil (@${this.formatNumber(this.rateKecil)})`
           ]],
           body: rabBody,
           theme: 'grid',
           styles: { fontSize: 8, cellPadding: 2 },
           headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], lineColor: [200, 200, 200], lineWidth: 0.1 },
           columnStyles: {
              0: { halign: 'center' },
              2: { halign: 'center' }, 3: { halign: 'center' },
              4: { halign: 'center' }, 5: { halign: 'center' },
              6: { halign: 'center', fontStyle: 'bold' }, 7: { halign: 'center', fontStyle: 'bold' },
              8: { halign: 'right' }, 9: { halign: 'right' },
              10: { halign: 'right', fontStyle: 'bold' }
           },
           didParseCell: function (data) {
               if (data.row.index === rabBody.length - 1) {
                   data.cell.styles.fontStyle = 'bold';
                   data.cell.styles.fillColor = [240, 240, 240]; 
               }
           }
        })
        
        // ============================================
        // 3. ANALISA BANNER
        // ============================================
        let analysisY = doc.lastAutoTable.finalY + 15
        
        const surplus = this.totalPagu.total - this.totalShoppingCost
        const isSurplus = surplus >= 0
        const statusText = isSurplus ? "SURPLUS" : "DEFISIT"
        const statusColor = isSurplus ? [25, 135, 84] : [220, 53, 69] // Green or Red
        
        // Background Box
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
        doc.rect(14, analysisY, 182, 20, 'F')
        
        // Main Text (Status & Value)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const mainText = `${statusText} : Rp ${this.formatNumber(Math.abs(surplus))}`
        doc.text(mainText, 105, analysisY + 8, { align: 'center' })
        
        // Subtext (Formula)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const subText = `Total Pagu (${this.formatNumber(this.totalPagu.total)}) - Total Belanja (${this.formatNumber(this.totalShoppingCost)})`
        doc.text(subText, 105, analysisY + 16, { align: 'center' })
        
        doc.save(`Laporan_${dateStr}.pdf`)
     },

    async loadPlanDetails() {
       if (!this.selectedPlanId) return
       this.loading = true
       try {
          const res = await api.get(`/calculator/plans/${this.selectedPlanId}`)
          if (res.data.success) {
             this.selectedPlan = res.data.data.plan
             this.distributions = this.selectedPlan.distributions || {}
             this.menus = res.data.data.menus || []

             this.shoppingItems = res.data.data.items.map(item => ({
                ...item,
                total_cost: parseFloat(item.total_qty) * parseFloat(item.harga)
             }))
             this.beneficiaries = res.data.data.beneficiaries
             
             this.toast.success('Data RAB dimuat')
          }
       } catch (err) {
          console.error(err)
          this.toast.error('Gagal memuat detail rencana')
       } finally {
          this.loading = false
       }
    }
  },
  mounted() {
     this.loadPlans()
  }
}
</script>
