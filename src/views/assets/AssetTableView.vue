<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAssetStore } from '@/stores/assets'
import AppLayout from '@/components/layout/AppLayout.vue'
import AssetModal from '@/components/assets/AssetModal.vue'
import {
  Search,
  Plus,
  Filter,
  Laptop,
  Key,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import type { Asset } from '@/types/index'
import { useToastStore } from '@/stores/toast'
import { UserCheck, ArrowDownLeft } from 'lucide-vue-next'
import AssetCheckoutModal from '@/components/assets/AssetCheckoutModal.vue'
import AssetCheckinModal from '@/components/assets/AssetCheckinModal.vue'

const assetStore = useAssetStore()
const router = useRouter()
const { assets, loading } = storeToRefs(assetStore)
const isFormModalOpen = ref(false)
const selectedAssetForEdit = ref<Asset | null>(null)
const isDeleteModalOpen = ref(false)
const assetToDelete = ref<Asset | null>(null)
const isDeleting = ref(false)
const toast = useToastStore()

// Stanje za modale i trenutno izabranu opremu
const selectedAsset = ref<Asset | null>(null)
const showCheckoutModal = ref(false)
const showCheckinModal = ref(false)

// Otvaranje za CREATE
const openCreateModal = () => {
  selectedAssetForEdit.value = null
  isFormModalOpen.value = true
}

// Otvaranje za EDIT
const openEditModal = (asset: Asset) => {
  selectedAssetForEdit.value = asset
  isFormModalOpen.value = true
}

const openCheckout = (asset: Asset) => {
  selectedAsset.value = asset
  showCheckoutModal.value = true
}

const openCheckin = (asset: Asset) => {
  selectedAsset.value = asset
  showCheckinModal.value = true
}

// Ponovno dohvatanje podataka nakon uspešnog čuvanja
const handleSuccess = () => {
  assetStore.fetchAssets(assetStore.pagination.currentPage)
}

const confirmDelete = async () => {
  if (!assetToDelete.value) return

  try {
    isDeleting.value = true

    // 1. Prvo brišemo na backendu
    await assetStore.deleteAsset(assetToDelete.value.id)

    // 2. Odmah zatvaramo modal
    isDeleteModalOpen.value = false
    assetToDelete.value = null

    toast.success('Resurs je uspešno obrisan iz sistema.')

    // 3. Provera da li je to bio poslednji element na trenutnoj stranici
    const currentPage = assetStore.pagination.currentPage
    const isLastItemOnPage = assetStore.assets.length === 1 && currentPage > 1

    // 4. Osvežavamo listu na odgovarajućoj stranici
    const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage
    await assetStore.fetchAssets(targetPage)
  } catch (error) {
    console.error('Došlo je do greške prilikom brisanja:', error)
    toast.error('Došlo je do greške prilikom brisanja resursa.')
  } finally {
    isDeleting.value = false
  }
}

// Otvaranje DELETE modala
const openDeleteModal = (asset: Asset) => {
  assetToDelete.value = asset
  isDeleteModalOpen.value = true
}

// Zatvaranje DELETE modala
const closeDeleteModal = () => {
  if (isDeleting.value) return
  isDeleteModalOpen.value = false
  assetToDelete.value = null
}

defineProps<{
  assets: Asset[]
}>()

const emit = defineEmits<{
  (e: 'view', asset: Asset): void
  (e: 'edit', asset: Asset): void
  (e: 'delete', asset: Asset): void
}>()

onMounted(() => {
  assetStore.fetchAssets()
})

// Debounce pretrage
let searchTimeout: ReturnType<typeof setTimeout>
watch(
  () => assetStore.searchQuery,
  () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      assetStore.fetchAssets(1)
    }, 350)
  },
)

