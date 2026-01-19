# Menu Structure Documentation

## Centralized Menu System

Menu items untuk aplikasi SPPG sekarang menggunakan **single source of truth** yang terdefinisi di `LayoutView.vue`.

### Lokasi

File: `/src/views/LayoutView.vue`  
Variable: `menuItems` (array)

### Struktur Data

```javascript
const menuItems = [
  {
    section: 'main',  // atau nama section seperti 'Data Master', 'Transaksi', dll
    items: [
      {
        to: '/path/to/route',      // Route path
        icon: 'bi-icon-name',      // Bootstrap icon class
        label: 'Menu Label',       // Display text
        badge: 'NEW'               // Optional badge
      }
    ]
  }
]
```

### Cara Menambah Menu Baru

1. **Buka** `LayoutView.vue`
2. **Cari** variable `menuItems` (sekitar line 407)
3. **Tambahkan** item baru di section yang sesuai:

```javascript
{
  section: 'Data Master',
  items: [
    // ... menu lain ...
    { to: '/master-data/new-menu', icon: 'bi-star', label: 'Menu Baru' }
  ]
}
```

4. **Save** - Menu otomatis muncul di desktop & mobile! ✅

### Cara Mengubah Urutan Menu

Cukup **drag & drop** (cut & paste) item di dalam array `menuItems`.  
Urutan di array = urutan di UI.

### Cara Menghapus Menu

Hapus object item dari array `menuItems`.

### Keuntungan Sistem Ini

✅ **Single Source of Truth** - Update 1x, sinkron di desktop & mobile  
✅ **Konsisten** - Tidak ada lagi menu yang berbeda antara desktop & mobile  
✅ **Mudah Maintain** - Semua menu di 1 tempat  
✅ **Type Safe** - Struktur data yang jelas

### Catatan

- Section `'main'` tidak menampilkan header (untuk Dashboard)
- Section lain akan menampilkan header dengan nama section
- Badge bersifat optional
- Icon menggunakan Bootstrap Icons (prefix `bi-`)

### Contoh Lengkap

```javascript
const menuItems = [
  {
    section: 'main',
    items: [
      { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' }
    ]
  },
  {
    section: 'Data Master',
    items: [
      { to: '/master-data/sppg', icon: 'bi-building', label: 'SPPG' },
      { to: '/master-data/pegawai', icon: 'bi-people', label: 'Pegawai', badge: 'NEW' }
    ]
  }
]
```

---

**Last Updated:** 2026-01-03  
**Maintained By:** Development Team
