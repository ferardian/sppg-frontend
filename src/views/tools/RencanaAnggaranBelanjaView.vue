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

    <!-- MODE: LIST of Saved RABs -->
    <div v-if="mode === 'list'">
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0 text-success"><i class="bi bi-journal-check me-2"></i>Daftar Rencana Anggaran Belanja (RAB)</h5>
                <div>
                   <button class="btn btn-primary btn-sm me-2" @click="startCreate"><i class="bi bi-plus-circle me-1"></i>Buat RAB Baru</button>
                   <button class="btn btn-sm btn-outline-secondary" @click="loadRABs"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Tanggal</th>
                                <th>Judul RAB</th>
                                <th>Keterangan</th>
                                <th class="text-end">Total Anggaran</th>
                                <th class="text-center">Status</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="rab in rabList" :key="rab.id_rencana_anggaran">
                                <td>{{ formatDate(rab.tanggal_mulai) }}</td>
                                <td class="fw-bold text-dark">{{ rab.judul }}</td>
                                <td class="text-muted">{{ rab.keterangan || '-' }}</td>
                                <td class="text-end fw-bold text-success">{{ formatCurrency(rab.total_anggaran) }}</td>
                                <td class="text-center">
                                    <span class="badge bg-secondary">{{ rab.status }}</span>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-info text-white me-1" @click="viewRAB(rab.id_rencana_anggaran)">
                                        <i class="bi bi-eye"></i> Detail
                                    </button>
                                    <button class="btn btn-sm btn-success text-white me-1" @click="viewPagu(rab.id_rencana_anggaran)">
                                        <i class="bi bi-calculator"></i> Pagu
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteRAB(rab.id_rencana_anggaran)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                             <tr v-if="rabList.length === 0">
                                <td colspan="6" class="text-center py-5 text-muted">Belum ada data RAB tersimpan.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- RAB Detail Modal Overlay -->
        <Teleport to="body">
        <div class="modal-backdrop show" v-if="showRabModal" style="z-index: 2050;"></div>
        <div class="modal d-block" v-if="showRabModal" tabindex="-1" style="z-index: 2055;">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header border-bottom-0 pb-0 d-block text-center">
                <div class="modal-print-header d-none d-print-block">{{ configStore.sppgName }}</div>
                <div class="d-flex justify-content-between align-items-center w-100">
                    <h5 class="modal-title fw-bold text-primary text-start">
                        <i class="bi bi-receipt me-2"></i>Detail RAB
                        <span v-if="selectedRab" class="text-muted fs-6 ms-2">| {{ selectedRab.judul }}</span>
                    </h5>
                    <button type="button" class="btn-close" @click="showRabModal = false"></button>
                </div>
              </div>
              <div class="modal-body" v-if="selectedRab">
                 <div class="row mb-3">
                     <div class="col-md-6">
                         <table class="table table-sm table-borderless">
                             <tr><td width="120">Tanggal</td><td>: {{ formatDate(selectedRab.tanggal_mulai) }}</td></tr>
                             <tr>
                                 <td>Status</td>
                                 <td>: 
                                    <select class="form-select form-select-sm d-inline-block w-auto text-white fw-bold border-0" 
                                        :value="selectedRab.status" 
                                        @change="updateStatus(selectedRab.id_rencana_anggaran, $event.target.value)"
                                        :class="{
                                            'bg-secondary': selectedRab.status === 'draft',
                                            'bg-warning': selectedRab.status === 'diajukan',
                                            'bg-success': selectedRab.status === 'disetujui',
                                            'bg-danger': selectedRab.status === 'ditolak'
                                        }" style="cursor: pointer;">
                                        <option value="draft" class="bg-white text-dark">DRAFT</option>
                                        <option value="diajukan" class="bg-white text-dark">DIAJUKAN</option>
                                        <option value="disetujui" class="bg-white text-dark">DISETUJUI</option>
                                        <option value="ditolak" class="bg-white text-dark">DITOLAK</option>
                                    </select>
                                 </td>
                             </tr>
                             <tr><td>Total Anggaran</td><td class="fw-bold text-success fs-5">: {{ formatCurrency(selectedRab.total_anggaran) }}</td></tr>
                         </table>
                     </div>
                     <div class="col-md-6 text-end">
                         <p class="text-muted">{{ selectedRab.keterangan }}</p>
                     </div>
                 </div>
                 
                 <div class="table-responsive">
                     <table class="table table-bordered table-striped table-sm" style="font-size: 0.9em;">
                         <thead class="table-dark">
                             <tr>
                                 <th>Bahan Baku</th>

                                 <th class="text-end">Harga Satuan</th>
                                 <th class="text-center">Jumlah</th>
                                 <th class="text-end">Subtotal</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr v-for="d in selectedRab.details" :key="d.id_detail_rencana">
                                 <td>{{ d.nama_bahan_baku }}</td>

                                 <td class="text-end">{{ formatCurrency(d.harga_satuan) }} / {{ d.satuan }}</td>
                                 <td class="text-center">{{ parseFloat(d.jumlah_total).toLocaleString() }} {{ d.satuan }}</td>
                                 <td class="text-end fw-bold">{{ formatCurrency(d.subtotal) }}</td>
                             </tr>
                         </tbody>
                         <tfoot class="table-light">
                             <tr>
                                 <td colspan="3" class="text-end fw-bold">TOTAL ESTIMASI</td>
                                 <td class="text-end fw-bold fs-5 text-success">{{ formatCurrency(selectedRab.total_anggaran) }}</td>
                             </tr>
                         </tfoot>
                     </table>
                 </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showRabModal = false">Tutup</button>
                <button type="button" class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer me-2"></i>Cetak</button>
              </div>
            </div>
          </div>
        </div>
        </Teleport>
    </div>

        <!-- Detail Pagu Modal -->
        <Teleport to="body">
        <div class="modal-backdrop show" v-if="showPaguModal" style="z-index: 2050;"></div>
        <div class="modal d-block" v-if="showPaguModal" tabindex="-1" style="z-index: 2055;">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header bg-white border-bottom-0 pb-0 d-block text-center">
                  <div class="modal-print-header d-none d-print-block">{{ configStore.sppgName }}</div>
                  <div class="d-flex justify-content-between align-items-center w-100">
                      <h5 class="modal-title fw-bold text-success text-start">
                          <i class="bi bi-calculator me-2"></i> Detail Pagu Anggaran
                          <span v-if="selectedRab" class="fs-6 ms-2 text-muted">| {{ selectedRab.judul }}</span>
                      </h5>
                      <button type="button" class="btn-close" @click="showPaguModal = false"></button>
                  </div>
              </div>
              <div class="modal-body" v-if="selectedRab && selectedRab.pagu_details">
                 <div class="alert alert-light border shadow-sm mb-3">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <strong>Tarif Besar:</strong> {{ formatCurrency(selectedRab.rate_besar) }} <br>
                            <strong>Tarif Kecil:</strong> {{ formatCurrency(selectedRab.rate_kecil) }}
                        </div>
                        <div class="col-md-6 text-end">
                             <!-- If total_pagu is 0 (legacy), recalc from nominals -->
                             <h4 class="mb-0 text-success fw-bold">
                                Total Pagu: {{ formatCurrency(selectedRab.pagu_details.reduce((sum, item) => sum + (parseFloat(item.total_pagu) || (parseFloat(item.nominal_besar) + parseFloat(item.nominal_kecil))), 0)) }}
                             </h4>
                             <div class="small text-muted mt-1">
                                Total Belanja: {{ formatCurrency(selectedRab.total_anggaran) }}
                             </div>
                             <div class="fw-bold fs-5 mt-1" :class="(selectedRab.pagu_details.reduce((sum, item) => sum + (parseFloat(item.total_pagu) || (parseFloat(item.nominal_besar) + parseFloat(item.nominal_kecil))), 0) - selectedRab.total_anggaran) >= 0 ? 'text-primary' : 'text-danger'">
                                Selisih: {{ formatCurrency(selectedRab.pagu_details.reduce((sum, item) => sum + (parseFloat(item.total_pagu) || (parseFloat(item.nominal_besar) + parseFloat(item.nominal_kecil))), 0) - selectedRab.total_anggaran) }}
                             </div>
                        </div>
                    </div>
                 </div>

                 <div class="table-responsive">
                    <table class="table table-bordered table-striped align-middle mb-0 text-center" style="font-size: 0.9em;">
                       <thead class="table-dark">
                          <tr>
                             <th rowspan="2" class="align-middle">No</th>
                             <th rowspan="2" class="align-middle text-start">Nama Lembaga / Sekolah</th>
                             <th colspan="2">Porsi Besar</th>
                             <th colspan="2">Porsi Kecil</th>
                             <th colspan="2">Total Disetujui</th>
                             <th colspan="2">Total (Rp)</th>
                          </tr>
                          <tr>
                             <th>Basah</th>
                             <th>Kering</th>
                             <th>Basah</th>
                             <th>Kering</th>
                             <th>Besar</th>
                             <th>Kecil</th>
                             <th>Besar</th>
                             <th>Kecil</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr v-for="(pm, idx) in selectedRab.pagu_details" :key="pm.id_detail_pagu">
                             <td>{{ idx + 1 }}</td>
                             <td class="text-start">{{ pm.nama_lembaga }}</td>
                             <td>{{ pm.basah_besar }}</td>
                             <td>{{ pm.kering_besar }}</td>
                             <td>{{ pm.basah_kecil }}</td>
                             <td>{{ pm.kering_kecil }}</td>
                             <td class="fw-bold">{{ pm.total_besar }}</td>
                             <td class="fw-bold">{{ pm.total_kecil }}</td>
                             <td class="text-end fw-bold">{{ formatCurrency(pm.nominal_besar) }}</td>
                             <td class="text-end fw-bold">{{ formatCurrency(pm.nominal_kecil) }}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showPaguModal = false">Tutup</button>
                <button type="button" class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer me-2"></i>Cetak</button>
              </div>
            </div>
          </div>
        </div>
        </Teleport>


    <!-- MODE: CREATE (Simulasi & Seleksi) -->
    <div v-if="mode === 'create'">
       <div class="mb-3">
           <button class="btn btn-outline-secondary" @click="cancelCreate">
              <i class="bi bi-arrow-left me-1"></i> Kembali ke Daftar RAB
           </button>
       </div>

    <!-- Selection Card: List Table -->
    <div class="card mb-4 border-primary" v-if="!selectedPlan && !loading">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Langkah 1: Pilih Rencana Belanja</h5>
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
                           <i class="bi bi-arrow-right me-1"></i> Pilih
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-primary" role="status"></div>
       <p class="mt-2 text-muted">Memuat data...</p>
    </div>

    <!-- Step 2: Analysis View -->
    <div v-else-if="selectedPlan">
       
       <!-- Plan Info Header -->
       <div class="alert alert-light border shadow-sm mb-4 d-flex align-items-center">
            <div class="bg-primary bg-opacity-10 p-3 rounded-3 me-3 text-primary">
                <i class="bi bi-calendar2-week-fill fs-3"></i>
            </div>
            <div>
                <h5 class="mb-1 fw-bold text-dark">{{ formatDate(selectedPlan.tanggal_rencana) }}</h5>
                <div class="text-muted"><i class="bi bi-info-circle me-1"></i>{{ selectedPlan.keterangan || 'Tidak ada keterangan khusus untuk rencana ini.' }}</div>
            </div>
       </div>

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
       <div class="card mb-4 shadow-sm border-success">
          <div class="card-header bg-white py-3">
             <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
                <!-- Title & Rates -->
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                   <h5 class="mb-0 text-success fw-bold text-nowrap"><i class="bi bi-calculator me-2"></i>Simulasi Pagu</h5>
                   <div class="d-flex gap-2 flex-wrap">
                      <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light border-end-0"><i class="bi bi-currency-dollar"></i> Besar</span>
                          <input type="number" class="form-control text-end" v-model="rateBesar" style="max-width: 100px;" placeholder="10000">
                      </div>
                      <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light border-end-0"><i class="bi bi-currency-dollar"></i> Kecil</span>
                          <input type="number" class="form-control text-end" v-model="rateKecil" style="max-width: 100px;" placeholder="8000">
                      </div>
                   </div>
                </div>

                <!-- Actions -->
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="text-muted small me-1 d-none d-md-inline">Ekspor:</span>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" @click="copyToClipboard" title="Salin"><i class="bi bi-clipboard"></i></button>
                        <button class="btn btn-outline-success" @click="exportExcel" title="Excel"><i class="bi bi-file-earmark-excel"></i></button>
                        <button class="btn btn-outline-danger" @click="exportPdf" title="PDF"><i class="bi bi-file-earmark-pdf"></i></button>
                    </div>
                    
                    <div class="vr mx-2 d-none d-md-block"></div>
                    
                    <button class="btn btn-success btn-sm px-4 fw-bold shadow-sm" @click="confirmSaveRAB">
                        <i class="bi bi-save-fill me-2"></i>Simpan Permanen
                    </button>
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
                         <td class="text-end fw-bold">{{ formatCurrency(pm.nominal_besar) }}</td>
                         <td class="text-end fw-bold">{{ formatCurrency(pm.nominal_kecil) }}</td>
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
  </div>
    <!-- Save RAB Modal -->
    <Teleport to="body">
    <div class="modal fade" :class="{ 'show d-block': showSaveModal }" tabindex="-1" v-if="showSaveModal" style="background: rgba(0,0,0,0.5); z-index: 2055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title"><i class="bi bi-save me-2"></i>Simpan RAB Permanen</h5>
            <button type="button" class="btn-close btn-close-white" @click="showSaveModal = false"></button>
          </div>
          <div class="modal-body p-4">
             <div class="mb-3">
                <label class="form-label fw-bold">Judul RAB <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-lg" v-model="saveForm.judul" placeholder="Contoh: RAB Januari 2026 Minggu 1">
                <div class="form-text">Berikan nama yang jelas untuk identifikasi RAB ini.</div>
             </div>
             <div class="mb-3">
                <label class="form-label fw-bold">Keterangan</label>
                <textarea class="form-control" rows="3" v-model="saveForm.keterangan" placeholder="Tambahkan catatan jika perlu..."></textarea>
             </div>
             <div class="alert alert-info d-flex align-items-center mb-0">
                <i class="bi bi-info-circle-fill me-2 fs-4"></i>
                <small>Bahan baku dan harga saat ini akan disimpan sebagai snapshot permanen.</small>
             </div>
          </div>
          <div class="modal-footer bg-light">
             <button type="button" class="btn btn-outline-secondary" @click="showSaveModal = false">Batal</button>
             <button type="button" class="btn btn-success px-4" @click="submitSaveRAB" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                Simpan RAB
             </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