watch(
  () => assetStore.selectedStatus,
  () => {
    assetStore.fetchAssets(1)
  },
)

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'assigned':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    case 'maintenance':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'retired':
    case 'inactive':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-white">Pregled Opreme</h2>
          <p class="text-sm text-slate-400 mt-1">
            Upravljanje hardverom, licencama i resursima kompanije.
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40"
        >
          <Plus class="h-4 w-4" />
          Dodaj Novu Opremu
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl"
      >
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <div class="relative w-full">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              v-model="assetStore.searchQuery"
              type="text"
              placeholder="Pretraži po nazivu ili asset tagu..."
              class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <Filter class="h-4 w-4 text-slate-500" />
            <select
              v-model="assetStore.selectedStatus"
              class="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Svi Statusi</option>
              <option value="active">Aktivan (Active)</option>
              <option value="assigned">Dodeljen (Assigned)</option>
              <option value="maintenance">Servis (Maintenance)</option>
              <option value="retired">Otpisan (Retired)</option>
            </select>
          </div>

          <button
            @click="assetStore.fetchAssets(assetStore.pagination.currentPage)"
            class="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
            title="Osveži podatke"
          >
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': assetStore.loading }" />
          </button>
        </div>
      </div>

      <!-- Assets Table Card -->
      <div
        class="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-xl"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="border-b border-slate-800 bg-slate-900/80 text-xs uppercase font-semibold text-slate-400"
              >
                <th class="py-4 px-6">Aset & Tag</th>
                <th class="py-4 px-6">Kategorija</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6">Tip / Detalji</th>
                <th class="py-4 px-6 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-sm text-slate-300">
              <!-- Loading State -->
              <tr v-if="assetStore.loading && assetStore.assets.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-500">
                  <RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                  Učitavanje opreme...
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="assetStore.assets.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-500">
                  Nije pronađen nijedan aset na osnovu zadatih kriterijuma.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="asset in assetStore.assets"
                :key="asset.id"
                class="hover:bg-slate-800/30 transition-colors group"
              >
                <!-- Name & Asset Tag -->
                <td class="py-4 px-6 font-medium text-white">
                  <div class="flex flex-col">
                    <span class="text-slate-100 group-hover:text-indigo-400 transition-colors">{{
                      asset.name
                    }}</span>
                    <span class="text-xs text-slate-500 font-mono mt-0.5">{{
                      asset.asset_tag
                    }}</span>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-6 text-slate-400">
                  {{ asset.category?.name || 'Nekategorisano' }}
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-6">
                  <span
                    :class="[
                      getStatusBadgeClass(asset.status),
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                    ]"
                  >
                    {{ asset.status }}
                  </span>
                </td>

                <!-- Polymorphic Type Indicator -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2 text-slate-400 text-xs">
                    <component
                      :is="asset.details && 'serial_number' in asset.details ? Laptop : Key"
                      class="h-4 w-4 text-slate-500"
                    />
                    <span
                      v-if="asset.details && 'serial_number' in asset.details"
                      class="font-mono"
                    >
                      {{ asset.details.serial_number || 'Bez serijskog broja' }}
                    </span>
                    <span
                      v-else-if="asset.details && 'license_key' in asset.details"
                      class="font-mono"
                    >
                      {{ asset.details.license_key ? '••••-••••-KEY' : 'Bez ključa' }}
                    </span>
                    <span v-else class="italic text-slate-600">Osnovni podaci</span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="router.push({ name: 'asset-detail', params: { id: asset.id } })"
                      title="Pogledaj detalje"
                      class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye class="w-4 h-4" />
                    </button>

                    <button
                      @click="openEditModal(asset)"
                      title="Izmeni resurs"
                      class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>

                    <!-- Dugme za Zaduživanje -->
                    <button
                      v-if="asset.status === 'active'"
                      @click="openCheckout(asset)"
                      title="Zaduži opremu"
                      class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <UserCheck class="w-4 h-4" />
                    </button>

                    <!-- Checkin (Razduži) -->
                    <button
                      v-if="asset.status === 'assigned'"
                      @click="openCheckin(asset)"
                      title="Razduži opremu"
                      class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ArrowDownLeft class="w-4 h-4" />
                    </button>

                    <button
                      @click="openDeleteModal(asset)"
                      title="Obriši resurs"
                      class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div
          class="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400"
        >
          <span>Prikazano ukupno: {{ assetStore.pagination.total }} stavki</span>
          <div class="flex items-center gap-2">
            <button
              :disabled="assetStore.pagination.currentPage <= 1"
              @click="assetStore.fetchAssets(assetStore.pagination.currentPage - 1)"
              class="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>
            <span class="px-2 font-medium text-slate-300">
              Stranica {{ assetStore.pagination.currentPage }} od
              {{ assetStore.pagination.lastPage }}
            </span>
            <button
              :disabled="assetStore.pagination.currentPage >= assetStore.pagination.lastPage"
              @click="assetStore.fetchAssets(assetStore.pagination.currentPage + 1)"
              class="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal za kreiranje/izmenu opreme -->
    <AssetModal
      v-if="isFormModalOpen"
      :asset-to-edit="selectedAssetForEdit"
      @close="isFormModalOpen = false"
      @success="handleSuccess"
    />

    <!-- Modal za potvrdu brisanja opreme -->
    <Teleport to="body">
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
          @click.stop
        >
          <!-- Close button -->
          <button
            @click="closeDeleteModal"
            :disabled="isDeleting"
            class="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Icon & Header -->
          <div class="flex items-start gap-4">
            <div
              class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0"
            >
              <AlertTriangle class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Potvrda brisanja</h3>
              <p class="text-sm text-slate-400 mt-1 leading-relaxed">
                Da li ste sigurni da želite da obrišete resurs
                <span
                  class="font-medium text-slate-200 font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700"
                >
                  {{ assetToDelete?.name }}
                </span>
                ({{ assetToDelete?.asset_tag }})?
              </p>
              <p class="text-xs text-rose-400/80 mt-2">Ova akcija se ne može opozvati.</p>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Odustani
            </button>
            <button
              type="button"
              @click="confirmDelete"
              :disabled="isDeleting"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/35 disabled:opacity-50"
            >
              <RefreshCw v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <Trash2 v-else class="w-4 h-4" />
              {{ isDeleting ? 'Brisanje...' : 'Obriši Resurs' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <AssetCheckoutModal
      v-if="showCheckoutModal && selectedAsset"
      :asset="selectedAsset"
      @close="showCheckoutModal = false"
      @success="handleSuccess"
    />

    <AssetCheckinModal
      v-if="showCheckinModal && selectedAsset"
      :asset="selectedAsset"
      @close="showCheckinModal = false"
      @success="handleSuccess"
    />
  </AppLayout>
</template>
