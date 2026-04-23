<template>
  <div class="login-container">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo/Header -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <div class="logo-circle mx-auto mb-3">
                    <img src="/logo.png" alt="Logo" style="width: 85%; height: 85%; object-fit: contain;">
                  </div>
                </div>
                <h2 class="fw-bold mb-2 brand-text">{{ configStore.sppgName }}</h2>
                <p class="mb-0 subtitle-text">Mitra Badan Gizi Nasional</p>
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
                      autocomplete="new-email"
                      readonly
                      onfocus="this.removeAttribute('readonly')"
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
                      autocomplete="new-password"
                      readonly
                      onfocus="this.removeAttribute('readonly')"
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
import { useConfigStore } from '@/stores/config'
import authService from '@/services/authService'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const configStore = useConfigStore()

    const form = ref({
      email: '',
      password: ''
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
      handleLogin,
      configStore
    }
  }
}
</script>

<style scoped>
.login-container {
  background-color: var(--bg-app);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card {
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background-color: var(--bg-card);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04) !important;
}

.logo-circle {
  width: 100px;
  height: 100px;
  background-color: white;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
}

.brand-text {
  color: var(--text-main);
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
}

.subtitle-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.form-label {
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.input-group-text {
  background-color: transparent;
  border-right: none;
  color: var(--text-muted);
  padding-left: 1rem;
}

.form-control {
  border-left: none;
  padding: 0.75rem 1rem 0.75rem 0.5rem;
  font-size: 0.9375rem;
  background-color: transparent;
  color: var(--text-main);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: none;
}

.form-control:focus + .input-group-text {
  border-color: var(--primary-color);
}

.input-group:focus-within {
  box-shadow: 0 0 0 4px var(--primary-light);
  border-radius: 0.375rem;
}

.input-group:focus-within .input-group-text,
.input-group:focus-within .form-control {
  border-color: var(--primary-color);
}

.btn-primary {
  padding: 0.875rem;
  border-radius: 12px;
  font-size: 1rem;
  letter-spacing: 0.025em;
  margin-top: 1rem;
}

@media (max-width: 576px) {
  .login-container {
    padding: 1rem;
  }
  .card-body {
    padding: 2rem !important;
  }
}
</style>