<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">
        <i class="bi bi-truck me-2"></i>Distribusi Makanan
      </h3>
      <button
        class="btn btn-primary"
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
          <div class="card-header bg-primary text-white">
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
                  <div class="col-md-2">
                    <div class="card bg-light border-primary">
                      <div class="card-body p-2">
                        <h6 class="text-primary mb-1">Penerima</h6>
                        <h4 class="mb-0 text-primary">{{ formatNumber(summaryData.total_penerima || getTotalPenerima()) }}</h4>
                        <small class="text-muted">lokasi</small>
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
    <div v-if="showAddForm" class="card mb-4">
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
              <select
                v-model="form.waktu_makan"
                class="form-select"
                :class="{ 'is-invalid': errors.waktu_makan }"
                required
              >
                <option value="">Pilih Waktu Makan</option>
                <option v-for="option in waktuMakanOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.waktu_makan">
                {{ errors.waktu_makan }}
              </div>
            </div>

            <!-- Penerima Manfaat -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Penerima Manfaat *</label>
              <select
                v-model="form.id_penerima"
                class="form-select"
                :class="{ 'is-invalid': errors.id_penerima }"
                required
              >
                <option value="">Pilih Penerima</option>
                <option v-for="penerima in penerimaList" :key="penerima.id_penerima" :value="penerima.id_penerima">
                  {{ penerima.nama_penerima }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.id_penerima">
                {{ errors.id_penerima }}
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
                <small class="text-success" v-if="selectedPenerima && selectedPenerima.jumlah_siswa && form.jumlah_porsi === selectedPenerima.jumlah_siswa">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Auto-filled dari {{ selectedPenerima.jumlah_siswa }} siswa
                </small>
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
              <div class="form-text" v-if="selectedPenerima">
                <i class="bi bi-info-circle me-1"></i>
                {{ selectedPenerima.nama_lembaga }} memiliki {{ selectedPenerima.jumlah_siswa }} siswa
              </div>
              <div class="invalid-feedback" v-if="errors.jumlah_porsi">
                {{ errors.jumlah_porsi }}
              </div>
            </div>

            <!-- Pegawai -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Petugas Distribusi</label>
              <select
                v-model="form.id_pegawai"
                class="form-select"
                :class="{ 'is-invalid': errors.id_pegawai }"
              >
                <option value="">Pilih Petugas</option>
                <option v-for="pegawai in pegawaiList" :key="pegawai.id_pegawai" :value="pegawai.id_pegawai">
                  {{ pegawai.nama_lengkap }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.id_pegawai">
                {{ errors.id_pegawai }}
              </div>
            </div>

            <!-- Status Distribusi -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Status Distribusi *</label>
              <select
                v-model="form.status_distribusi"
                class="form-select"
                :class="{ 'is-invalid': errors.status_distribusi }"
                required
              >
                <option value="">Pilih Status</option>
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
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
                  <div class="col-md-6" v-if="selectedPenerima">
                    <strong>Kebutuhan Kalori Harian:</strong>
                    <span> {{ formatNumber(selectedPenerima.kebutuhan_kalori) }} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Distribusi -->
          <div class="mb-3">
            <label class="form-label">Status Distribusi *</label>
            <select
              v-model="form.status_distribusi"
              class="form-select"
              :class="{ 'is-invalid': errors.status_distribusi }"
            >
              <option value="">Pilih Status</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.status_distribusi">
              {{ errors.status_distribusi }}
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
          <div class="col-md-1 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100"
              @click="resetFilters"
            >
              <i class="bi bi-arrow-clockwise"></i>
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
                <th>Penerima</th>
                <th>Menu</th>
                <th>Porsi</th>
                <th>Total Kalori</th>
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
                <td>{{ item.nama_penerima || '-' }}</td>
                <td>{{ item.nama_menu || '-' }}</td>
                <td>{{ item.jumlah_porsi }} {{ item.nama_jenis_porsi || '' }}</td>
                <td>
                  <strong>{{ formatNumber(item.total_kalori) }}</strong> kcal
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
  </div>
</template>

<script>
import distribusiMakananService from '@/services/distribusiMakananService'
import { useToast } from 'vue-toastification'

export default {
  name: 'DistribusiMakananView',
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
      distribusiList: [],
      penerimaList: [],
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
        id_penerima: '',
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
      searchTimeout: null
    }
  },
  computed: {
    selectedMenu() {
      return this.menuList.find(menu => menu.id_menu === this.form.id_menu)
    },
    selectedJenisPorsi() {
      return this.jenisPorsiList.find(jenis => jenis.id_jenis_porsi === this.form.id_jenis_porsi)
    },
    selectedPenerima() {
      return this.penerimaList.find(penerima => penerima.id_penerima === this.form.id_penerima)
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
          item.nama_penerima?.toLowerCase().includes(searchTerm) ||
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
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredData.slice(start, end)
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
    }
  },
  watch: {
    'form.id_penerima': {
      handler(newId) {
        if (newId && !this.isEdit) {
          const selectedPenerima = this.penerimaList.find(p => p.id_penerima === newId)
          if (selectedPenerima && selectedPenerima.jumlah_siswa) {
            // Auto-fill hanya untuk ADD mode, tidak untuk EDIT mode
            this.form.jumlah_porsi = selectedPenerima.jumlah_siswa
            console.log(`📊 Auto-fill jumlah_porsi: ${selectedPenerima.jumlah_siswa} siswa dari ${selectedPenerima.nama_lembaga}`)
          }
        }
      },
      immediate: false // Tidak run immediately, biarkan edit mode yang handle
    },
    distribusiList: {
      handler() {
        // Re-calculate summary when distribusi list changes
        this.loadSummaryData()
      },
      deep: true
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
          this.loadSummaryData()
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
            nama_penerima: item.nama_penerima,
            menu: item.menu,
            penerima: item.penerimaManfaat
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
        console.log('🔍 Distribusi List after assignment:', this.distribusiList)
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
    async loadJenisPorsi() {
      try {
        const response = await distribusiMakananService.getJenisPorsi()
        this.jenisPorsiList = response.data || []
      } catch (error) {
        console.error('Error loading jenis porsi:', error)
        this.toast.error('Gagal memuat data jenis porsi')
      }
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
          response = await distribusiMakananService.create(this.form)
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
      this.isEdit = true
      this.editId = item.id_distribusi
      this.form = {
        id_penerima: item.id_penerima,
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
      this.showAddForm = true
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
        id_penerima: '',
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
    },
    calculateTotalKalori() {
      // Computed property will handle this
    },
    getCurrentDate() {
      return new Date().toISOString().split('T')[0]
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    formatDateForInput(dateString) {
      if (!dateString) return this.getCurrentDate()
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    },
    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) return 0
      return new Intl.NumberFormat('id-ID').format(Math.round(num))
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
    hasNutritionalData(giziAktual) {
      return giziAktual && (
        (giziAktual.kalori_aktual && giziAktual.kalori_aktual > 0) ||
        (giziAktual.protein_aktual && giziAktual.protein_aktual > 0) ||
        (giziAktual.karbohidrat_aktual && giziAktual.karbohidrat_aktual > 0) ||
        (giziAktual.lemak_aktual && giziAktual.lemak_aktual > 0) ||
        (giziAktual.serat_aktual && giziAktual.serat_aktual > 0)
      )
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
</style>