</template>

<script>
import api from '@/services/api'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import { useConfigStore } from '@/stores/config'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ... methods ...



export default {
  name: 'RencanaAnggaranBelanjaView',
  setup() {
    const toast = useToast()
    const configStore = useConfigStore()
    return { toast, configStore }
  },
  
  data() {
    return {
      loading: false,
      mode: 'list', // 'list' | 'create'
      
      // RAB List Data
      rabList: [],
      showRabModal: false,
      showPaguModal: false,
      selectedRab: null,
      
      // Creation Data
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
      rateKecil: 8000,
      
      // Save Modal Data
      showSaveModal: false,
      saveForm: {
          judul: '',
          keterangan: ''
      }
    }
  },
  async created() {
      // Allow passing planId via query prop or similar if needed in future, but for now just load RAB list
      await this.loadRABs()
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
              
              nominal_besar: ((inBasah ? pBesar : 0) + (inKering ? pBesar : 0)) * this.rateBesar,
              nominal_kecil: ((inBasah ? pKecil : 0) + (inKering ? pKecil : 0)) * this.rateKecil,
              
              total_pagu: (((inBasah ? pBesar : 0) + (inKering ? pBesar : 0)) * this.rateBesar) + (((inBasah ? pKecil : 0) + (inKering ? pKecil : 0)) * this.rateKecil),

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
    // RAB Manager Methods
    async loadRABs() {
       this.loading = true
       try {
          const res = await api.get('/calculator/rab')
          if(res.data.success) {
             this.rabList = res.data.data
          }
       } catch (err) { console.error(err) }
       finally { this.loading = false }
    },
    startCreate() {
        this.mode = 'create'
        this.selectedPlan = null
        this.loadPlans() // Load plans only when needed
    },
    cancelCreate() {
        this.mode = 'list'
        this.selectedPlan = null
        this.loadRABs()
    },
    async viewRAB(id) {
       this.loading = true
       try {
           const res = await api.get(`/calculator/rab/${id}`)
           if (res.data.success) {
               this.selectedRab = res.data.data
               this.showRabModal = true
           }
       } catch (err) {
           this.toast.error('Gagal memuat detail RAB')
       } finally {
           this.loading = false
       }
    },


    async updateStatus(id, newStatus) {
        // Use SweetAlert2 for beautiful confirmation
        const result = await Swal.fire({
            title: 'Konfirmasi Perubahan',
            text: `Ubah status RAB menjadi ${newStatus.toUpperCase()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Ubah!',
            cancelButtonText: 'Batal'
        })

        if (!result.isConfirmed) {
            // Revert selection if cancelled
            const original = this.selectedRab.status;
            this.selectedRab.status = '...'; 
            this.$nextTick(() => this.selectedRab.status = original); 
            return;
        }
        
        try {
            const response = await api.patch(`/calculator/rab/${id}/status`, { status: newStatus });
            if (response.data.success) {
                // this.toast.success('Status berhasil diperbarui'); // Use Swal success instead or keep toast
                Swal.fire('Berhasil!', 'Status telah diperbarui.', 'success')
                
                // Update local state
                if (this.selectedRab && this.selectedRab.id_rencana_anggaran === id) {
                    this.selectedRab.status = newStatus;
                }
                await this.loadRABs(); // Refresh list
            }
        } catch (error) {
            this.toast.error('Gagal memperbarui status');
            console.error(error);
        }
    },

    async deleteRAB(id) {
        if(!confirm('Hapus Data RAB ini secara permanen?')) return
        try {
            await api.delete(`/calculator/rab/${id}`)
            this.toast.success('RAB dihapus')
            this.loadRABs()
        } catch(e) { this.toast.error('Gagal hapus RAB') }
    },
    async viewPagu(id) {
       this.loading = true
       try {
           const res = await api.get(`/calculator/rab/${id}`)
           if (res.data.success) {
               this.selectedRab = res.data.data
               this.showPaguModal = true
           }
       } catch (err) {
           this.toast.error('Gagal memuat detail Pagu')
       } finally {
           this.loading = false
       }
    },
    // Creation / Analysis Methods
    confirmSaveRAB() {
        if (!this.selectedPlan) return
        
        // Init form with defaults
        // Format: RAB - [Date]
        const dateStr = this.formatDate(this.selectedPlan.tanggal_rencana)
        this.saveForm.judul = `RAB - ${dateStr}`
        this.saveForm.keterangan = this.selectedPlan.keterangan || ''
        
        // Open Modal
        this.showSaveModal = true
    },
    
    async submitSaveRAB() {
        if (!this.saveForm.judul) {
            this.toast.warning('Judul RAB wajib diisi')
            return
        }
        
        this.loading = true
        try {
          const res = await api.post('/calculator/rab', {
              id_shopping_plan: this.selectedPlan.id_shopping_plan,
              judul: this.saveForm.judul,
              keterangan: this.saveForm.keterangan,
              tanggal: this.selectedPlan.tanggal_rencana,
              snapshot_items: this.shoppingItems, // Send the exact items viewed in frontend
              snapshot_pagu: this.beneficiarySummary,
              rate_besar: this.rateBesar,
              rate_kecil: this.rateKecil
          })
          
          if (res.data.success) {
              this.toast.success('RAB berhasil disimpan!')
              this.showSaveModal = false // Close Modal
              this.mode = 'list' // Back to list
              this.loadRABs() // Reload list
          }
        } catch (err) {
            console.error(err)
            this.toast.error('Gagal membuat RAB: ' + (err.response?.data?.message || err.message))
        } finally {
            this.loading = false
        }
    },
    
    // Existing Helper Methods
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
     clearSelection() {
        this.selectedPlanId = null
        this.selectedPlan = null
        this.shoppingItems = []
        this.beneficiaries = []
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

}
</script>

<style>
/* Print Styles - Global to affect Teleported Modals */
@media print {
    /* Hide everything initially */
    @page { 
        margin: 1cm; /* Reasonable margin, often supresses default headers if strict enough, but browsers vary */
        size: auto;
    }

    body > * {
        visibility: hidden !important;
    }
    
    /* Re-display the active modal */
    body > .modal.d-block {
        visibility: visible !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        z-index: 9999 !important;
    }

    /* Modal Backdrop */
    .modal-backdrop {
        display: none !important;
    }

    /* Reset Modal Positioning for Print */
    .modal.d-block .modal-dialog {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
    }

    .modal.d-block .modal-content {
        border: none !important;
        box-shadow: none !important;
    }

    .modal.d-block .modal-header,
    .modal.d-block .modal-footer {
        border: none !important;
    }

    /* Hide Controls & Buttons */
    .modal.d-block .btn-close,
    .modal.d-block .modal-footer, 
    .modal.d-block .btn {
        display: none !important;
    }

    /* Enhance Header */
    .modal.d-block .modal-header {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        margin-bottom: 30px !important;
        border-bottom: 2px solid #000 !important;
        padding-bottom: 15px !important;
    }

    .modal.d-block .modal-title {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 20pt !important;
        font-weight: 800 !important;
        color: #000 !important;
        margin-bottom: 5px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    }

    /* Company Header Stub */
    .modal-print-header {
        display: none !important;
    }

    .modal.d-block .modal-print-header {
        display: block !important;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 11pt !important;
        font-weight: 600 !important;
        color: #444 !important;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    /* Table Improvements - Modern Look */
    .modal.d-block .table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 9.5pt !important;
        color: #000 !important;
        margin-bottom: 20px !important;
    }
    
    .modal.d-block .table th {
        background-color: #f8f9fa !important; /* Lighter grey */
        color: #000 !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        font-size: 8.5pt !important;
        letter-spacing: 0.5px !important;
        border-bottom: 2px solid #000 !important;
        border-top: 1px solid #000 !important;
        vertical-align: middle !important;
    }

    .modal.d-block .table td {
        border-bottom: 1px solid #ddd !important;
        padding: 8px 10px !important;
        vertical-align: middle !important;
    }
    
    /* Remove vertical borders for cleaner look, or keep them subtle */
    .modal.d-block .table th, 
    .modal.d-block .table td {
        border-left: none !important;
        border-right: none !important;
    }

    /* Row striping for readability */
    .modal.d-block .table tbody tr:nth-of-type(odd) {
        background-color: rgba(0,0,0,0.02) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    /* Summary / Totals Styling */
    .modal.d-block .alert {
        border: 1px solid #000 !important;
        background-color: #fff !important;
        border-radius: 4px !important;
        padding: 15px !important;
    }
    
    .modal.d-block h4 {
        font-size: 14pt !important;
        font-weight: bold !important;
        margin: 0 !important;
    }

    /* Layout Adjustments */
    .modal.d-block .row {
        display: flex !important;
        flex-wrap: nowrap !important;
        margin-bottom: 20px !important;
        gap: 20px !important;
    }
    
    .modal.d-block .col-md-6 {
        width: 50% !important;
        flex: 1 !important;
    }
    
    /* Info Table (Top of RAB Modal) cleaning */
    .modal.d-block .table-borderless td {
        border: none !important;
        padding: 4px 0 !important;
    }
}

/* GLOBAL OVERRIDE FOR SWEETALERT on top of High-Z-Index Modals */
div:where(.swal2-container) {
  z-index: 2060 !important;
}
</style>
