import api from './api'

const menuPermissionService = {
  getAll() {
    return api.get('/menu-permissions')
  },

  updateBulk(data) {
    return api.post('/menu-permissions/bulk-update', data)
  },

  getMyPermissions() {
    return api.get('/menu-permissions/my')
  }
}

export default menuPermissionService
