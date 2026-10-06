<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const clientErrors = ref<{ email?: string; password?: string }>({})

const validateClient = () => {
  clientErrors.value = {}
  let isValid = true

  if (!email.value) {
    clientErrors.value.email = 'Email adresa je obavezna.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    clientErrors.value.email = 'Unesite ispravan format email adrese.'
    isValid = false
  }

  if (!password.value) {
    clientErrors.value.password = 'Lozinka je obavezna.'
    isValid = false
  } else if (password.value.length < 6) {
    clientErrors.value.password = 'Lozinka mora imati najmanje 6 karaktera.'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateClient()) return

  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (success) {
    router.push('/assets')
  }
}
</script>

<template>
  <div
    class="min-h-screen w-full lg:grid lg:grid-cols-2 bg-slate-950 font-sans antialiased text-slate-100 overflow-hidden"
  >
    <!-- Leva kolona: Forma sa novom validacijom -->
    <div class="flex items-center justify-center px-6 py-12 lg:px-16 z-10 bg-slate-950">
      <div class="mx-auto w-full max-w-sm space-y-8">
        <div class="space-y-3">
          <div
            class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/25 border border-indigo-400/20"
          >
            <ShieldCheck class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white">Dobrodošli nazad</h1>
            <p class="text-xs text-slate-400 mt-1">
              Unesite vaše pristupne podatke za ulazak na Asset Tracker platformu.
            </p>
          </div>
        </div>

        <!-- Glavna poruka o grešci (Globalna) -->
        <Transition name="fade">
          <div
            v-if="authStore.errorMessage"
            class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle class="h-4 w-4 shrink-0" />
            <span>{{ authStore.errorMessage }}</span>
          </div>
        </Transition>

        <!-- Forma -->
        <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
          <!-- Email Field -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-300">Email adresa</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                v-model="email"
                type="email"
                placeholder="admin@acme.com"
                :class="[
                  clientErrors.email || authStore.errors.email
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
                  'w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 shadow-inner',
                ]"
              />
            </div>
            <!-- Client Error -->
            <p v-if="clientErrors.email" class="text-[11px] text-rose-400 mt-1">
              {{ clientErrors.email }}
            </p>
            <!-- Server 422 Error -->
            <p v-else-if="authStore.errors.email?.[0]" class="text-[11px] text-rose-400 mt-1">
              {{ authStore.errors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-300">Lozinka</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                :class="[
                  clientErrors.password || authStore.errors.password
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
                  'w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 shadow-inner',
                ]"
              />
            </div>
            <!-- Client Error -->
            <p v-if="clientErrors.password" class="text-[11px] text-rose-400 mt-1">
              {{ clientErrors.password }}
            </p>
            <!-- Server 422 Error -->
            <p v-else-if="authStore.errors.password?.[0]" class="text-[11px] text-rose-400 mt-1">
              {{ authStore.errors.password[0] }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Loader2 v-if="authStore.loading" class="h-4 w-4 animate-spin" />
            <span>{{ authStore.loading ? 'Prijavljivanje...' : 'Prijavi se na sistem' }}</span>
          </button>
        </form>

        <p class="text-[11px] text-center text-slate-500">
          Zaštićeno višenivojskom enkripcijom i audit logovanjem.
        </p>
      </div>
    </div>

    <!-- Desna kolona: Slika sa ultra-smooth kretanjem -->
    <div
      class="relative hidden lg:flex items-center justify-center overflow-hidden bg-slate-950 border-l border-slate-800/80 p-12"
    >
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop"
        alt="Asset Tracker Abstract Background"
        class="absolute inset-0 h-full w-full object-cover animate-smooth-motion"
      />
      <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60"
      ></div>

      <div
        class="relative z-10 max-w-lg text-center space-y-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-700/40 backdrop-blur-md shadow-2xl"
      >
        <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl leading-snug">
          Kompletna kontrola nad hardverom i licencama
        </h2>
        <p class="text-sm text-slate-300 font-normal leading-relaxed">
          Jedinstvena multi-tenant SaaS platforma za praćenje, dodelu i bezbednosni audit resursa
          kompanije.
        </p>
        <div class="pt-2 flex justify-center">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Enterprise Operating System
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes ultraSmoothMotion {
  0% {
    transform: scale(1.05) translate3d(0, 0, 0);
  }
  50% {
    transform: scale(1.12) translate3d(-1%, -1%, 0);
  }
  100% {
    transform: scale(1.05) translate3d(0, 0, 0);
  }
}

.animate-smooth-motion {
  animation: ultraSmoothMotion 28s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
  backface-visibility: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
