<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Box,
  LayoutDashboard,
  Users,
  History,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-vue-next'
import AppToast from '@/components/common/AppToast.vue'

const router = useRouter()
const route = useRoute()

// Privremeni mock podaci za korisnika i tenanta dok ne uvežemo auth store
const user = ref({
  name: 'Nikola Admin',
  email: 'nikola@acme.com',
  role: 'admin',
})

const currentTenant = ref({
  name: 'Acme Corp',
  plan: 'Enterprise',
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Oprema & Imovina', href: '/assets', icon: Box },
  { name: 'Korisnici', href: '/users', icon: Users, adminOnly: true },
  { name: 'Audit Logovi', href: '/audit-logs', icon: History, adminOnly: true },
]

const handleLogout = () => {
  // Biće povezano sa Pinia auth store-om
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
    <!-- Sidebar -->
    <aside
      class="w-72 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-4 sticky top-0 h-screen z-20"
    >
      <div class="space-y-6">
        <!-- Logo & Tenant Switcher Header -->
        <div
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 shadow-inner"
        >
          <div
            class="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <Building2 class="h-5 w-5 text-white" />
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-sm font-semibold text-white truncate">{{ currentTenant.name }}</span>
            <span class="text-[10px] font-medium uppercase tracking-wider text-indigo-400">{{
              currentTenant.plan
            }}</span>
          </div>
        </div>

        <!-- Navigacija -->
        <nav class="space-y-1.5">
          <template v-for="item in navigation" :key="item.name">
            <router-link
              v-if="!item.adminOnly || user.role === 'admin'"
              :to="item.href"
              :class="[
                route.path.startsWith(item.href)
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent',
                'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              ]"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="item.icon"
                  :class="[
                    route.path.startsWith(item.href)
                      ? 'text-indigo-400'
                      : 'text-slate-500 group-hover:text-slate-300',
                    'h-4 w-4 transition-colors',
                  ]"
                />
                <span>{{ item.name }}</span>
              </div>
              <ChevronRight
                v-if="route.path.startsWith(item.href)"
                class="h-4 w-4 text-indigo-400 opacity-80"
              />
            </router-link>
          </template>
        </nav>
      </div>

      <!-- User Profile & Logout -->
      <div class="pt-4 border-t border-slate-800/80 space-y-3">
        <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/30">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="h-9 w-9 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs"
            >
              {{ user.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-medium text-slate-200 truncate">{{ user.name }}</span>
              <span class="text-[11px] text-slate-500 truncate">{{ user.email }}</span>
            </div>
          </div>
          <ShieldCheck
            v-if="user.role === 'admin'"
            class="h-4 w-4 text-emerald-400 shrink-0"
            title="Administrator"
          />
        </div>

        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut class="h-3.5 w-3.5" />
          <span>Odjavi se</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      <!-- Top Bar / Header -->
      <header
        class="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold text-white">Sistem za Upravljanje Imovinom</h1>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Aktivan
          </span>
        </div>
      </header>

      <!-- Page Container -->
      <div class="p-8 flex-1">
        <slot />
      </div>

      <!-- Globalni Toast -->
      <AppToast />
    </main>
  </div>
</template>
