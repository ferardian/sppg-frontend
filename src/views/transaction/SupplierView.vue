<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">Data Supplier</h3>
      <button class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>
        Tambah Supplier
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="alert alert-info">
          <i class="bi bi-truck me-2"></i>
          <strong>Supplier Component Loaded!</strong>
          <br><small>Route: {{ $route.path }}</small>
        </div>

        <p class="text-muted">Halaman pengelolaan data supplier</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SupplierView',
  mounted() {
    console.log('🟣 SupplierView component mounted successfully!')
  }
}
</script>