import apiClient from './api'
import recipeService from './recipeService'

const calculatorService = {
  // Calculate ingredient requirements for a specific menu based on date
  async calculateMenuIngredientsByDate(idMenu, tanggal) {
    try {
      const response = await apiClient.post('/calculator/menu-ingredients', {
        id_menu: idMenu,
        tanggal: tanggal
      })
      return response.data
    } catch (error) {
      console.error('Error calculating menu ingredients by date:', error)
      throw error
    }
  },

  // Calculate ingredient requirements for a specific menu (legacy method for manual portions)
  async calculateMenuIngredients(idMenu, totalPortions) {
    try {
      const response = await apiClient.post('/calculator/multiple-menus', {
        menus: [{
          id_menu: idMenu,
          total_porsi: totalPortions
        }]
      })
      return response.data
    } catch (error) {
      console.error('Error calculating menu ingredients:', error)
      throw error
    }
  },

  // Calculate requirements for multiple menus
  async calculateMultipleMenus(menus) {
    try {
      const response = await apiClient.post('/calculator/multiple-menus', {
        menus: menus.map(menu => ({
          id_menu: menu.id_menu,
          total_porsi: menu.total_porsi
        }))
      })
      return response.data
    } catch (error) {
      console.error('Error calculating multiple menus:', error)
      throw error
    }
  },

  // Generate shopping list from requirements
  async generateShoppingList(requirements) {
    try {
      const response = await apiClient.post('/calculator/shopping-list', {
        requirements: requirements.map(req => ({
          id_bahan_baku: req.id_bahan_baku,
          total_dibutuhkan: req.total_dibutuhkan
        }))
      })
      return response.data
    } catch (error) {
      console.error('Error generating shopping list:', error)
      throw error
    }
  },

  // Get stock status color
  getStockStatusColor(status) {
    switch (status) {
      case 'cukup':
        return 'success'
      case 'kurang':
        return 'danger'
      case 'critical':
        return 'warning'
      default:
        return 'secondary'
    }
  },

  // Get stock status icon
  getStockStatusIcon(status) {
    switch (status) {
      case 'cukup':
        return 'bi-check-circle-fill'
      case 'kurang':
        return 'bi-exclamation-triangle-fill'
      case 'critical':
        return 'bi-x-circle-fill'
      default:
        return 'bi-question-circle'
    }
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  },

  // Calculate summary statistics
  calculateSummary(requirements) {
    const total = requirements.length
    const cukup = requirements.filter(req => req.stok_status === 'cukup').length
    const kurang = total - cukup
    const percentage = total > 0 ? Math.round((cukup / total) * 100) : 0

    return {
      total_bahan: total,
      stok_cukup: cukup,
      stok_kurang: kurang,
      persentase_cukup: percentage
    }
  },

  // Export to Excel (client-side)
  exportToExcel(data, filename = 'ingredient-calculation') {
    // Create CSV content
    let csvContent = "Nama Bahan,Kategori,Jumlah Per Porsi,Satuan,Total Dibutuhkan,Stok Tersedia,Status,Selisih,Catatan\n"

    data.forEach(item => {
      const row = [
        `"${item.nama_bahan_baku || ''}"`,
        `"${item.kategori || ''}"`,
        item.jumlah_per_porsi || 0,
        `"${item.satuan || ''}"`,
        item.total_dibutuhkan_formatted || item.total_dibutuhkan || 0,
        item.stok_tersedia_formatted || item.stok_tersedia || 0,
        item.stok_status || '',
        item.selisih_formatted || item.selisih || 0,
        `"${item.catatan || ''}"`
      ]
      csvContent += row.join(',') + '\n'
    })

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Export shopping list to Excel
  exportShoppingListToExcel(data, filename = 'shopping-list') {
    let csvContent = "No,Nama Bahan,Kategori,Satuan,Stok Tersedia,Jumlah Beli,Estimasi Harga\n"

    data.forEach((item, index) => {
      const row = [
        index + 1,
        `"${item.nama_bahan_baku || ''}"`,
        `"${item.kategori || ''}"`,
        `"${item.satuan || ''}"`,
        item.stok_tersedia || 0,
        item.jumlah_beli_formatted || item.jumlah_beli || 0,
        `"${this.formatCurrency(item.estimated_cost || 0)}"`
      ]
      csvContent += row.join(',') + '\n'
    })

    // Add total at the bottom
    const totalCost = data.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
    csvContent += `,,,,,TOTAL,"${this.formatCurrency(totalCost)}"\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Group ingredients by category
  groupByCategory(requirements) {
    return requirements.reduce((groups, item) => {
      const category = item.kategori || 'Lainnya'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {})
  },

  // Get priority level based on stock status
  getPriorityLevel(item) {
    if (item.is_primary && item.stok_status === 'kurang') {
      return 'high' // Critical - primary ingredient out of stock
    } else if (item.is_primary) {
      return 'medium' // Important - primary ingredient
    } else if (item.stok_status === 'kurang') {
      return 'medium' // Important - out of stock
    } else {
      return 'low' // Normal
    }
  },

  // Sort requirements by priority
  sortByPriority(requirements) {
    return requirements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = this.getPriorityLevel(a)
      const bPriority = this.getPriorityLevel(b)

      if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
        return priorityOrder[bPriority] - priorityOrder[aPriority]
      }

      // If same priority, sort by primary status
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1

      // Then by name
      return a.nama_bahan_baku.localeCompare(b.nama_bahan_baku)
    })
  }
}

export default calculatorService