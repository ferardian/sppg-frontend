<template>
  <div>
    <!-- Main Content (hidden when printing) -->
    <div class="no-print">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">
        <i class="bi bi-truck me-2"></i>Distribusi Makanan
      </h3>
      <button
        class="btn btn-primary btn-lg rounded-pill px-4"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; border: none !important;"
        @click="showAddForm = true"
        :disabled="loading"
      >
        <i class="bi bi-plus-circle me-2"></i>Catat Distribusi
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-12">
        <div class="card border-primary">
          <div class="card-header text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;">
            <h6 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>Summary Distribusi Hari Ini
            </h6>
          </div>
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-4">
                <label class="form-label small">Pilih Tanggal:</label>
                <input
                  type="date"
                  v-model="summaryDate"
                  class="form-control"
                  @change="loadSummaryData"
                >
              </div>
              <div class="col-md-8">
                <div class="row text-center" v-if="summaryData">
                  <div class="col-md-2">
                    <div class="card bg-light border-info">
                      <div class="card-body p-2">
                        <h6 class="text-info mb-1">Total</h6>
                        <h4 class="mb-0 text-info">{{ formatNumber(summaryData.total_porsi) }}</h4>
                        <small class="text-muted">porsi</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="card bg-light border-warning">
                      <div class="card-body p-2">
                        <h6 class="text-warning mb-1">Sarapan</h6>
                        <h4 class="mb-0 text-warning">{{ formatNumber(summaryData.sarapan) }}</h4>
                        <small class="text-muted">porsi</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="card bg-light border-success">
                      <div class="card-body p-2">
                        <h6 class="text-success mb-1">Makan Siang</h6>
                        <h4 class="mb-0 text-success">{{ formatNumber(summaryData.makan_siang) }}</h4>
                        <small class="text-muted">porsi</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="card bg-light border-danger">
                      <div class="card-body p-2">
                        <h6 class="text-danger mb-1">Makan Malam</h6>
                        <h4 class="mb-0 text-danger">{{ formatNumber(summaryData.makan_malam) }}</h4>
                        <small class="text-muted">porsi</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="card bg-light border-secondary">
                      <div class="card-body p-2">
                        <h6 class="text-secondary mb-1">Snack</h6>
                        <h4 class="mb-0 text-secondary">{{ formatNumber(summaryData.snack) }}</h4>
                        <small class="text-muted">porsi</small>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Menu Information -->
                <div class="row mt-3" v-if="summaryData && summaryData.menus">
                  <div class="col-12">
                    <h6 class="text-muted mb-2">
                      <i class="bi bi-utensils me-2"></i>Distribusi Menu per Porsi
                    </h6>
                    <div class="row text-center">
                      <!-- Sarapan -->
                      <div class="col-md-3" v-if="summaryData.menus.sarapan">
                        <div class="card bg-light border-warning">
                          <div class="card-body p-2">
                            <h6 class="text-warning mb-1">Sarapan</h6>
                            <!-- Old format (single menu) -->
                            <div v-if="summaryData.menus.sarapan.nama_menu && !Array.isArray(summaryData.menus.sarapan)">
                              <div class="fw-bold small">{{ summaryData.menus.sarapan.nama_menu }}</div>
                              <small class="text-muted">{{ formatNumber(summaryData.menus.sarapan.jumlah_distribusi) }} distribusi</small>
                            </div>
                            <!-- New format (array of menus) -->
                            <div v-else-if="Array.isArray(summaryData.menus.sarapan) && summaryData.menus.sarapan.length > 0">
                              <div class="small text-start" v-for="menu in summaryData.menus.sarapan.slice(0, 2)" :key="menu.nama_menu">
                                <div class="fw-bold">{{ menu.nama_menu }}</div>
                                <div class="fs-5 text-warning fw-bold">{{ formatNumber(menu.total_porsi) }}</div>
                                <small class="text-muted">porsi</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Makan Siang -->
                      <div class="col-md-3" v-if="summaryData.menus.makan_siang">
                        <div class="card bg-light border-success">
                          <div class="card-body p-2">
                            <h6 class="text-success mb-1">Makan Siang</h6>
                            <!-- Old format (single menu) -->
                            <div v-if="summaryData.menus.makan_siang.nama_menu && !Array.isArray(summaryData.menus.makan_siang)">
                              <div class="fw-bold small">{{ summaryData.menus.makan_siang.nama_menu }}</div>
                              <small class="text-muted">{{ formatNumber(summaryData.menus.makan_siang.jumlah_distribusi) }} distribusi</small>
                            </div>
                            <!-- New format (array of menus) -->
                            <div v-else-if="Array.isArray(summaryData.menus.makan_siang) && summaryData.menus.makan_siang.length > 0">
                              <div class="small text-start" v-for="menu in summaryData.menus.makan_siang.slice(0, 2)" :key="menu.nama_menu">
                                <div class="fw-bold">{{ menu.nama_menu }}</div>
                                <div class="fs-5 text-success fw-bold">{{ formatNumber(menu.total_porsi) }}</div>
                                <small class="text-muted">porsi</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Makan Malam -->
                      <div class="col-md-3" v-if="summaryData.menus.makan_malam">
                        <div class="card bg-light border-danger">
                          <div class="card-body p-2">
                            <h6 class="text-danger mb-1">Makan Malam</h6>
                            <!-- Old format (single menu) -->
                            <div v-if="summaryData.menus.makan_malam.nama_menu && !Array.isArray(summaryData.menus.makan_malam)">
                              <div class="fw-bold small">{{ summaryData.menus.makan_malam.nama_menu }}</div>
                              <small class="text-muted">{{ formatNumber(summaryData.menus.makan_malam.jumlah_distribusi) }} distribusi</small>
                            </div>
                            <!-- New format (array of menus) -->
                            <div v-else-if="Array.isArray(summaryData.menus.makan_malam) && summaryData.menus.makan_malam.length > 0">
                              <div class="small text-start" v-for="menu in summaryData.menus.makan_malam.slice(0, 2)" :key="menu.nama_menu">
                                <div class="fw-bold">{{ menu.nama_menu }}</div>
                                <div class="fs-5 text-danger fw-bold">{{ formatNumber(menu.total_porsi) }}</div>
                                <small class="text-muted">porsi</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Snack -->
                      <div class="col-md-3" v-if="summaryData.menus.snack">
                        <div class="card bg-light border-secondary">
                          <div class="card-body p-2">
                            <h6 class="text-secondary mb-1">Snack</h6>
                            <!-- Old format (single menu) -->
                            <div v-if="summaryData.menus.snack.nama_menu && !Array.isArray(summaryData.menus.snack)">
                              <div class="fw-bold small">{{ summaryData.menus.snack.nama_menu }}</div>
                              <small class="text-muted">{{ formatNumber(summaryData.menus.snack.jumlah_distribusi) }} distribusi</small>
                            </div>
                            <!-- New format (array of menus) -->
                            <div v-else-if="Array.isArray(summaryData.menus.snack) && summaryData.menus.snack.length > 0">
                              <div class="small text-start" v-for="menu in summaryData.menus.snack.slice(0, 2)" :key="menu.nama_menu">
                                <div class="fw-bold">{{ menu.nama_menu }}</div>
                                <div class="fs-5 text-secondary fw-bold">{{ formatNumber(menu.total_porsi) }}</div>
                                <small class="text-muted">porsi</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center text-muted">
                  <i class="bi bi-calendar-check me-2"></i>Pilih tanggal untuk melihat summary distribusi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showAddForm" ref="formCard" class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi me-2" :class="isEdit ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
          {{ isEdit ? 'Edit' : 'Catat' }} Distribusi Makanan
        </h5>
        <button
          class="btn btn-outline-secondary btn-sm"
          @click="resetForm"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="card-body">
         <!-- Rencana Distribusi Section -->
        <div class="mb-4 p-3 bg-light rounded border-start border-4 border-primary">
          <div class="row align-items-end g-3">
             <div class="col-md-5">
               <label class="form-label fw-bold text-primary">
                 <i class="bi bi-cart4 me-2"></i>Rencana Distribusi
               </label>
               <v-select
                  v-model="selectedPlanId"
                  :options="shoppingPlans"
                  :reduce="plan => plan.id_shopping_plan"
                  label="nama_menu"
                  placeholder="Pilih Rencana Belanja..."
                  @update:modelValue="loadPlanDetails"
                  class="bg-white"
               >
                 <template #option="{ nama_menu, tanggal_rencana }">
                    <div>
                      <div class="fw-bold text-truncate" style="max-width: 400px;">{{ nama_menu || 'Rencana Tanpa Menu' }}</div>
                      <small class="text-muted">{{ formatDate(tanggal_rencana) }}</small>
                    </div>
                 </template>
               </v-select>
             </div>
             
             <div class="col-md-7">
                <div v-if="plannedDistributions.length > 0" class="small text-muted mb-2">
                   <i class="bi bi-check-circle-fill text-success me-1"></i>
                   Item Rencana Tersedia:
                </div>
                <div v-if="plannedDistributions.length > 0" class="d-flex flex-wrap gap-2">
                   <button 
                      v-for="(item, idx) in plannedDistributions" 
                      :key="idx"
                      type="button"
                      class="btn btn-sm btn-outline-primary d-flex align-items-center"
                      @click="fillFromPlan(item)"
                      :class="{'active': form.id_menu === item.menu_id && form.id_jenis_porsi === item.portion_id}"
                   >
                      <i class="bi bi-box-seam me-1"></i>
                      {{ item.menu_name }} - {{ item.portion_name }}
                      <span class="badge bg-primary ms-2">{{ item.quantity }}</span>
                   </button>
                </div>
                <div v-else-if="selectedPlanId" class="text-muted small fst-italic mt-2">
                   <i class="bi bi-info-circle me-1"></i>
                   Memuat detail rencana...
                </div>
             </div>
          </div>
        </div>
        
        <form @submit.prevent="saveForm">
          <div class="row">
            <!-- Tanggal Distribusi -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Distribusi *</label>
              <input
                v-model="form.tanggal_distribusi"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.tanggal_distribusi }"
                required
              >
              <div class="invalid-feedback" v-if="errors.tanggal_distribusi">
                {{ errors.tanggal_distribusi }}
              </div>
            </div>

            <!-- Waktu Makan -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Waktu Makan *</label>
              <v-select
                v-model="form.waktu_makan"
                :options="waktuMakanOptions"
                :reduce="option => option.value"
                label="label"
                placeholder="Pilih Waktu Makan"
                :class="{ 'is-invalid': errors.waktu_makan }"
              ></v-select>
              <div class="invalid-feedback" v-if="errors.waktu_makan">
                {{ errors.waktu_makan }}
              </div>
            </div>



            <!-- Menu -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Menu *</label>
              <select
                v-model="form.id_menu"
                class="form-select"
                :class="{ 'is-invalid': errors.id_menu }"
                @change="onMenuChange"
                required
              >
                <option value="">Pilih Menu</option>
                <option v-for="menu in menuList" :key="menu.id_menu" :value="menu.id_menu">
                  {{ menu.nama_menu }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.id_menu">
                {{ errors.id_menu }}
              </div>
            </div>

            <!-- Jenis Porsi -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Jenis Porsi *</label>
              <select
                v-model="form.id_jenis_porsi"
                class="form-select"
                :class="{ 'is-invalid': errors.id_jenis_porsi }"
                @change="calculateTotalKalori"
                required
              >
                <option value="">Pilih Jenis Porsi</option>
                <option v-for="jenis in jenisPorsiList" :key="jenis.id_jenis_porsi" :value="jenis.id_jenis_porsi">
                  {{ jenis.nama_jenis_porsi }} ({{ jenis.besaran_porsi }})
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.id_jenis_porsi">
                {{ errors.id_jenis_porsi }}
              </div>
            </div>

            <!-- Jumlah Porsi -->
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Jumlah Porsi *
              </label>
              <input
                v-model.number="form.jumlah_porsi"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.jumlah_porsi }"
                placeholder="Jumlah porsi yang akan didistribusikan"
                min="1"
                @input="calculateTotalKalori"
                required
              >

              <div class="invalid-feedback" v-if="errors.jumlah_porsi">
                {{ errors.jumlah_porsi }}
              </div>
            </div>

            <!-- Pegawai -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Petugas Distribusi</label>
              <v-select
                v-model="form.id_pegawai"
                :options="pegawaiList"
                :reduce="pegawai => pegawai.id_pegawai"
                label="nama_lengkap"
                placeholder="Pilih Petugas"
                :class="{ 'is-invalid': errors.id_pegawai }"
              ></v-select>
              <div class="invalid-feedback" v-if="errors.id_pegawai">
                {{ errors.id_pegawai }}
              </div>
            </div>

            <!-- Status Distribusi -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Status Distribusi *</label>
              <v-select
                v-model="form.status_distribusi"
                :options="statusOptions"
                :reduce="option => option.value"
                label="label"
                placeholder="Pilih Status"
                :class="{ 'is-invalid': errors.status_distribusi }"
              >
                 <template #option="{ label, color }">
                    <span :class="`badge bg-${color}`">{{ label }}</span>
                 </template>
                 <template #selected-option="{ label, color }">
                    <span :class="`badge bg-${color}`">{{ label }}</span>
                 </template>
              </v-select>
              <div class="invalid-feedback" v-if="errors.status_distribusi">
                {{ errors.status_distribusi }}
              </div>
            </div>
          </div>

          <!-- Nutritional Information Display -->
          <div v-if="selectedMenu && selectedJenisPorsi" class="row mb-3">
            <div class="col-12">
              <div class="alert alert-info">
                <h6 class="alert-heading">
                  <i class="bi bi-info-circle me-2"></i>Informasi Nutrisi per Porsi
                </h6>
                <div class="row">
                  <div class="col-md-3">
                    <strong>Kalori:</strong> {{ formatNumber(nutritionalInfo.kalori) }} kcal
                  </div>
                  <div class="col-md-3">
                    <strong>Protein:</strong> {{ formatNumber(nutritionalInfo.protein) }} g
                  </div>
                  <div class="col-md-3">
                    <strong>Karbohidrat:</strong> {{ formatNumber(nutritionalInfo.karbohidrat) }} g
                  </div>
                  <div class="col-md-3">
                    <strong>Lemak:</strong> {{ formatNumber(nutritionalInfo.lemak) }} g
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Total Kalori ({{ form.jumlah_porsi }} porsi):</strong>
                    <span class="fs-5 text-primary"> {{ formatNumber(totalKalori) }} kcal</span>
                  </div>

                </div>
              </div>
            </div>
          </div>



          <!-- Calculator Nutrisi -->
          <div v-if="calculatorData.ingredients.length > 0" class="card mb-3 border-info">
            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="bi bi-calculator me-2"></i>Kalkulator Nutrisi (Berdasarkan Bahan Baku)
              </h6>
              <span class="badge bg-light text-dark">
                {{ calculatorData.ingredients.filter(i => i.included).length }} Bahan Dipilih
              </span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="text-center" style="width: 50px">Use</th>
                      <th class="text-center" style="width: 50px">Link</th>
                      <th>Bahan Baku</th>
                      <th class="text-center bg-light border-start border-end">Net (g)</th>
                      <th class="text-end">Energi (kcal)</th>
                      <th class="text-end">Protein (g)</th>
                      <th class="text-end">Lemak (g)</th>
                      <th class="text-end">KH (g)</th>
                      <th class="text-end">Serat (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(bahan, index) in calculatorData.ingredients" :key="index" :class="{'table-active': !bahan.included}">
                      <td class="text-center">
                        <div class="form-check d-flex justify-content-center">
                          <input class="form-check-input" type="checkbox" v-model="bahan.included">
                        </div>
                      </td>
                      <td class="text-center">
                        <button 
                            type="button"
                            class="btn btn-sm p-0 d-flex align-items-center justify-content-center mx-auto" 
                            :class="bahan.komposisi_pangan ? 'btn-outline-success' : 'btn-outline-secondary'"
                            style="width: 28px; height: 28px; border-radius: 50%;" 
                            @click="openSelector(index)" 
                            :title="bahan.komposisi_pangan ? 'Ganti Data Nutrisi' : 'Cari Data Nutrisi'"
                        >
                          <i class="bi" :class="bahan.komposisi_pangan ? 'bi-pencil-fill' : 'bi-search'" style="font-size: 0.8rem;"></i>
                        </button>
                      </td>
                      <td>
                        <div class="fw-bold">{{ bahan.nama_bahan_baku }}</div>
                        <div v-if="bahan.komposisi_pangan" class="small text-success d-flex align-items-center mt-1">
                             <i class="bi bi-link-45deg me-1"></i>
                             <span class="text-truncate" style="max-width: 200px;">{{ bahan.komposisi_pangan.nama_bahan }}</span>
                        </div>
                        <small class="text-muted d-block mt-1" v-else>
                          <i class="bi bi-exclamation-circle text-warning me-1"></i>Belum terhubung
                        </small>
                      </td>
                      <td class="text-center border-start border-end bg-light fw-bold">
                           {{ formatNumber(bahan.jumlah_bahan) }}
                      </td>
                      <td class="text-end" :class="{'text-muted': !bahan.included}">
                        {{ bahan.komposisi_pangan ? formatNumber(getCalculatedNutrition(bahan, 'kalori')) : '-' }}
                      </td>
                      <td class="text-end" :class="{'text-muted': !bahan.included}">
                        {{ bahan.komposisi_pangan ? formatNumber(getCalculatedNutrition(bahan, 'protein')) : '-' }}
                      </td>
                      <td class="text-end" :class="{'text-muted': !bahan.included}">
                        {{ bahan.komposisi_pangan ? formatNumber(getCalculatedNutrition(bahan, 'lemak')) : '-' }}
                      </td>
                      <td class="text-end" :class="{'text-muted': !bahan.included}">
                        {{ bahan.komposisi_pangan ? formatNumber(getCalculatedNutrition(bahan, 'karbohidrat')) : '-' }}
                      </td>
                      <td class="text-end" :class="{'text-muted': !bahan.included}">
                        {{ bahan.komposisi_pangan ? formatNumber(getCalculatedNutrition(bahan, 'serat')) : '-' }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td colspan="4" class="text-end">Total Nilai Gizi:</td>
                      <td class="text-end fs-6 text-primary">{{ formatNumber(calculatedTotals.kalori) }}</td>
                      <td class="text-end fs-6 text-primary">{{ formatNumber(calculatedTotals.protein) }}</td>
                      <td class="text-end fs-6 text-primary">{{ formatNumber(calculatedTotals.lemak) }}</td>
                      <td class="text-end fs-6 text-primary">{{ formatNumber(calculatedTotals.karbohidrat) }}</td>
                      <td class="text-end fs-6 text-primary">{{ formatNumber(calculatedTotals.serat) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="card-footer bg-white text-end">
              <button type="button" class="btn btn-info text-white btn-sm" @click="applyCalculation">
                <i class="bi bi-arrow-down-circle me-1"></i> Terapkan ke Nilai Gizi Aktual
              </button>
            </div>
          </div>

          <!-- Nilai Gizi Aktual -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-activity me-2"></i>Nilai Gizi Aktual (Manual Input)
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label d-flex align-items-center">
                    <span class="badge bg-danger me-2">K</span>
                    Kalori Aktual (kcal)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    v-model="form.kalori_aktual"
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label d-flex align-items-center">
                    <span class="badge bg-primary me-2">P</span>
                    Protein Aktual (gram)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    v-model="form.protein_aktual"
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label d-flex align-items-center">
                    <span class="badge bg-warning me-2">KH</span>
                    Karbohidrat Aktual (gram)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    v-model="form.karbohidrat_aktual"
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label d-flex align-items-center">
                    <span class="badge bg-success me-2">L</span>
                    Lemak Aktual (gram)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    v-model="form.lemak_aktual"
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label d-flex align-items-center">
                    <span class="badge bg-info me-2">S</span>
                    Serat Aktual (gram)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    v-model="form.serat_aktual"
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Catatan -->
          <div class="mb-3">
            <label class="form-label">Catatan</label>
            <textarea
              v-model="form.catatan"
              class="form-control"
              rows="3"
              placeholder="Tambahkan catatan distribusi..."
            ></textarea>
          </div>

          <!-- Form Actions -->
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
              :disabled="saving"
            >
              <i class="bi bi-x-lg me-2"></i>Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <i class="bi me-2" :class="saving ? 'bi-hourglass-split' : 'bi-check-lg'"></i>
              {{ saving ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Pencarian</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="Cari distribusi..."
              @input="debouncedSearch"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label">Waktu Makan</label>
            <select
              v-model="filters.waktu_makan"
              class="form-select"
              @change="loadData"
            >
              <option value="">Semua</option>
              <option v-for="option in waktuMakanOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select
              v-model="filters.status"
              class="form-select"
              @change="loadData"
            >
              <option value="">Semua</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Tanggal Mulai</label>
            <input
              v-model="filters.tanggal_start"
              type="date"
              class="form-control"
              @change="loadData"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label">Tanggal Selesai</label>
            <input
              v-model="filters.tanggal_end"
              type="date"
              class="form-control"
              @change="loadData"
            >
          </div>
          <div class="col-md-2 d-flex align-items-end gap-2">
            <button
              class="btn btn-outline-secondary w-50"
              @click="resetFilters"
              title="Reset Filter"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button
              class="btn btn-primary w-50"
              @click="handlePrint"
              title="Cetak Distribusi"
            >
              <i class="bi bi-printer"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="distribusiList.length === 0" class="text-center py-4">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <h5 class="text-muted mt-3">Tidak ada data distribusi</h5>
          <p class="text-muted">Belum ada data distribusi yang sesuai dengan filter</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th @click="sortBy('tanggal_distribusi')" style="cursor: pointer;">
                  Tanggal
                  <i class="bi bi-arrow-down-up"></i>
                </th>
                <th @click="sortBy('waktu_makan')" style="cursor: pointer;">
                  Waktu
                  <i class="bi bi-arrow-down-up"></i>
                </th>

                <th>Menu</th>
                <th>Jenis Porsi</th>
                <th>Jml Porsi</th>
                <th>Penerima Manfaat</th>
                <th>Nutrisi Aktual</th>
                <th @click="sortBy('status_distribusi')" style="cursor: pointer;">
                  Status
                  <i class="bi bi-arrow-down-up"></i>
                </th>
                <th>Petugas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="item.id_distribusi">
                <td>{{ formatDate(item.tanggal_distribusi) }}</td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ getWaktuMakanLabel(item.waktu_makan) }}
                  </span>
                </td>

                <td>{{ item.nama_menu || '-' }}</td>
                <td><span class="badge bg-info text-white">{{ item.nama_jenis_porsi || '-' }}</span></td>
                <td class="text-center">{{ item.jumlah_porsi }}</td>
                <td>
                   <div v-if="item.penerima_manfaat && item.penerima_manfaat.length > 0">
                      <div class="d-flex flex-wrap gap-1">
                        <span v-for="penerima in item.penerima_manfaat" :key="penerima.id_penerima" class="badge bg-secondary text-white" style="font-size: 0.7rem;">
                          {{ penerima.nama_penerima }} <span class="fw-bold text-warning ms-1">({{ getPortionCode(item.nama_jenis_porsi) }}={{ penerima.jumlah_porsi }})</span>
                        </span>
                      </div>
                   </div>
                   <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="nutrisi-aktual" v-if="hasNutritionalData(item.gizi_aktual)">
                    <div class="d-flex gap-1 flex-wrap">
                      <span class="badge bg-danger text-white" title="Kalori Aktual">
                        K: {{ formatNumber(item.gizi_aktual.kalori_aktual) }} kcal
                      </span>
                      <span class="badge bg-primary text-white" title="Protein Aktual">
                        P: {{ formatNumber(item.gizi_aktual.protein_aktual) }}g
                      </span>
                      <span class="badge bg-warning text-dark" title="Karbohidrat Aktual">
                        KH: {{ formatNumber(item.gizi_aktual.karbohidrat_aktual) }}g
                      </span>
                      <span class="badge bg-success text-white" title="Lemak Aktual">
                        L: {{ formatNumber(item.gizi_aktual.lemak_aktual) }}g
                      </span>
                      <span class="badge bg-secondary text-white" title="Serat Aktual" v-if="item.gizi_aktual.serat_aktual && item.gizi_aktual.serat_aktual > 0">
                        S: {{ formatNumber(item.gizi_aktual.serat_aktual) }}g
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-muted small">
                    <em>Belum ada data</em>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(item.status_distribusi)">
                    {{ getStatusLabel(item.status_distribusi) }}
                  </span>
                </td>
                <td>{{ item.nama_pegawai || '-' }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="editItem(item)"
                      :disabled="loading"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="confirmDelete(item)"
                      :disabled="loading"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- Nutrition Selector Modal -->
    <KomposisiPanganSelectorModal 
      :isVisible="showSelectorModal" 
      @close="showSelectorModal = false"
      @select="handleNutritionSelect"
    />
    </div>
    <!-- End of Main Content -->

    <!-- Printable Section -->
    <div id="print-area" class="print-only">
        <div class="print-header text-center">
            <h2 class="mb-1">{{ sppgData.nama_sppg || 'SPPG - Satuan Pelayanan Pemenuhan Gizi' }}</h2>
            <h3 class="mb-2">Jadwal Distribusi Makanan</h3>
            <p class="mb-0" v-if="filters.tanggal_start && filters.tanggal_end">
                Periode: {{ formatDate(filters.tanggal_start) }} - {{ formatDate(filters.tanggal_end) }}
            </p>
            <p class="mb-0" v-else-if="filters.tanggal_start">
                Tanggal: {{ formatDate(filters.tanggal_start) }}
            </p>
        </div>

        <div v-for="(mealGroups, date) in printGroupedData" :key="date" class="mb-4">
            <h4 class="border-bottom border-dark pb-1">{{ formatDate(date) }}</h4>
            
            <div v-for="(menus, mealType) in mealGroups" :key="mealType" class="mb-4">
                <!-- Removed meal time header as requested -->
                
                <div v-for="menu in menus" :key="menu.id_menu" class="mb-3 ps-2">
                   <div class="d-flex justify-content-between align-items-center mb-1">
                       <span class="fw-bold">{{ menu.nama_menu }}</span>
                       <span class="badge border border-dark text-dark">
                           {{ formatNumber(menu.total_porsi) }} Porsi
                           <span v-if="menu.porsi_besar > 0"> (B={{ menu.porsi_besar }}</span><span v-if="menu.porsi_sedang > 0"><span v-if="menu.porsi_besar > 0">, </span>S={{ menu.porsi_sedang }}</span><span v-if="menu.porsi_kecil > 0"><span v-if="menu.porsi_besar > 0 || menu.porsi_sedang > 0">, </span>K={{ menu.porsi_kecil }}</span><span v-if="menu.porsi_besar > 0 || menu.porsi_sedang > 0 || menu.porsi_kecil > 0">)</span>
                       </span>
                   </div>
                   
                   <table class="print-table">
                       <thead>
                           <tr>
                               <th style="width: 5%">No</th>
                               <th style="width: 40%">Penerima Manfaat</th>
                               <th style="width: 15%">Jenis Porsi</th>
                               <th style="width: 10%">Qty</th>
                               <th style="width: 15%">Serah Terima</th>
                               <th style="width: 15%">Ket</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr v-for="(item, idx) in menu.items" :key="item.id_distribusi">
                               <td class="text-center">{{ idx + 1 }}</td>
                               <td>
                                   <div v-for="p in item.penerima_manfaat" :key="p.id_penerima" class="mb-1">
                                       {{ p.nama_penerima }}
                                   </div>
                               </td>
                               <td class="text-center">{{ getPortionCode(item.nama_jenis_porsi) }}</td>
                               <td class="text-center">
                                   <!-- Sum quantity for the row? Or check if list -->
                                    <div v-for="p in item.penerima_manfaat" :key="'q'+p.id_penerima" class="mb-1">
                                       {{ p.jumlah_porsi }}
                                   </div>
                               </td>
                               <td></td> <!-- Checkbox area -->
                               <td>{{ item.catatan }}</td>
                           </tr>
                       </tbody>
                   </table>
                </div>
            </div>
            <div class="page-break"></div>
        </div>
        
        <!-- Footer / Signature -->
        <div class="mt-5 d-flex justify-content-between px-5">
            <div class="text-center">
                <p class="mb-5">Petugas Distribusi</p>
                <p class="fw-bold">( ............................. )</p>
            </div>
            <div class="text-center">
                <p class="mb-5">Mengetahui</p>
                <p class="fw-bold">( ............................. )</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import distribusiMakananService from '@/services/distribusiMakananService'
import menuService from '@/services/menuService'
import bahanBakuService from '@/services/bahanBakuService'
import { useToast } from 'vue-toastification'
import KomposisiPanganSelectorModal from '@/components/KomposisiPanganSelectorModal.vue'
import api from '@/services/api'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import html2pdf from 'html2pdf.js'

export default {
  name: 'DistribusiMakananView',
  components: {
    KomposisiPanganSelectorModal,
    vSelect
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      loading: false,
      saving: false,
      showAddForm: false,
      isEdit: false,
      summaryDate: new Date().toISOString().split('T')[0], // Default to today
      summaryData: null,
      calculatorData: {
        ingredients: [],
        loading: false
      },
      showSelectorModal: false,
      selectedIngredientIndex: null,
      distribusiList: [],
      penerimaList: [],
      // Plan related data
      shoppingPlans: [],
      selectedPlanId: null,
      plannedDistributions: [],
      
      menuList: [],
      pegawaiList: [],
      jenisPorsiList: [],
      waktuMakanOptions: [],
      statusOptions: [],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      sortByField: 'tanggal_distribusi',
      sortDirection: 'desc',
      filters: {
        search: '',
        waktu_makan: '',
        status: '',
        tanggal_start: '',
        tanggal_end: ''
      },
      form: {

        id_menu: '',
        id_jenis_porsi: '',
        id_pegawai: '',
        tanggal_distribusi: this.getCurrentDate(),
        waktu_makan: '',
        jumlah_porsi: 1,
        kalori_aktual: '',
        protein_aktual: '',
        karbohidrat_aktual: '',
        lemak_aktual: '',
        serat_aktual: '',
        status_distribusi: 'direncanakan',
        catatan: ''
      },
      errors: {},
      searchTimeout: null,
      sppgData: {}
    }
  },
  computed: {
    selectedMenu() {
      return this.menuList.find(menu => menu.id_menu === this.form.id_menu)
    },
    selectedJenisPorsi() {
      return this.jenisPorsiList.find(jenis => jenis.id_jenis_porsi === this.form.id_jenis_porsi)
    },

    nutritionalInfo() {
      if (!this.selectedMenu || !this.selectedJenisPorsi) {
        return {
          kalori: 0,
          protein: 0,
          karbohidrat: 0,
          lemak: 0
        }
      }

      const multiplier = this.selectedJenisPorsi.faktor_pengali || 1
      return {
        kalori: Math.round(this.selectedMenu.kalori * multiplier),
        protein: Math.round(this.selectedMenu.protein * multiplier),
        karbohidrat: Math.round(this.selectedMenu.karbohidrat * multiplier),
        lemak: Math.round(this.selectedMenu.lemak * multiplier)
      }
    },
    totalKalori() {
      return Math.round(this.nutritionalInfo.kalori * (this.form.jumlah_porsi || 1))
    },
    filteredData() {
      let filtered = [...this.distribusiList]

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.nama_menu?.toLowerCase().includes(searchTerm) ||
          item.nama_pegawai?.toLowerCase().includes(searchTerm)
        )
      }

      if (this.filters.waktu_makan) {
        filtered = filtered.filter(item => item.waktu_makan === this.filters.waktu_makan)
      }

      if (this.filters.status) {
        filtered = filtered.filter(item => item.status_distribusi === this.filters.status)
      }

      if (this.filters.tanggal_start) {
        filtered = filtered.filter(item =>
          new Date(item.tanggal_distribusi) >= new Date(this.filters.tanggal_start)
        )
      }

      if (this.filters.tanggal_end) {
        filtered = filtered.filter(item =>
          new Date(item.tanggal_distribusi) <= new Date(this.filters.tanggal_end)
        )
      }

      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.perPage)
    },
    printGroupedData() {
        // Group filtered data by Date -> Meal Time -> Menu
        const grouped = {}
        const sortedData = [...this.filteredData].sort((a, b) => {
            // Sort by Date, then by Meal order
            const dateA = new Date(a.tanggal_distribusi)
            const dateB = new Date(b.tanggal_distribusi)
            if (dateA - dateB !== 0) return dateA - dateB
            
            const mealOrder = { 'sarapan': 1, 'snack': 2, 'makan_siang': 3, 'makan_malam': 4 }
            return (mealOrder[a.waktu_makan] || 99) - (mealOrder[b.waktu_makan] || 99)
        })

        sortedData.forEach(item => {
            const date = item.tanggal_distribusi ? item.tanggal_distribusi.substring(0, 10) : 'Unknown'
            if (!grouped[date]) grouped[date] = {}
            
            const meal = item.waktu_makan
            if (!grouped[date][meal]) grouped[date][meal] = []
            
            // Check if menu group already exists
            let menuGroup = grouped[date][meal].find(g => g.id_menu === item.id_menu)
            if (!menuGroup) {
                menuGroup = {
                    id_menu: item.id_menu,
                    nama_menu: item.nama_menu,
                    total_porsi: 0,
                    porsi_besar: 0,
                    porsi_sedang: 0,
                    porsi_kecil: 0,
                    items: [] // List of distributions (beneficiaries)
                }
                grouped[date][meal].push(menuGroup)
            }
            
            // Add to total and breakdown by portion type
            menuGroup.total_porsi += item.jumlah_porsi
            
            const porsiName = (item.nama_jenis_porsi || '').toLowerCase()
            if (porsiName.includes('besar')) {
                menuGroup.porsi_besar += item.jumlah_porsi
            } else if (porsiName.includes('sedang')) {
                menuGroup.porsi_sedang += item.jumlah_porsi
            } else if (porsiName.includes('kecil')) {
                menuGroup.porsi_kecil += item.jumlah_porsi
            }
            
            menuGroup.items.push(item)
        })
        
        return grouped
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredData.slice(start, end)
    },
    printTotalBreakdown() {
        // Calculate grand total breakdown for print
        const totals = {
            total: 0,
            besar: 0,
            sedang: 0,
            kecil: 0
        }
        
        this.filteredData.forEach(item => {
            totals.total += item.jumlah_porsi || 0
            
            const porsiName = (item.nama_jenis_porsi || '').toLowerCase()
            if (porsiName.includes('besar')) {
                totals.besar += item.jumlah_porsi || 0
            } else if (porsiName.includes('sedang')) {
                totals.sedang += item.jumlah_porsi || 0
            } else if (porsiName.includes('kecil')) {
                totals.kecil += item.jumlah_porsi || 0
            }
        })
        
        return totals
    },
    visiblePages() {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, this.currentPage - delta);
           i <= Math.min(this.totalPages - 1, this.currentPage + delta);
           i++) {
        range.push(i)
      }

      if (this.currentPage - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (this.currentPage + delta < this.totalPages - 1) {
        rangeWithDots.push('...', this.totalPages)
      } else {
        rangeWithDots.push(this.totalPages)
      }

      return rangeWithDots.filter((item, index, arr) =>
        item !== arr[index - 1]
      )
    },
    statusOptions() {
      return distribusiMakananService.getStatusDistribusiOptions()
    },
    calculatedTotals() {
      const totals = {
        kalori: 0,
        protein: 0,
        lemak: 0,
        karbohidrat: 0,
        serat: 0
      }

      this.calculatorData.ingredients.forEach(bahan => {
        if (bahan.included && bahan.komposisi_pangan) {
          // If we have 'berat_bersih' (from Plan) or just 'jumlah_bahan' (Standard), use it.
          // Note: In fillFromPlan we mapped berat_bersih -> jumlah_bahan for consistency in UI.
          // Formula: (Weight / 100) * ValuePer100g
          
          let weight = Number(bahan.jumlah_bahan) || 0
          
          // Optimization: If NOT from plan (Standard), maybe we just sum raw values? 
          // Previous code summed raw values. But "Weight/100 * Content" is universal if weight is in grams.
          // Let's assume standard recipe also uses grams.
          
          // However, previous code was: totals.kalori += Number(bahan.komposisi_pangan.energi_kal)
          // This implies the standard API might return PRE-CALCULATED values per portion? 
          // No, Composition is usually per 100g. If previous code summed raw, it might have been wrong or simplified.
          // User request: "perhitungan kalkulator dari net/100 * kandungan".
          // So we MUST apply formula.
          
         // Check if we should apply formula or raw sum. 
         // If generic load, maybe we stick to raw sum if weight isn't reliable?
         // But let's apply the formula as requested for better accuracy.
         
          const factor = weight / 100
          
          totals.kalori += (Number(bahan.komposisi_pangan.energi_kal) || 0) * factor
          totals.protein += (Number(bahan.komposisi_pangan.protein_g) || 0) * factor
          totals.lemak += (Number(bahan.komposisi_pangan.lemak_g) || 0) * factor
          totals.karbohidrat += (Number(bahan.komposisi_pangan.kh_g) || 0) * factor
          totals.serat += (Number(bahan.komposisi_pangan.serat_g) || 0) * factor
        }
      })

      const porsi = 1 // Requirement: Do not multiply by portion count
      
      return {
        kalori: totals.kalori * porsi,
        protein: totals.protein * porsi,
        lemak: totals.lemak * porsi,
        karbohidrat: totals.karbohidrat * porsi,
        serat: totals.serat * porsi
      }
    }
  },
  watch: {

    distribusiList: {
      handler() {
        // Re-calculate summary when distribusi list changes
        this.loadSummaryData()
      },
      deep: true
    },
    selectedPlanId(newVal) {
        if (newVal) {
            this.loadPlanDetails()
        } else {
            this.plannedDistributions = []
        }
    }
  },
  mounted() {
    this.loadInitialData()
  },
  methods: {
    async loadInitialData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadData(),
          this.loadPenerimaManfaat(),
          this.loadMenu(),
          this.loadPegawai(),
          this.loadJenisPorsi(),
          this.loadShoppingPlans(),
          this.loadSummaryData(),
          this.loadSppgData()
        ])

        // Debug log untuk melihat data yang dimuat
        console.log('🔍 Distribusi Data:', this.distribusiList)
        console.log('🔍 Menu List:', this.menuList)
        console.log('🔍 Penerima List:', this.penerimaList)

        // Debug relasi data di distribusi
        this.distribusiList.forEach(item => {
          console.log('🔍 Item:', {
            id_distribusi: item.id_distribusi,
            nama_menu: item.nama_menu,
            menu: item.menu,
          })
        })

        this.waktuMakanOptions = distribusiMakananService.getWaktuMakanOptions()
        this.statusOptions = distribusiMakananService.getStatusDistribusiOptions()
      } catch (error) {
        console.error('Error loading initial data:', error)
        this.toast.error('Gagal memuat data awal')
      } finally {
        this.loading = false
      }
    },
    async loadData() {
      try {
        const response = await distribusiMakananService.getAll()
        console.log('🔍 Raw Distribusi Response:', response)
        this.distribusiList = response.data || []
        
        // Debug first item to see headers
        if (this.distribusiList.length > 0) {
            console.log('🔍 First Item Data:', {
                id: this.distribusiList[0].id_distribusi,
                penerima_manfaat: this.distribusiList[0].penerima_manfaat,
                nama_menu: this.distribusiList[0].nama_menu
            })
        }
      } catch (error) {
        console.error('Error loading distribusi data:', error)
        this.toast.error('Gagal memuat data distribusi')
      }
    },
    async loadPenerimaManfaat() {
      try {
        const response = await distribusiMakananService.getPenerimaManfaat()
        this.penerimaList = response.data || []
      } catch (error) {
        console.error('Error loading penerima manfaat:', error)
        this.toast.error('Gagal memuat data penerima manfaat')
      }
    },
    async loadMenu() {
      try {
        const response = await distribusiMakananService.getMenu()
        this.menuList = response.data || []
      } catch (error) {
        console.error('Error loading menu:', error)
        this.toast.error('Gagal memuat data menu')
      }
    },
    async loadPegawai() {
      try {
        const response = await distribusiMakananService.getPegawai()
        this.pegawaiList = response.data || []
      } catch (error) {
        console.error('Error loading pegawai:', error)
        this.toast.error('Gagal memuat data pegawai')
      }
    },
     async loadShoppingPlans() {
       try {
          const res = await api.get('/calculator/plans')
          if (res.data.success) {
            this.shoppingPlans = res.data.data
          }
       } catch (err) {
          console.error("Failed to load plans", err)
       }
    },
    async loadSppgData() {
        try {
            const res = await api.get('/sppg')
            if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
                // Get the first SPPG record from the paginated response
                this.sppgData = res.data.data[0]
            }
        } catch (err) {
            console.error("Failed to load SPPG data", err)
            // Use default if API fails
            this.sppgData = { nama_sppg: 'SPPG - Satuan Pelayanan Pemenuhan Gizi' }
        }
    },
    async loadJenisPorsi() {
      try {
        const response = await distribusiMakananService.getJenisPorsi()
        this.jenisPorsiList = response.data || []
      } catch (error) {
        console.error('Error loading jenis porsi:', error)
        this.toast.error('Gagal memuat data jenis porsi')
      }
    },
    async loadPlanDetails() {
       if (!this.selectedPlanId) {
          this.plannedDistributions = []
          return
       }
       
       this.loadingPlan = true
       try {
           const res = await api.get(`/calculator/plans/${this.selectedPlanId}`)
           if (!res.data.success) return
           
           const data = res.data.data
           const plan = data.plan
           const details = data.details // Raw details with berat_bersih
           
           // Group Details by Menu + Portion Type
           const groups = {}
           
           details.forEach(d => {
               // Only process items that are linked to a menu and portion
               if (!d.id_menu || !d.id_jenis_porsi) return
               
               const key = `${d.id_menu}_${d.id_jenis_porsi}`
               if (!groups[key]) {
                   const menu = this.menuList.find(m => m.id_menu == d.id_menu)
                   const porsi = this.jenisPorsiList.find(p => p.id_jenis_porsi == d.id_jenis_porsi)
                   
                   groups[key] = {
                       id_unique: key,
                       menu_id: d.id_menu,
                       menu_name: menu ? menu.nama_menu : `Menu ${d.id_menu}`,
                       portion_id: d.id_jenis_porsi,
                       portion_name: porsi ? porsi.nama_jenis_porsi : `Porsi ${d.id_jenis_porsi}`,
                       ingredients: [],
                       quantity: 0
                   }
               }
               
               groups[key].ingredients.push({
                   id_bahan_baku: d.id_bahan_baku,
                   nama_bahan_baku: d.bahan_baku ? d.bahan_baku.nama_bahan_baku : 'Unknown', // Grab from relation
                   berat_bersih: parseFloat(d.berat_bersih || 0),
                   komposisi_pangan: d.bahan_baku ? d.bahan_baku.komposisi_pangan : null // Grab from relation
               })
           })
           
            // Calculate Quantity based on distribution map (beneficiary count x portion count)
           const distMap = plan.distributions || {}
           
           const getIdPorsiByName = (name) => {
                if (!this.jenisPorsiList) return null
                const found = this.jenisPorsiList.find(p => p.nama_jenis_porsi.toLowerCase().includes(name.toLowerCase()))
                return found ? found.id_jenis_porsi : null
           }
           const idKecil = getIdPorsiByName('kecil')
           const idBesar = getIdPorsiByName('besar')
           const idSedang = getIdPorsiByName('sedang')

           for (const [key, group] of Object.entries(groups)) {
               const beneficiaries = distMap[group.menu_id] || []
               let totalQty = 0
               
               if (Array.isArray(beneficiaries)) {
                    beneficiaries.forEach(bid => {
                        const ben = this.penerimaList.find(b => b.id_penerima == bid)
                        if (!ben) return
                        
                        // Check which portion type this Group is for
                        if (group.portion_id == idBesar) {
                            totalQty += Number(ben.porsi_besar || 0)
                        } else if (group.portion_id == idKecil) {
                            totalQty += Number(ben.porsi_kecil || 0)
                        } else if (idSedang && group.portion_id == idSedang) {
                            totalQty += Number(ben.porsi_sedang || 0)
                        } 
                    })
                    
                   if (totalQty === 0 && beneficiaries.length > 0) {
                        // If no portion config found on beneficiary, default to 1 per beneficiary
                        // But only if this Group matches some default logic? 
                        // Let's just assume count = beneficiaries for robust fallback
                         totalQty = beneficiaries.length 
                   }
               }

               group.quantity = totalQty
           }
           
           this.plannedDistributions = Object.values(groups)
                      if (plan.tanggal_rencana && !this.isEdit) {
                this.form.tanggal_distribusi = this.formatDateForInput(plan.tanggal_rencana)
            }
           
       } catch (err) {
           console.error("Failed to load plan details", err)
           this.toast.error("Gagal memuat detail rencana")
       } finally {
           this.loadingPlan = false
       }
    },

    async fillFromPlan(item) {
        // 1. Set Menu & Portion
        this.form.id_menu = item.menu_id
        this.form.id_jenis_porsi = item.portion_id
        
        // 2. Set Default Quantity from Plan
        this.form.jumlah_porsi = item.quantity > 0 ? item.quantity : 1
                
        // 3. Load Calculator with CUSTOM ingredients from Plan (Net Weight)
        await this.loadCalculatorData(item.menu_id, item.ingredients)
        
        // 4. Auto-Apply properties to "Actual Nutrition"
        setTimeout(() => {
             this.applyCalculation() 
             this.toast.info("Data nutrisi diisi otomatis sesuai gramasi rencana.")
        }, 500)
    },

    async saveForm() {
      this.saving = true
      this.errors = {}

      try {
        console.log('💾 Saving form data:', this.form)
        let response
        if (this.isEdit) {
          console.log('📝 Updating distribusi ID:', this.editId)
          response = await distribusiMakananService.update(this.editId, this.form)
          this.toast.success('Data distribusi berhasil diperbarui')
        } else {
          console.log('➕ Creating new distribusi')
          // Add selected plan ID to payload if available
          const payload = {
            ...this.form,
            id_shopping_plan: this.selectedPlanId
          }
          response = await distribusiMakananService.create(payload)
          this.toast.success('Data distribusi berhasil ditambahkan')
        }

        await this.loadData()
        this.resetForm()

      } catch (error) {
        console.error('Error saving distribusi:', error)
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors
          this.toast.error('Periksa kembali inputan Anda')
        } else {
          this.toast.error('Gagal menyimpan data distribusi')
        }
      } finally {
        this.saving = false
      }
    },
    editItem(item) {
      console.log('🔧 Editing item:', item)
      console.log('📅 Raw Date:', item.tanggal_distribusi)
      this.isEdit = true
      this.editId = item.id_distribusi
      this.selectedPlanId = item.id_shopping_plan || null // Set plan ID
      this.form = {

        id_menu: item.id_menu,
        id_jenis_porsi: item.id_jenis_porsi,
        id_pegawai: item.id_pegawai || '',
        tanggal_distribusi: this.formatDateForInput(item.tanggal_distribusi),
        waktu_makan: item.waktu_makan,
        jumlah_porsi: item.jumlah_porsi,
        kalori_aktual: item.gizi_aktual?.kalori_aktual || '',
        protein_aktual: item.gizi_aktual?.protein_aktual || '',
        karbohidrat_aktual: item.gizi_aktual?.karbohidrat_aktual || '',
        lemak_aktual: item.gizi_aktual?.lemak_aktual || '',
        serat_aktual: item.gizi_aktual?.serat_aktual || '',
        status_distribusi: item.status_distribusi,
        catatan: item.catatan || ''
      }
      console.log('📝 Form data after edit:', this.form)
      
      // Load calculator data immediately
      if (item.id_menu) {
        this.loadCalculatorData(item.id_menu)
      }
      
      this.showAddForm = true
      
      // Scroll to form
      this.$nextTick(() => {
        if (this.$refs.formCard) {
          this.$refs.formCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    async confirmDelete(item) {
      if (confirm(`Apakah Anda yakin ingin menghapus distribusi makanan untuk ${item.penerima?.nama_penerima}?`)) {
        this.loading = true
        try {
          await distribusiMakananService.delete(item.id_distribusi)
          this.toast.success('Data distribusi berhasil dihapus')
          await this.loadData()
        } catch (error) {
          console.error('Error deleting distribusi:', error)
          this.toast.error('Gagal menghapus data distribusi')
        } finally {
          this.loading = false
        }
      }
    },
    resetForm() {
      this.isEdit = false
      this.editId = null
      this.showAddForm = false
      this.form = {

        id_menu: '',
        id_jenis_porsi: '',
        id_pegawai: '',
        tanggal_distribusi: this.getCurrentDate(),
        waktu_makan: '',
        jumlah_porsi: 1,
        kalori_aktual: '',
        protein_aktual: '',
        karbohidrat_aktual: '',
        lemak_aktual: '',
        serat_aktual: '',
        status_distribusi: 'direncanakan',
        catatan: ''
      }
      this.errors = {}
    },
    resetFilters() {
      this.filters = {
        search: '',
        waktu_makan: '',
        status: '',
        tanggal_start: '',
        tanggal_end: ''
      }
      this.currentPage = 1
      this.loadData()
    },
    async handlePrint() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        if (isMobile) {
            // For mobile, download as PDF
            try {
                this.toast.info('Sedang membuat PDF...', { timeout: 3000 })
                
                // Clone the print area to avoid CSS conflicts
                const originalElement = document.getElementById('print-area')
                const clonedElement = originalElement.cloneNode(true)
                
                // Remove print-only class and make it visible
                clonedElement.classList.remove('print-only')
                clonedElement.style.display = 'block'
                clonedElement.style.position = 'absolute'
                clonedElement.style.left = '-9999px'
                clonedElement.style.top = '0'
                clonedElement.style.width = '210mm' // A4 width
                clonedElement.style.backgroundColor = '#ffffff'
                clonedElement.id = 'print-area-clone'
                
                // Append to body
                document.body.appendChild(clonedElement)
                
                // Wait for rendering
                await this.$nextTick()
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const opt = {
                    margin: 10,
                    filename: `Jadwal-Distribusi-${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        logging: true,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }
                
                await html2pdf().set(opt).from(clonedElement).save()
                
                // Remove cloned element
                document.body.removeChild(clonedElement)
                
                this.toast.success('PDF berhasil didownload!')
            } catch (error) {
                console.error('PDF generation error:', error)
                this.toast.error('Gagal membuat PDF: ' + error.message)
                
                // Clean up cloned element if exists
                const clone = document.getElementById('print-area-clone')
                if (clone) document.body.removeChild(clone)
            }
        } else {
            // For desktop, try to open in new window for cleaner output
            try {
                const printContent = document.getElementById('print-area').innerHTML
                const printWindow = window.open('', '_blank', 'width=800,height=600')
                
                if (!printWindow) {
                    window.print()
                    return
                }
                
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Jadwal Distribusi Makanan</title>
                        <style>
                            @page {
                                margin: 0;
                                size: auto;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                margin: 1cm;
                                padding: 0;
                            }
                            .print-header {
                                border-bottom: 2px solid black;
                                margin-bottom: 20px;
                                padding-bottom: 10px;
                                text-center: center;
                            }
                            .print-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 1rem;
                            }
                            .print-table th, .print-table td {
                                border: 1px solid #000;
                                padding: 5px;
                                font-size: 11px;
                                vertical-align: top;
                            }
                            .print-table th {
                                background-color: #f0f0f0 !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                text-align: center;
                            }
                            .text-center { text-align: center; }
                            .mb-1 { margin-bottom: 0.25rem; }
                            .mb-2 { margin-bottom: 0.5rem; }
                            .mb-3 { margin-bottom: 1rem; }
                            .mb-4 { margin-bottom: 1.5rem; }
                            .ps-2 { padding-left: 0.5rem; }
                            .fw-bold { font-weight: bold; }
                            .border-bottom { border-bottom: 1px solid; }
                            .border-dark { border-color: #000; }
                            .pb-1 { padding-bottom: 0.25rem; }
                            .d-flex { display: flex; }
                            .justify-content-between { justify-content: space-between; }
                            .align-items-center { align-items: center; }
                            .badge { 
                                display: inline-block;
                                padding: 0.25em 0.6em;
                                font-size: 0.75em;
                                font-weight: 700;
                                line-height: 1;
                                text-align: center;
                                white-space: nowrap;
                                vertical-align: baseline;
                                border-radius: 0.25rem;
                            }
                            .border { border: 1px solid; }
                            .text-dark { color: #000; }
                            .mt-5 { margin-top: 3rem; }
                            .px-5 { padding-left: 3rem; padding-right: 3rem; }
                            .mb-5 { margin-bottom: 3rem; }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `)
                
                printWindow.document.close()
                
                printWindow.onload = function() {
                    printWindow.focus()
                    printWindow.print()
                    printWindow.close()
                }
            } catch (error) {
                console.error('Print window error:', error)
                window.print()
            }
        }
    },
    sortBy(field) {
      if (this.sortByField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortByField = field
        this.sortDirection = 'asc'
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
      }, 500)
    },
    onMenuChange() {
      this.calculateTotalKalori()
      if (this.form.id_menu) {
        this.loadCalculatorData(this.form.id_menu)
      } else {
        this.calculatorData.ingredients = []
      }
    },
    async loadCalculatorData(menuId, customIngredients = null) {
      this.calculatorData.loading = true
      this.calculatorData.ingredients = [] // Reset ingredients first
      try {
        // 1. Always load Standard Recipe first to ensure we have the full list
        const response = await menuService.getById(menuId)
        let standardIngredients = []
        
        if (response.success && response.data.bahan_baku) {
           standardIngredients = response.data.bahan_baku.map(bahan => ({
            ...bahan,
            included: true, 
            jumlah_bahan: Number(bahan.jumlah_bahan) || 0,
            is_standard: true, // Flag to indicate from standard
            komposisi_pangan: bahan.komposisi_pangan ? {
              ...bahan.komposisi_pangan,
              energi_kal: Number(bahan.komposisi_pangan.energi_kal) || 0,
              protein_g: Number(bahan.komposisi_pangan.protein_g) || 0,
              lemak_g: Number(bahan.komposisi_pangan.lemak_g) || 0,
              kh_g: Number(bahan.komposisi_pangan.kh_g) || 0,
              serat_g: Number(bahan.komposisi_pangan.serat_g) || 0
            } : null
          }))
        }

        if (customIngredients && customIngredients.length > 0) {
             // 2. Merge/Override with Plan Data
             // Create a map for quick lookup of standard ingredients
             const ingredientMap = new Map(standardIngredients.map(i => [i.id_bahan_baku, i]))
             
             customIngredients.forEach(planItem => {
                 const existing = ingredientMap.get(planItem.id_bahan_baku)
                 const planWeight = Number(planItem.berat_bersih) || 0
                 
                 if (existing) {
                     // Override weight with Plan's Net Weight
                     existing.jumlah_bahan = planWeight
                     existing.is_plan = true // Flag to show it matches plan
                     
                     // If plan has better nutrition data (unlikely but possible), could update here
                     // But usually Standard Recipe has the master link. 
                     // If Standard is missing link but Plan has it (via my fix), use Plan's
                     if (!existing.komposisi_pangan && planItem.komposisi_pangan) {
                         existing.komposisi_pangan = {
                              ...planItem.komposisi_pangan,
                              energi_kal: Number(planItem.komposisi_pangan.energi_kal) || 0,
                              protein_g: Number(planItem.komposisi_pangan.protein_g) || 0,
                              lemak_g: Number(planItem.komposisi_pangan.lemak_g) || 0,
                              kh_g: Number(planItem.komposisi_pangan.kh_g) || 0,
                              serat_g: Number(planItem.komposisi_pangan.serat_g) || 0
                         }
                     }
                 } else {
                     // Add extra ingredient from Plan that wasn't in Standard Recipe
                     const newItem = {
                        ...planItem,
                        included: true,
                        jumlah_bahan: planWeight,
                        is_plan: true,
                        is_standard: false, // Extra item
                        komposisi_pangan: planItem.komposisi_pangan ? {
                              ...planItem.komposisi_pangan,
                              energi_kal: Number(planItem.komposisi_pangan.energi_kal) || 0,
                              protein_g: Number(planItem.komposisi_pangan.protein_g) || 0,
                              lemak_g: Number(planItem.komposisi_pangan.lemak_g) || 0,
                              kh_g: Number(planItem.komposisi_pangan.kh_g) || 0,
                              serat_g: Number(planItem.komposisi_pangan.serat_g) || 0
                         } : null
                     }
                     standardIngredients.push(newItem)
                 }
             })
        }
        
        this.calculatorData.ingredients = standardIngredients
        
      } catch (error) {
        console.error('Error loading menu details for calculator:', error)
        this.toast.error('Gagal memuat detail bahan baku')
      } finally {
        this.calculatorData.loading = false
      }
    },
    calculateTotalKalori() {
      // Computed property will handle this
    },
    getCurrentDate() {
      return new Date().toISOString().split('T')[0]
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      
      // Parse date string manually to avoid timezone issues
      // If it's YYYY-MM-DD format, parse it directly
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [year, month, day] = dateString.substring(0, 10).split('-')
        return `${day}/${month}/${year}`
      }
      
      // Fallback to Date object for other formats
      const date = new Date(dateString)
      const d = String(date.getDate()).padStart(2, '0')
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const y = date.getFullYear()
      return `${d}/${m}/${y}`
    },
    formatDateForInput(dateString) {
      if (!dateString) return this.getCurrentDate()
      
      const date = new Date(dateString)
      // Use local parts to ensure we get the same date as displayed in the table
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) return 0
      return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num)
    },
    getWaktuMakanLabel(value) {
      const option = this.waktuMakanOptions.find(opt => opt.value === value)
      return option ? option.label : value
    },
    getStatusLabel(value) {
      const option = this.statusOptions.find(opt => opt.value === value)
      return option ? option.label : value
    },
    getStatusBadgeClass(status) {
      const option = this.statusOptions.find(opt => opt.value === status)
      const color = option ? option.color : 'secondary'
      return `badge bg-${color} text-white`
    },
    applyCalculation() {
      const totals = this.calculatedTotals
      // Round to 2 decimal places to avoid floating point errors
      this.form.kalori_aktual = parseFloat(totals.kalori.toFixed(2))
      this.form.protein_aktual = parseFloat(totals.protein.toFixed(2))
      this.form.lemak_aktual = parseFloat(totals.lemak.toFixed(2))
      this.form.karbohidrat_aktual = parseFloat(totals.karbohidrat.toFixed(2))
      this.form.serat_aktual = parseFloat(totals.serat.toFixed(2))
      this.toast.success('Hasil perhitungan diterapkan ke formulir')
    },
    getCalculatedNutrition(bahan, type) {
        if (!bahan.komposisi_pangan) return 0
        
        const weight = Number(bahan.jumlah_bahan) || 0
        const factor = weight / 100
        
        let value = 0
        switch (type) {
            case 'kalori': value = Number(bahan.komposisi_pangan.energi_kal) || 0; break;
            case 'protein': value = Number(bahan.komposisi_pangan.protein_g) || 0; break;
            case 'lemak': value = Number(bahan.komposisi_pangan.lemak_g) || 0; break;
            case 'karbohidrat': value = Number(bahan.komposisi_pangan.kh_g) || 0; break;
            case 'serat': value = Number(bahan.komposisi_pangan.serat_g) || 0; break;
        }
        
        return value * factor
    },
    hasNutritionalData(giziAktual) {
      return giziAktual && (
        (giziAktual.kalori_aktual && giziAktual.kalori_aktual > 0) ||
        (giziAktual.protein_aktual && giziAktual.protein_aktual > 0) ||
        (giziAktual.karbohidrat_aktual && giziAktual.karbohidrat_aktual > 0) ||
        (giziAktual.lemak_aktual && giziAktual.lemak_aktual > 0) ||
        (giziAktual.serat_aktual && giziAktual.serat_aktual > 0)
      )
    },
    getPortionCode(name) {
      if (!name) return '?'
      const lower = name.toLowerCase()
      if (lower.includes('besar')) return 'B'
      if (lower.includes('sedang')) return 'S'
      if (lower.includes('kecil')) return 'K'
      return '?'
    },
    async loadSummaryData() {
      if (!this.summaryDate) {
        this.summaryData = null
        return
      }

      try {
        console.log('📅 Loading summary for date:', this.summaryDate)

        // Try API first, fallback to client-side calculation if API fails
        try {
          const response = await distribusiMakananService.getSummary(this.summaryDate)
          console.log('📊 Summary API Response:', response)

          if (response.success) {
            this.summaryData = response.data
            return
          } else {
            console.log('API returned no success, falling back to client calculation')
          }
        } catch (apiError) {
          console.log('API call failed, falling back to client calculation:', apiError.message)
        }

        // Fallback: Client-side calculation from distribusiList
        console.log('📋 Using client-side calculation with', this.distribusiList.length, 'items')
        console.log('📋 Sample items:', this.distribusiList.slice(0, 2))

        const dateDistributions = this.distribusiList.filter(item => {
          const itemDate = item.tanggal_distribusi ? item.tanggal_distribusi.split('T')[0] : ''
          const match = itemDate === this.summaryDate
          if (match) {
            console.log('✅ Matched:', item.nama_penerima, item.tanggal_distribusi, item.jumlah_porsi)
          }
          return match
        })

        console.log(`📊 Found ${dateDistributions.length} distributions for ${this.summaryDate}`)

        if (dateDistributions.length === 0) {
          this.summaryData = {
            total_porsi: 0,
            sarapan: 0,
            makan_siang: 0,
            makan_malam: 0,
            snack: 0,
            total_penerima: 0
          }
          return
        }

        const summary = dateDistributions.reduce((acc, item) => {
          acc.total_porsi += item.jumlah_porsi || 0

          switch(item.waktu_makan) {
            case 'sarapan':
              acc.sarapan += item.jumlah_porsi || 0
              break
            case 'makan_siang':
              acc.makan_siang += item.jumlah_porsi || 0
              break
            case 'makan_malam':
              acc.makan_malam += item.jumlah_porsi || 0
              break
            case 'snack':
              acc.snack += item.jumlah_porsi || 0
              break
          }

          return acc
        }, {
          total_porsi: 0,
          sarapan: 0,
          makan_siang: 0,
          makan_malam: 0,
          snack: 0,
          total_penerima: 0
        })

        // Count unique penerima
        const uniquePenerima = new Set(dateDistributions.map(item => item.id_penerima))
        summary.total_penerima = uniquePenerima.size

        // Add menu information - all menus with portion counts
        summary.menus = {
          'sarapan': this.getMenuPortionsForTime(dateDistributions, 'sarapan'),
          'makan_siang': this.getMenuPortionsForTime(dateDistributions, 'makan_siang'),
          'makan_malam': this.getMenuPortionsForTime(dateDistributions, 'makan_malam'),
          'snack': this.getMenuPortionsForTime(dateDistributions, 'snack')
        }

        console.log('📊 Calculated summary:', summary)
        this.summaryData = summary

      } catch (error) {
        console.error('Error in loadSummaryData:', error)
        this.summaryData = null
      }
    },
    getTotalPenerima() {
      if (!this.summaryDate || !this.distribusiList.length) {
        return 0
      }

      // Count unique penerima for selected date
      const uniquePenerima = new Set(
        this.distribusiList
          .filter(item => {
            const itemDate = item.tanggal_distribusi ? item.tanggal_distribusi.split('T')[0] : ''
            return itemDate === this.summaryDate
          })
          .map(item => item.id_penerima)
      )

      return uniquePenerima.size
    },

    getMenuPortionsForTime(distributions, waktuMakan) {
      const timeDistributions = distributions.filter(item => item.waktu_makan === waktuMakan)

      if (timeDistributions.length === 0) {
        return []
      }

      // Group by menu and calculate total portions
      const menuStats = timeDistributions.reduce((acc, item) => {
        const menuId = item.id_menu
        const menuName = item.nama_menu || 'Unknown Menu'

        if (!acc[menuId]) {
          acc[menuId] = {
            nama_menu: menuName,
            total_porsi: 0,
            jumlah_distribusi: 0
          }
        }

        acc[menuId].jumlah_distribusi += 1
        acc[menuId].total_porsi += item.jumlah_porsi || 0

        return acc
      }, {})

      // Return array of menus sorted by total portions descending
      return Object.values(menuStats).sort((a, b) => b.total_porsi - a.total_porsi)
    },
    openSelector(index) {
        this.selectedIngredientIndex = index
        this.showSelectorModal = true
    },
    async handleNutritionSelect(item) {
        if (this.selectedIngredientIndex !== null && this.calculatorData.ingredients[this.selectedIngredientIndex]) {
            // Update the ingredient with selected nutrition data
            const ingredient = this.calculatorData.ingredients[this.selectedIngredientIndex]
            
            try {
              // Call API to persist the link
              await bahanBakuService.linkNutrition(ingredient.id_bahan_baku, item.id)
              
              // Log for debugging
              console.log('🔗 Linking nutrition data:', item.nama_bahan, 'to ingredient:', ingredient.nama_bahan_baku)
  
              // Update reactivity properly
              ingredient.komposisi_pangan = {
                  id: item.id,
                  kode: item.kode,
                  nama_bahan: item.nama_bahan,
                  energi_kal: Number(item.energi) || 0,
                  protein_g: Number(item.protein) || 0,
                  lemak_g: Number(item.lemak) || 0,
                  kh_g: Number(item.karbohidrat) || 0,
                  serat_g: Number(item.serat) || 0,
                  bdd: Number(item.bdd) || 100
              }
              
              // Force include if it wasn't
              ingredient.included = true
              
              this.toast.success(`Nutrisi "${item.nama_bahan}" terhubung ke "${ingredient.nama_bahan_baku}" dan tersimpan!`)
            } catch (error) {
              console.error('Failed to link nutrition:', error)
              this.toast.error('Gagal menyimpan link nutrisi: ' + (error.response?.data?.message || error.message))
            }
        }
    }
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.nutrisi-aktual .badge {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: 2px;
  white-space: nowrap;
}

.nutrisi-aktual .badge i {
  font-size: 0.6rem;
}

.table th {
  white-space: nowrap;
  font-weight: 600;
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  background-color: transparent !important;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media print {
  /* Hide non-print content */
  .no-print {
    display: none !important;
  }
  
  /* Show print content */
  .print-only {
    display: block !important;
    visibility: visible !important;
    position: static !important;
  }
  
  /* Hide browser default header and footer */
  @page {
    margin: 0;
    size: auto;
  }
  
  /* Reset background per page */
  body {
    background: white;
    margin: 1cm;
  }
  
  .page-break {
    page-break-after: always;
  }
  
  .print-header {
      border-bottom: 2px solid black;
      margin-bottom: 20px;
      padding-bottom: 10px;
  }
  
  .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
  }
  
  .print-table th, .print-table td {
      border: 1px solid #000;
      padding: 5px;
      font-size: 11px;
      vertical-align: top;
  }
  
  .print-table th {
      background-color: #f0f0f0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      text-align: center;
  }

  /* Hide sidebar and navbar */
  .sidebar, .navbar, .header, header, nav, footer, 
  .app-sidebar, .app-header, .app-footer {
      display: none !important;
  }
}

.print-only {
  display: none;
}
</style>