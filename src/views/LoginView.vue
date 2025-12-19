<template>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; padding: 0; position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5 col-xl-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo/Header -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <div class="logo-circle bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mx-auto" style="width: 80px; height: 80px;">
                    <i class="bi bi-egg-fried" style="font-size: 2.5rem;"></i>
                  </div>
                </div>
                <h2 class="fw-bold mb-2" style="color: #ffffff; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); font-size: 2.5rem; font-weight: 700;">SPPG</h2>
                <p class="mb-0" style="color: #f8f9fa; text-shadow: 1px 1px 4px rgba(0,0,0,0.4); font-size: 1.1rem; font-weight: 500;">Sistem Pemberdayaan Gizi</p>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="form.email"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                  <div class="text-danger small mt-1" v-if="errors.email">
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>
                  <div class="text-danger small mt-1" v-if="errors.password">
                    {{ errors.password }}
                  </div>
                </div>

                <!-- Error Alert -->
                <div class="alert alert-danger" v-if="errorMessage">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </span>
                  <span v-else>
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </span>
                </button>
              </form>

              <!-- Test Account Info -->
              <div class="mt-4 p-3 bg-light rounded">
                <small class="text-muted">
                  <strong>Akun Testing:</strong><br>
                  Email: admin@sppg.test<br>
                  Password: password123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = ref({
      email: 'admin@sppg.test',
      password: 'password123'
    })

    const loading = ref(false)
    const errorMessage = ref('')
    const errors = ref({})

    const handleLogin = async () => {
      loading.value = true
      errorMessage.value = ''
      errors.value = {}

      try {
        const response = await authService.login(form.value)

        if (response.success) {
          // Update auth store
          authStore.setAuth(response.data)

          // Redirect to dashboard or intended page
          const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
          router.push(redirectPath)
        } else {
          errorMessage.value = response.message || 'Login gagal'
          if (response.errors) {
            errors.value = response.errors
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = 'Terjadi kesalahan saat login'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      errorMessage,
      errors,
      handleLogin
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-control {
  border-left: none;
}

.btn-primary {
  padding: 0.75rem;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b4c98 100%);
  border: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.logo-circle {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>