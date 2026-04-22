<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 text-dark fw-bold">
          <i class="bi bi-shield-lock text-primary me-2"></i>
          Manajemen Hak Akses Menu
        </h4>
        <p class="text-muted mb-0 small">Atur menu apa saja yang bisa diakses oleh setiap Role</p>
      </div>
      <div class="d-flex gap-2">
         <button class="btn btn-outline-secondary rounded-pill px-3" @click="fetchData">
            <i class="bi bi-arrow-counterclockwise"></i> Refresh
         </button>
         <button class="btn btn-primary rounded-pill px-4 shadow" @click="saveChanges" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-2"></i> Simpan Perubahan
         </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4" style="width: 300px;">Menu / Fitur</th>
                <th v-for="(roleName, roleKey) in roles" :key="roleKey" class="text-center text-uppercase small fw-bold">
                  {{ roleName }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in menuList" :key="menu.key">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center">
                    <div class="p-2 bg-light rounded-3 me-3">
                      <i :class="['bi', menu.icon, 'text-primary']"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ menu.label }}</div>
                      <small class="text-muted small">{{ menu.key }}</small>
                    </div>
                  </div>
                </td>
                <td v-for="(roleName, roleKey) in roles" :key="roleKey" class="text-center">
                   <div class="form-check form-switch d-flex justify-content-center">
                      <input 
                        class="form-check-input custom-switch" 
                        type="checkbox" 
                        :checked="hasAccess(roleKey, menu.key)"
                        @change="toggleAccess(roleKey, menu.key)"
                      >
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10">
       <div class="d-flex align-items-center text-primary">
          <i class="bi bi-info-circle-fill me-3 fs-4"></i>
          <p class="mb-0 small fw-bold">
             Perubahan hak akses akan langsung berdampak pada tampilan menu user di sesi login berikutnya atau setelah refresh halaman.
          </p>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import menuPermissionService from '@/services/menuPermissionService'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const roles = ref({})
const permissions = ref([])

// Define available menus based on sidebar structure
const menuList = [
    { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
    { key: 'sppg', label: 'SPPG', icon: 'bi-building' },
    { key: 'pegawai', label: 'Pegawai', icon: 'bi-person-badge' },
    { key: 'jabatan', label: 'Jabatan', icon: 'bi-briefcase' },
    { key: 'bahan-baku', label: 'Bahan Baku', icon: 'bi-box' },
    { key: 'menu', label: 'Menu', icon: 'bi-menu-app' },
    { key: 'supplier', label: 'Supplier', icon: 'bi-shop' },
    { key: 'user-management', label: 'Manajemen User', icon: 'bi-person-gear' },
    { key: 'penerima-manfaat', label: 'Penerima Manfaat', icon: 'bi-people' },
    { key: 'penerimaan-barang', label: 'Penerimaan Barang', icon: 'bi-truck' },
    { key: 'laporan-sampah', label: 'Laporan Sampah', icon: 'bi-trash3' },
    { key: 'stok-opname', label: 'Stok Opname', icon: 'bi-clipboard-check' },
    { key: 'shopping-list', label: 'Rencana Menu', icon: 'bi-cart-check' },
    { key: 'rab', label: 'Rencana Anggaran', icon: 'bi-wallet2' },
    { key: 'buku-kas', label: 'Buku Kas', icon: 'bi-cash-coin' },
    { key: 'laporan-gaji', label: 'Laporan Gaji', icon: 'bi-file-earmark-spreadsheet' },
    { key: 'distribusi-makanan', label: 'Distribusi Makanan', icon: 'bi-box-seam' },
    { key: 'komposisi-pangan', label: 'Komposisi Pangan', icon: 'bi-egg-fried' },
    { key: 'recipe-management', label: 'Resep & Kalkulator', icon: 'bi-journal-text' },
    { key: 'menu-permissions', label: 'Pengaturan Hak Akses', icon: 'bi-shield-lock' },
]

const fetchData = async () => {
  try {
    loading.value = true
    const res = await menuPermissionService.getAll()
    permissions.value = res.data.data.permissions || []
    roles.value = res.data.data.roles || {}
  } catch (e) {
    toast.error('Gagal memuat data hak akses')
  } finally {
    loading.value = false
  }
}

const hasAccess = (role, menuKey) => {
    const perm = permissions.value.find(p => p.role === role && p.menu_key === menuKey)
    return perm ? perm.has_access : false
}

const toggleAccess = (role, menuKey) => {
    const index = permissions.value.findIndex(p => p.role === role && p.menu_key === menuKey)
    if (index !== -1) {
        permissions.value[index].has_access = !permissions.value[index].has_access
    } else {
        permissions.value.push({ role, menu_key: menuKey, has_access: true })
    }
}

const saveChanges = async () => {
    try {
        saving.value = true
        const rolesToUpdate = Object.keys(roles.value)
        
        for (const role of rolesToUpdate) {
            // Prepare a complete set of permissions for this role
            const rolePerms = menuList.map(menu => {
                const existing = permissions.value.find(p => p.role === role && p.menu_key === menu.key)
                return {
                    menu_key: menu.key,
                    has_access: existing ? existing.has_access : false
                }
            })
            
            await menuPermissionService.updateBulk({
                role: role,
                permissions: rolePerms
            })
        }

        toast.success('Semua perubahan hak akses berhasil disimpan')
        await fetchData()
    } catch (e) {
        console.error('Save error:', e)
        toast.error('Gagal menyimpan perubahan')
    } finally {
        saving.value = false
    }
}

onMounted(fetchData)
</script>

<style scoped>
.custom-switch {
    width: 3em;
    height: 1.5em;
    cursor: pointer;
}
.custom-switch:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}
.table thead th {
    padding: 1rem;
    vertical-align: middle;
}
</style>
