import { createRouter, createWebHistory } from 'vue-router'
import AssetTableView from '@/views/assets/AssetTableView.vue'
import AssetDetailView from '@/views/assets/AssetDetailView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/assets',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/assets',
      name: 'assets',
      component: AssetTableView,
    },
    {
      path: '/assets/:id',
      name: 'asset-detail',
      component: AssetDetailView,
      props: true,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Proveravamo sesiju sa backend-a ako aplikacija tek startuje
  if (!authStore.isInitialized) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' })
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'assets' })
  }

  next()
})

export default router
