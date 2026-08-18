<template>
  <div class="cetak-stiker-container">
    <!-- Non-Print Controls -->
    <div class="no-print">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">
            <i class="bi bi-printer-fill text-primary me-2"></i>
            Cetak Stiker Label Makanan (MBG)
          </h4>
          <p class="text-muted mb-0">
            Generator cetak stiker label makanan bergizi siap tempel dalam 1 lembar kertas F4
          </p>
        </div>
        <div>
          <button class="btn btn-success btn-lg shadow-sm" @click="handlePrint">
            <i class="bi bi-printer me-2"></i> Cetak / Print Stiker
          </button>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <!-- Input Form Control -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm rounded-3 h-100">
            <div class="card-header bg-white py-3 border-bottom border-light">
              <h5 class="card-title mb-0 fw-bold text-dark">
                <i class="bi bi-sliders text-primary me-2"></i> Pengaturan Label & Batch
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <!-- Pilih Menu -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Pilih Menu Makanan</label>
                  <select class="form-select" v-model="selectedMenuId" @change="onMenuSelect">
                    <option value="">-- Pilih Menu Makanan (Opsional) --</option>
                    <option v-for="menu in menuList" :key="menu.id_menu" :value="menu.id_menu">
                      {{ menu.nama_menu }} ({{ menu.kategori || 'Umum' }})
                    </option>
                  </select>
                </div>

                <!-- Waktu Packing & Baik Dikonsumsi Sebelum -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Waktu Packing</label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model="form.waktu_packing" placeholder="06:00" />
                    <span class="input-group-text bg-light">WIB</span>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Baik Dikonsumsi Sebelum</label>
                  <div class="input-group">
                    <input type="text" class="form-control" v-model="form.waktu_kadaluarsa" placeholder="10:00" />
                    <span class="input-group-text bg-light">WIB</span>
                  </div>
                </div>

                <!-- Tanggal Produksi & Diproduksi Oleh -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tanggal Produksi</label>
                  <input type="date" class="form-control" v-model="form.tanggal_produksi" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Diproduksi Oleh</label>
                  <input type="text" class="form-control" v-model="form.diproduksi_oleh" placeholder="Nama SPPG / Dapur" />
                </div>

                <!-- Kandungan Gizi (Porsi Besar & Porsi Kecil) -->
                <div class="col-12">
                  <hr class="my-2 text-muted opacity-25" />
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label fw-bold text-primary mb-0">
                      <i class="bi bi-pie-chart-fill me-1"></i> Kandungan Gizi
                    </label>

                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm py-1 px-2 text-nowrap"
                      @click="autoCalcPorsiKecil"
                      title="Hitung Porsi Kecil 70% dari Porsi Besar"
                    >
                      <i class="bi bi-calculator me-1"></i> Auto Porsi Kecil (70%)
                    </button>
                  </div>

                  <div class="table-responsive">
                    <table class="table table-sm table-bordered align-middle mb-0 text-center">
                      <thead class="table-light small fw-bold">
                        <tr>
                          <th style="width: 36%" class="text-start">Kandungan Nutrisi</th>
                          <th style="width: 32%" class="text-primary">Porsi Besar</th>
                          <th style="width: 32%" class="text-success">Porsi Kecil</th>
                        </tr>
                      </thead>
                      <tbody class="small">
                        <tr>
                          <td class="text-start fw-medium">
                            <i class="bi bi-fire text-danger me-1"></i> Energi (kcal)
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_besar.energi" />
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_kecil.energi" />
                          </td>
                        </tr>
                        <tr>
                          <td class="text-start fw-medium">
                            <i class="bi bi-lightning-charge-fill text-primary me-1"></i> Protein (g)
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_besar.protein" />
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_kecil.protein" />
                          </td>
                        </tr>
                        <tr>
                          <td class="text-start fw-medium">
                            <i class="bi bi-droplet-fill text-info me-1"></i> Lemak (g)
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_besar.lemak" />
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_kecil.lemak" />
                          </td>
                        </tr>
                        <tr>
                          <td class="text-start fw-medium">
                            <i class="bi bi-diagram-3-fill text-warning me-1"></i> Karbohidrat (g)
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_besar.karbohidrat" />
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_kecil.karbohidrat" />
                          </td>
                        </tr>
                        <tr>
                          <td class="text-start fw-medium">
                            <i class="bi bi-flower1 text-success me-1"></i> Serat (g)
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_besar.serat" />
                          </td>
                          <td>
                            <input type="number" step="0.1" class="form-control form-control-sm text-center" v-model="form.gizi_kecil.serat" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Pengaturan Layout Cetak -->
                <div class="col-12">
                  <hr class="my-2 text-muted opacity-25" />
                  <label class="form-label fw-bold text-success mb-2">Pengaturan Cetak Kertas F4</label>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Jumlah Stiker Per Lembar</label>
                  <select class="form-select" v-model.number="form.stiker_per_halaman">
                    <option :value="6">6 Stiker (2 kolom x 3 baris)</option>
                    <option :value="8">8 Stiker (2 kolom x 4 baris) - Direkomendasikan</option>
                    <option :value="10">10 Stiker (2 kolom x 5 baris)</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Jumlah Halaman Cetak</label>
                  <input type="number" min="1" max="50" class="form-control" v-model.number="form.jumlah_halaman" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Preview Single Sticker -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm rounded-3 h-100">
            <div class="card-header bg-white py-3 border-bottom border-light d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0 fw-bold text-dark">
                <i class="bi bi-eye text-success me-2"></i> Live Preview Stiker
              </h5>
              <span class="badge bg-primary rounded-pill">Skala Presisi</span>
            </div>
            <div class="card-body d-flex align-items-center justify-content-center bg-light p-4 overflow-auto">
              <!-- Sticker Box Sample -->
              <div class="sticker-card-preview">
                <div class="sticker-inner">
                  <!-- Header -->
                  <div class="sticker-header">
                    <div class="header-icon-left">
                      <!-- Bento box SVG -->
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#004085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="3" fill="#e8f4f8"></rect>
                        <path d="M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"></path>
                        <line x1="12" y1="11" x2="12" y2="17"></line>
                        <line x1="6" y1="14" x2="18" y2="14"></line>
                      </svg>
                    </div>
                    <div class="header-title">LABEL MAKANAN</div>
                    <div class="header-icon-right">
                      <!-- Fork & Spoon SVG -->
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="#004085">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.46 3.91 3.43 4.38L6 22h2l-.43-8.62C9.54 12.91 11 11.12 11 9zm7-7c-1.93 0-3.5 1.57-3.5 3.5V11h2v11h2V2h-.5z"/>
                      </svg>
                      <span class="sparkle">✦</span>
                    </div>
                  </div>

                  <!-- Time Grid: Waktu Packing & Baik Dikonsumsi Sebelum (Symmetrical Colons) -->
                  <div class="time-grid">
                    <!-- Row 1: Waktu Packing -->
                    <div class="time-label">
                      <div class="icon-circle icon-blue">
                        <i class="bi bi-clock-history"></i>
                      </div>
                      <span>WAKTU PACKING</span>
                    </div>
                    <div class="time-colon">:</div>
                    <div class="time-pill">
                      <span class="time-val">{{ form.waktu_packing || '__ : __' }}</span>
                      <span class="time-unit">WIB</span>
                    </div>

                    <!-- Row 2: Baik Dikonsumsi Sebelum -->
                    <div class="time-label">
                      <div class="icon-circle icon-green">
                        <i class="bi bi-shield-check"></i>
                      </div>
                      <span>BAIK DIKONSUMSI SEBELUM</span>
                    </div>
                    <div class="time-colon">:</div>
                    <div class="time-pill pill-green">
                      <span class="time-val">{{ form.waktu_kadaluarsa || '__ : __' }}</span>
                      <span class="time-unit">WIB</span>
                    </div>
                  </div>

                  <!-- Middle Content: Left (Warnings) & Right (Gizi Table) -->
                  <div class="sticker-middle">
                    <!-- Left Boxes -->
                    <div class="left-boxes">
                      <!-- Peringatan -->
                      <div class="notice-box box-warning">
                        <div class="notice-icon">
                          <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                        </div>
                        <div class="notice-content">
                          <div class="notice-title title-warning">PERINGATAN</div>
                          <div class="notice-text">
                            Konsumsi diluar jam tersebut akan menyebabkan penurunan kualitas makanan.
                          </div>
                        </div>
                      </div>

                      <!-- Himbauan -->
                      <div class="notice-box box-danger">
                        <div class="notice-icon">
                          <i class="bi bi-house-x-fill text-danger"></i>
                        </div>
                        <div class="notice-content">
                          <div class="notice-title title-danger">HIMBAUAN</div>
                          <div class="notice-text">
                            Dilarang membawa makanan MBG pulang ke rumah. Nikmati makanan di tempat yang telah disediakan.
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Right Box: Kandungan Gizi -->
                    <div class="gizi-box">
                      <div class="gizi-header">
                        KANDUNGAN GIZI
                      </div>
                      <table class="gizi-table">
                        <thead>
                          <tr class="gizi-thead-row">
                            <th class="gizi-th-name">GIZI</th>
                            <th class="gizi-th-val">P. BESAR</th>
                            <th class="gizi-th-val">P. KECIL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="gizi-name">
                              <span class="gizi-icon"><i class="bi bi-fire text-danger"></i></span> ENERGI
                            </td>
                            <td class="gizi-val">{{ form.gizi_besar.energi ?? '-' }} <span class="unit">kcal</span></td>
                            <td class="gizi-val">{{ form.gizi_kecil.energi ?? '-' }} <span class="unit">kcal</span></td>
                          </tr>
                          <tr>
                            <td class="gizi-name">
                              <span class="gizi-icon"><i class="bi bi-lightning-charge-fill text-primary"></i></span> PROTEIN
                            </td>
                            <td class="gizi-val">{{ form.gizi_besar.protein ?? '-' }} <span class="unit">g</span></td>
                            <td class="gizi-val">{{ form.gizi_kecil.protein ?? '-' }} <span class="unit">g</span></td>
                          </tr>
                          <tr>
                            <td class="gizi-name">
                              <span class="gizi-icon"><i class="bi bi-droplet-fill text-info"></i></span> LEMAK
                            </td>
                            <td class="gizi-val">{{ form.gizi_besar.lemak ?? '-' }} <span class="unit">g</span></td>
                            <td class="gizi-val">{{ form.gizi_kecil.lemak ?? '-' }} <span class="unit">g</span></td>
                          </tr>
                          <tr>
                            <td class="gizi-name">
                              <span class="gizi-icon"><i class="bi bi-diagram-3-fill text-warning"></i></span> KARBO
                            </td>
                            <td class="gizi-val">{{ form.gizi_besar.karbohidrat ?? '-' }} <span class="unit">g</span></td>
                            <td class="gizi-val">{{ form.gizi_kecil.karbohidrat ?? '-' }} <span class="unit">g</span></td>
                          </tr>
                          <tr>
                            <td class="gizi-name">
                              <span class="gizi-icon"><i class="bi bi-flower1 text-success"></i></span> SERAT
                            </td>
                            <td class="gizi-val">{{ form.gizi_besar.serat ?? '-' }} <span class="unit">g</span></td>
                            <td class="gizi-val">{{ form.gizi_kecil.serat ?? '-' }} <span class="unit">g</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="sticker-footer">
                    <div class="footer-left">
                      <i class="bi bi-calendar-event-fill text-primary me-1"></i>
                      <span class="footer-label">TANGGAL PRODUKSI :</span>
                      <span class="footer-val">{{ formattedTanggalProduksi }}</span>
                    </div>
                    <div class="footer-divider"></div>
                    <div class="footer-right">
                      <i class="bi bi-person-fill text-primary me-1"></i>
                      <span class="footer-label">DIPRODUKSI OLEH :</span>
                      <span class="footer-val">{{ form.diproduksi_oleh }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Grid Sheet (Visible only on print or print view) -->
    <div class="printable-area">
      <div v-for="pageIndex in form.jumlah_halaman" :key="pageIndex" class="print-page-f4">
        <div class="sticker-grid" :class="'grid-' + form.stiker_per_halaman">
          <div v-for="stickerIndex in form.stiker_per_halaman" :key="stickerIndex" class="sticker-card-print">
            <div class="sticker-inner">
              <!-- Header -->
              <div class="sticker-header">
                <div class="header-icon-left">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#004085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="3" fill="#e8f4f8"></rect>
                    <path d="M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"></path>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="6" y1="14" x2="18" y2="14"></line>
                  </svg>
                </div>
                <div class="header-title">LABEL MAKANAN</div>
                <div class="header-icon-right">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#004085">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.46 3.91 3.43 4.38L6 22h2l-.43-8.62C9.54 12.91 11 11.12 11 9zm7-7c-1.93 0-3.5 1.57-3.5 3.5V11h2v11h2V2h-.5z"/>
                  </svg>
                  <span class="sparkle">✦</span>
                </div>
              </div>

              <!-- Time Grid: Waktu Packing & Baik Dikonsumsi Sebelum (Symmetrical Colons) -->
              <div class="time-grid">
                <!-- Row 1: Waktu Packing -->
                <div class="time-label">
                  <div class="icon-circle icon-blue">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <span>WAKTU PACKING</span>
                </div>
                <div class="time-colon">:</div>
                <div class="time-pill">
                  <span class="time-val">{{ form.waktu_packing || '__ : __' }}</span>
                  <span class="time-unit">WIB</span>
                </div>

                <!-- Row 2: Baik Dikonsumsi Sebelum -->
                <div class="time-label">
                  <div class="icon-circle icon-green">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <span>BAIK DIKONSUMSI SEBELUM</span>
                </div>
                <div class="time-colon">:</div>
                <div class="time-pill pill-green">
                  <span class="time-val">{{ form.waktu_kadaluarsa || '__ : __' }}</span>
                  <span class="time-unit">WIB</span>
                </div>
              </div>

              <!-- Middle Content -->
              <div class="sticker-middle">
                <!-- Left Boxes -->
                <div class="left-boxes">
                  <div class="notice-box box-warning">
                    <div class="notice-icon">
                      <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                    </div>
                    <div class="notice-content">
                      <div class="notice-title title-warning">PERINGATAN</div>
                      <div class="notice-text">
                        Konsumsi diluar jam tersebut akan menyebabkan penurunan kualitas makanan.
                      </div>
                    </div>
                  </div>

                  <div class="notice-box box-danger">
                    <div class="notice-icon">
                      <i class="bi bi-house-x-fill text-danger"></i>
                    </div>
                    <div class="notice-content">
                      <div class="notice-title title-danger">HIMBAUAN</div>
                      <div class="notice-text">
                        Dilarang membawa makanan MBG pulang ke rumah. Nikmati makanan di tempat yang telah disediakan.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Box: Kandungan Gizi -->
                <div class="gizi-box">
                  <div class="gizi-header">
                    KANDUNGAN GIZI
                  </div>
                  <table class="gizi-table">
                    <thead>
                      <tr class="gizi-thead-row">
                        <th class="gizi-th-name">GIZI</th>
                        <th class="gizi-th-val">P. BESAR</th>
                        <th class="gizi-th-val">P. KECIL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="gizi-name">
                          <span class="gizi-icon"><i class="bi bi-fire text-danger"></i></span> ENERGI
                        </td>
                        <td class="gizi-val">{{ form.gizi_besar.energi ?? '-' }} <span class="unit">kcal</span></td>
                        <td class="gizi-val">{{ form.gizi_kecil.energi ?? '-' }} <span class="unit">kcal</span></td>
                      </tr>
                      <tr>
                        <td class="gizi-name">
                          <span class="gizi-icon"><i class="bi bi-lightning-charge-fill text-primary"></i></span> PROTEIN
                        </td>
                        <td class="gizi-val">{{ form.gizi_besar.protein ?? '-' }} <span class="unit">g</span></td>
                        <td class="gizi-val">{{ form.gizi_kecil.protein ?? '-' }} <span class="unit">g</span></td>
                      </tr>
                      <tr>
                        <td class="gizi-name">
                          <span class="gizi-icon"><i class="bi bi-droplet-fill text-info"></i></span> LEMAK
                        </td>
                        <td class="gizi-val">{{ form.gizi_besar.lemak ?? '-' }} <span class="unit">g</span></td>
                        <td class="gizi-val">{{ form.gizi_kecil.lemak ?? '-' }} <span class="unit">g</span></td>
                      </tr>
                      <tr>
                        <td class="gizi-name">
                          <span class="gizi-icon"><i class="bi bi-diagram-3-fill text-warning"></i></span> KARBO
                        </td>
                        <td class="gizi-val">{{ form.gizi_besar.karbohidrat ?? '-' }} <span class="unit">g</span></td>
                        <td class="gizi-val">{{ form.gizi_kecil.karbohidrat ?? '-' }} <span class="unit">g</span></td>
                      </tr>
                      <tr>
                        <td class="gizi-name">
                          <span class="gizi-icon"><i class="bi bi-flower1 text-success"></i></span> SERAT
                        </td>
                        <td class="gizi-val">{{ form.gizi_besar.serat ?? '-' }} <span class="unit">g</span></td>
                        <td class="gizi-val">{{ form.gizi_kecil.serat ?? '-' }} <span class="unit">g</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Footer -->
              <div class="sticker-footer">
                <div class="footer-left">
                  <i class="bi bi-calendar-event-fill text-primary me-1"></i>
                  <span class="footer-label">TANGGAL PRODUKSI :</span>
                  <span class="footer-val">{{ formattedTanggalProduksi }}</span>
                </div>
                <div class="footer-divider"></div>
                <div class="footer-right">
                  <i class="bi bi-person-fill text-primary me-1"></i>
                  <span class="footer-label">DIPRODUKSI OLEH :</span>
                  <span class="footer-val">{{ form.diproduksi_oleh }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import menuService from '@/services/menuService'
import { useToast } from 'vue-toastification'

export default {
  name: 'CetakStikerView',
  setup() {
    const toast = useToast()
    const menuList = ref([])
    const selectedMenuId = ref('')

    // Default today date format YYYY-MM-DD
    const today = new Date().toISOString().substr(0, 10)

    const form = reactive({
      waktu_packing: '06:00',
      waktu_kadaluarsa: '10:00',
      tanggal_produksi: today,
      diproduksi_oleh: 'SPPG SIMBANGWETAN',
      gizi_besar: {
        energi: 450,
        protein: 15,
        lemak: 12,
        karbohidrat: 65,
        serat: 4.5
      },
      gizi_kecil: {
        energi: 315,
        protein: 10.5,
        lemak: 8.4,
        karbohidrat: 45.5,
        serat: 3.15
      },
      stiker_per_halaman: 8,
      jumlah_halaman: 1
    })

    const fetchMenu = async () => {
      try {
        const response = await menuService.getAll()
        if (response && response.data) {
          menuList.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching menu list:', error)
      }
    }

    const autoCalcPorsiKecil = () => {
      form.gizi_kecil.energi = form.gizi_besar.energi ? parseFloat((form.gizi_besar.energi * 0.7).toFixed(1)) : 0
      form.gizi_kecil.protein = form.gizi_besar.protein ? parseFloat((form.gizi_besar.protein * 0.7).toFixed(1)) : 0
      form.gizi_kecil.lemak = form.gizi_besar.lemak ? parseFloat((form.gizi_besar.lemak * 0.7).toFixed(1)) : 0
      form.gizi_kecil.karbohidrat = form.gizi_besar.karbohidrat ? parseFloat((form.gizi_besar.karbohidrat * 0.7).toFixed(1)) : 0
      form.gizi_kecil.serat = form.gizi_besar.serat ? parseFloat((form.gizi_besar.serat * 0.7).toFixed(1)) : 0
      toast.success('Porsi Kecil berhasil dihitung otomatis (70%)!')
    }

    const onMenuSelect = () => {
      if (!selectedMenuId.value) return
      const found = menuList.value.find(m => m.id_menu === selectedMenuId.value)
      if (found) {
        const energi = found.kalori_per_porsi ? parseFloat(found.kalori_per_porsi) : 0
        const protein = found.protein_gram ? parseFloat(found.protein_gram) : 0
        const lemak = found.lemak_gram ? parseFloat(found.lemak_gram) : 0
        const karbohidrat = found.karbohidrat_gram ? parseFloat(found.karbohidrat_gram) : 0
        const serat = found.serat_gram ? parseFloat(found.serat_gram) : 0

        form.gizi_besar.energi = energi
        form.gizi_besar.protein = protein
        form.gizi_besar.lemak = lemak
        form.gizi_besar.karbohidrat = karbohidrat
        form.gizi_besar.serat = serat

        // Auto set 70% for Porsi Kecil
        form.gizi_kecil.energi = parseFloat((energi * 0.7).toFixed(1))
        form.gizi_kecil.protein = parseFloat((protein * 0.7).toFixed(1))
        form.gizi_kecil.lemak = parseFloat((lemak * 0.7).toFixed(1))
        form.gizi_kecil.karbohidrat = parseFloat((karbohidrat * 0.7).toFixed(1))
        form.gizi_kecil.serat = parseFloat((serat * 0.7).toFixed(1))

        toast.info(`Nilai gizi dimuat dari menu "${found.nama_menu}"`)
      }
    }

    const formattedTanggalProduksi = computed(() => {
      if (!form.tanggal_produksi) return '__ / __ / ____'
      const parts = form.tanggal_produksi.split('-')
      if (parts.length === 3) {
        return `${parts[2]} / ${parts[1]} / ${parts[0]}`
      }
      return form.tanggal_produksi
    })

    const handlePrint = () => {
      window.print()
    }

    onMounted(() => {
      fetchMenu()
    })

    return {
      menuList,
      selectedMenuId,
      form,
      formattedTanggalProduksi,
      onMenuSelect,
      autoCalcPorsiKecil,
      handlePrint
    }
  }
}
</script>

<style scoped>
/* Screen Display Rules */
.printable-area {
  display: none;
}

/* Sticker Card General Structure */
.sticker-card-preview,
.sticker-card-print {
  width: 140mm;
  height: 94mm;
  background-color: #ffffff;
  border: 3px solid #002b5b;
  border-radius: 12px;
  padding: 6px;
  box-sizing: border-box;
  font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
  color: #0d1b2a;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.sticker-inner {
  border: 1.5px solid #004085;
  border-radius: 8px;
  height: 100%;
  padding: 6px 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Header */
.sticker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #004085;
  padding-bottom: 4px;
  margin-bottom: 4px;
}
.header-title {
  font-size: 20pt;
  font-weight: 900;
  letter-spacing: 2px;
  color: #002b5b;
  text-transform: uppercase;
}
.header-icon-right {
  display: flex;
  align-items: center;
  color: #d4a017;
  font-size: 14pt;
}
.sparkle {
  color: #17a2b8;
  margin-left: 2px;
}

/* Time Grid (Simetris Alignment for Colons) */
.time-grid {
  display: grid;
  grid-template-columns: max-content 14px 1fr;
  align-items: center;
  row-gap: 4px;
  column-gap: 4px;
  margin-bottom: 4px;
}
.time-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8.5pt;
  font-weight: 800;
  color: #002b5b;
}
.icon-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 9pt;
  flex-shrink: 0;
}
.icon-blue { background-color: #0d6efd; }
.icon-green { background-color: #198754; }

.time-colon {
  font-weight: 800;
  font-size: 10pt;
  text-align: center;
  color: #002b5b;
}
.time-pill {
  border: 1.5px solid #0d6efd;
  background-color: #f0f7ff;
  border-radius: 20px;
  padding: 2px 14px;
  font-size: 9.5pt;
  font-weight: 800;
  color: #002b5b;
  min-width: 130px;
  text-align: center;
  justify-self: end;
}
.pill-green {
  border-color: #198754;
  background-color: #f0fff4;
}
.time-val {
  letter-spacing: 2px;
}
.time-unit {
  font-size: 8pt;
  margin-left: 6px;
  color: #555;
}

/* Middle Content Grid */
.sticker-middle {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 6px;
  margin-bottom: 4px;
}

.left-boxes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-box {
  border-radius: 6px;
  padding: 4px 6px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.box-warning {
  border: 1.5px solid #ffc107;
  background-color: #fffdf0;
}
.box-danger {
  border: 1.5px solid #dc3545;
  background-color: #fff5f5;
}
.notice-icon {
  font-size: 14pt;
  line-height: 1;
}
.notice-title {
  font-size: 8pt;
  font-weight: 900;
  letter-spacing: 0.5px;
}
.title-warning { color: #d39e00; }
.title-danger { color: #dc3545; }

.notice-text {
  font-size: 6.8pt;
  line-height: 1.15;
  color: #333;
  font-weight: 600;
}

/* Gizi Box Table */
.gizi-box {
  border: 1.5px solid #4a154b;
  border-radius: 6px;
  padding: 3px 6px;
  background-color: #faf5ff;
}
.gizi-header {
  text-align: center;
  font-size: 8.5pt;
  font-weight: 900;
  color: #4a154b;
  line-height: 1.1;
  margin-bottom: 2px;
}

.gizi-table {
  width: 100%;
  border-collapse: collapse;
}
.gizi-thead-row th {
  font-size: 6.5pt;
  font-weight: 900;
  color: #4a154b;
  border-bottom: 1.5px solid #4a154b;
  padding: 1px 2px;
}
.gizi-th-name {
  text-align: left;
}
.gizi-th-val {
  text-align: center;
}

.gizi-table td {
  padding: 1.5px 2px;
  font-size: 7pt;
  border-bottom: 1px dashed #e2d5f0;
}
.gizi-table tr:last-child td {
  border-bottom: none;
}
.gizi-name {
  font-weight: 800;
  color: #2b0938;
}
.gizi-icon {
  font-size: 7.5pt;
  margin-right: 2px;
}
.gizi-val {
  text-align: center;
  font-weight: 800;
  color: #000;
}
.gizi-val .unit {
  font-size: 6pt;
  font-weight: 600;
  color: #555;
}

/* Footer */
.sticker-footer {
  border-top: 1.5px solid #004085;
  padding-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 7.5pt;
  font-weight: 800;
  color: #002b5b;
}
.footer-left, .footer-right {
  display: flex;
  align-items: center;
}
.footer-divider {
  width: 1.5px;
  height: 12px;
  background-color: #004085;
}
.footer-label {
  margin-right: 4px;
}
.footer-val {
  color: #000;
  font-weight: 900;
}

/* =================================================== */
/* PRINT MEDIA RULES */
/* =================================================== */
@media print {
  /* Hide non-print UI */
  .no-print,
  nav,
  aside,
  header,
  footer,
  .navbar,
  .sidebar {
    display: none !important;
  }

  body, html {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .printable-area {
    display: block !important;
    width: 100% !important;
  }

  @page {
    size: 215mm 330mm; /* F4 Paper Size */
    margin: 6mm;
  }

  .print-page-f4 {
    page-break-after: always;
    width: 203mm;
    height: 318mm;
    margin: 0 auto;
    box-sizing: border-box;
  }

  /* Grid Layouts for F4 Paper */
  .sticker-grid {
    display: grid;
    gap: 4mm 6mm;
    justify-content: center;
    align-content: start;
  }

  .grid-6 {
    grid-template-columns: repeat(2, 98mm);
    grid-template-rows: repeat(3, 98mm);
  }
  .grid-6 .sticker-card-print {
    width: 98mm;
    height: 98mm;
  }

  .grid-8 {
    grid-template-columns: repeat(2, 98mm);
    grid-template-rows: repeat(4, 74mm);
  }
  .grid-8 .sticker-card-print {
    width: 98mm;
    height: 74mm;
  }
  .grid-8 .header-title { font-size: 14pt; }
  .grid-8 .time-label { font-size: 6.5pt; }
  .grid-8 .time-pill { min-width: 85px; padding: 1px 4px; font-size: 7pt; }
  .grid-8 .notice-text { font-size: 5.5pt; }
  .grid-8 .gizi-thead-row th { font-size: 5.5pt; padding: 0.5px; }
  .grid-8 .gizi-table td { font-size: 5.8pt; padding: 0.5px 1px; }

  .grid-10 {
    grid-template-columns: repeat(2, 98mm);
    grid-template-rows: repeat(5, 60mm);
    gap: 2.5mm 5mm;
  }
  .grid-10 .sticker-card-print {
    width: 98mm;
    height: 60mm;
    padding: 3px;
  }
  .grid-10 .sticker-inner {
    padding: 3px 5px;
    border-width: 1px;
  }
  .grid-10 .sticker-header {
    padding-bottom: 2px;
    margin-bottom: 2px;
    border-bottom-width: 1px;
  }
  .grid-10 .header-icon-left svg,
  .grid-10 .header-icon-right svg {
    width: 18px;
    height: 18px;
  }
  .grid-10 .header-title {
    font-size: 10.5pt;
    letter-spacing: 1px;
  }
  .grid-10 .time-grid {
    row-gap: 1.5px;
    column-gap: 2px;
    margin-bottom: 2px;
  }
  .grid-10 .icon-circle {
    width: 15px;
    height: 15px;
    font-size: 6.5pt;
  }
  .grid-10 .time-label {
    font-size: 5.2pt;
    gap: 3px;
  }
  .grid-10 .time-colon {
    font-size: 6.5pt;
  }
  .grid-10 .time-pill {
    min-width: 68px;
    padding: 0px 3px;
    font-size: 6pt;
    border-width: 1px;
  }
  .grid-10 .sticker-middle {
    gap: 4px;
    margin-bottom: 2px;
  }
  .grid-10 .left-boxes {
    gap: 2px;
  }
  .grid-10 .notice-box {
    padding: 2px 3px;
    gap: 3px;
    border-width: 1px;
    border-radius: 4px;
  }
  .grid-10 .notice-icon {
    font-size: 9pt;
  }
  .grid-10 .notice-title {
    font-size: 5.5pt;
  }
  .grid-10 .notice-text {
    font-size: 4.4pt;
    line-height: 1.1;
  }
  .grid-10 .gizi-box {
    padding: 2px 3px;
    border-width: 1px;
    border-radius: 4px;
  }
  .grid-10 .gizi-header {
    font-size: 6.5pt;
    margin-bottom: 1px;
  }
  .grid-10 .gizi-thead-row th {
    font-size: 4.5pt;
    padding: 0.5px;
    border-bottom-width: 1px;
  }
  .grid-10 .gizi-table td {
    font-size: 4.8pt;
    padding: 0.5px;
  }
  .grid-10 .gizi-icon {
    font-size: 5pt;
  }
  .grid-10 .gizi-val .unit {
    font-size: 4.2pt;
  }
  .grid-10 .sticker-footer {
    font-size: 5.2pt;
    padding-top: 2px;
    border-top-width: 1px;
  }

  .sticker-card-print {
    box-shadow: none !important;
    border: 2px solid #002b5b !important;
  }
}
</style>
