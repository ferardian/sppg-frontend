<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">
    <!-- Header Page -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Manajemen Kader PIC</h3>
        <p class="text-muted mb-0">Kelola informasi penanggung jawab distribusi di setiap sekolah</p>
      </div>
      <button class="btn btn-primary btn-lg shadow-sm rounded-pill px-4" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i> Tambah Kader
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body position-relative p-3">
            <div class="position-absolute top-0 start-0 h-100 bg-primary" style="width: 4px;"></div>
            <div class="ps-2">
              <h6 class="text-muted small text-uppercase fw-bold mb-1">Total Kader</h6>
              <h4 class="fw-bold mb-0">{{ kaders.length }}</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body position-relative p-3">
            <div class="position-absolute top-0 start-0 h-100 bg-success" style="width: 4px;"></div>
            <div class="ps-2">
              <h6 class="text-muted small text-uppercase fw-bold mb-1">Kader Aktif</h6>
              <h4 class="fw-bold mb-0">{{ kaders.filter(k => k.status === 'aktif').length }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Informasi Kader</th>
                <th class="py-3 text-uppercase small fw-bold text-muted">Sekolah / Lembaga</th>
                <th class="py-3 text-uppercase small fw-bold text-muted">Rekening & NIK</th>
                <th class="py-3 text-uppercase small fw-bold text-muted">Status</th>
                <th class="text-center py-3 text-uppercase small fw-bold text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in kaders" :key="item.id_kader" class="border-bottom">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3">{{ item.nama.charAt(0) }}</div>
                    <div>
                      <div class="fw-bold text-dark">{{ item.nama }}</div>
                      <small class="text-muted">NIK: {{ item.nik || '-' }}</small>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                    <i class="bi bi-building me-1"></i> {{ item.penerima_manfaat?.nama_lembaga }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="text-dark small"><i class="bi bi-credit-card me-1"></i> {{ item.bank }}</div>
                  <div class="fw-bold">{{ item.rekening || '-' }}</div>
                </td>
                <td class="py-3">
                  <div class="form-check form-switch p-0 d-flex align-items-center">
                    <span :class="['badge rounded-pill px-3 py-2', item.status === 'aktif' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary']">
                       {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                </td>
                <td class="text-center py-3">
                  <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                    <button class="btn btn-white btn-sm px-3 border-end" @click="openModal(item)" title="Edit">
                      <i class="bi bi-pencil-square text-primary"></i>
                    </button>
                    <button class="btn btn-white btn-sm px-3" @click="deleteKader(item.id_kader)" title="Hapus">
                      <i class="bi bi-trash3 text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="kaders.length === 0">
                <td colspan="5" class="text-center py-5">
                  <div class="text-muted opacity-25 mb-3">
                    <i class="bi bi-inbox" style="font-size: 5rem;"></i>
                  </div>
                  <p class="text-muted fw-bold">Belum ada data kader yang terdaftar.</p>
                  <p class="text-muted small">Klik tombol "Tambah Kader" untuk memulai</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <Teleport to="body">
    <!-- Modal Form Premium -->
    <div class="modal fade" id="kaderModal" tabindex="-1" aria-hidden="true" data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 p-4 pb-0">
            <h4 class="modal-title fw-bold text-dark">{{ isEdit ? 'Edit Profil Kader' : 'Daftarkan Kader Baru' }}</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveKader">
            <div class="modal-body p-4">
              <div class="mb-4">
                <label class="form-label small fw-bold text-muted text-uppercase mb-2">Penempatan Sekolah</label>
                <div class="input-group shadow-sm rounded-3 overflow-hidden border">
                  <span class="input-group-text bg-white border-0"><i class="bi bi-building text-primary"></i></span>
                  <select class="form-select border-0 bg-white" v-model="form.id_penerima" required>
                    <option value="" disabled>Pilih Sekolah Asal...</option>
                    <option v-for="p in schools" :key="p.id_penerima" :value="p.id_penerima">
                      {{ p.nama_lembaga }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-muted text-uppercase mb-2">Biodata Kader</label>
                <div class="form-floating mb-3 shadow-sm rounded-3 overflow-hidden border">
                  <input type="text" class="form-control border-0" id="namaKader" v-model="form.nama" required placeholder="Nama Lengkap">
                  <label for="namaKader">Nama Lengkap Kader</label>
                </div>
                <div class="form-floating shadow-sm rounded-3 overflow-hidden border">
                  <input type="text" class="form-control border-0" id="nikKader" v-model="form.nik" placeholder="16 Digit NIK">
                  <label for="nikKader">Nomor Induk Kependudukan (NIK)</label>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-muted text-uppercase mb-2">Informasi Pembayaran (Incentive)</label>
                <div class="row g-2">
                  <div class="col-4">
                    <div class="form-floating shadow-sm rounded-3 overflow-hidden border">
                      <input type="text" class="form-control border-0" id="bankName" v-model="form.bank" placeholder="Bank">
                      <label for="bankName">Nama Bank</label>
                    </div>
                  </div>
                  <div class="col-8">
                    <div class="form-floating shadow-sm rounded-3 overflow-hidden border">
                      <input type="text" class="form-control border-0" id="accNumber" v-model="form.rekening" placeholder="No Rekening">
                      <label for="accNumber">Nomor Rekening</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between bg-light p-3 rounded-4">
                <div class="d-flex align-items-center">
                  <i class="bi bi-toggle-on text-primary fs-4 me-2"></i>
                  <div>
                    <div class="fw-bold small">Status Keaktifan</div>
                    <div class="text-muted smaller">Aktifkan untuk menerima insentif</div>
                  </div>
                </div>
                <div class="form-check form-switch ms-auto">
                  <input class="form-check-input" type="checkbox" v-model="formStatus" style="width: 3em; height: 1.5em;">
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 p-4 pt-0">
              <button type="button" class="btn btn-light px-4 rounded-pill fw-bold" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary px-5 rounded-pill fw-bold shadow-sm" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? 'Simpan Perubahan' : 'Daftarkan Sekarang' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const kaders = ref([])
const schools = ref([])
const loading = ref(false)
const isEdit = ref(false)
let modal = null

const form = ref({
  id_kader: null,
  id_penerima: '',
  nama: '',
  nik: '',
  bank: '',
  rekening: '',
  status: 'aktif'
})

// Computed for status checkbox
const formStatus = computed({
  get: () => form.value.status === 'aktif',
  set: (val) => form.value.status = val ? 'aktif' : 'nonaktif'
})

const fetchKaders = async () => {
  try {
    const res = await api.get('/kader')
    kaders.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch kaders:', error)
  }
}

const fetchSchools = async () => {
  try {
    const res = await api.get('/penerima-manfaat')
    schools.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch schools:', error)
  }
}

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = { ...item }
  } else {
    isEdit.value = false
    form.value = {
      id_kader: null,
      id_penerima: '',
      nama: '',
      nik: '',
      bank: '',
      rekening: '',
      status: 'aktif'
    }
  }
  modal.show()
}

const saveKader = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await api.put(`/kader/${form.value.id_kader}`, form.value)
    } else {
      await api.post('/kader', form.value)
    }
    await fetchKaders()
    modal.hide()
  } catch (error) {
    console.error('Failed to save kader:', error)
  } finally {
    loading.value = false
  }
}

const deleteKader = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus data kader ini?')) {
    try {
      await api.delete(`/kader/${id}`)
      await fetchKaders()
    } catch (error) {
      console.error('Failed to delete kader:', error)
    }
  }
}

onMounted(() => {
  modal = new Modal(document.getElementById('kaderModal'))
  fetchKaders()
  fetchSchools()
})
</script>

<style scoped>
.avatar-circle {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.card {
  transition: all 0.3s ease;
}

.table thead th {
  border-top: none;
  background-color: #f8f9fa;
  letter-spacing: 0.5px;
}

.btn-white {
  background: white;
  border: 1px solid #edf2f7;
}

.btn-white:hover {
  background: #f8f9fa;
}

.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label {
  color: #667eea;
}

.form-control:focus {
  box-shadow: none;
}

.smaller {
  font-size: 0.75rem;
}

/* Custom switch colors */
.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
</style>


