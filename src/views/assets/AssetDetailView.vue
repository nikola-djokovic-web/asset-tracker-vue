<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAssetStore } from '@/stores/assets'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  ArrowLeft,
  UserCheck,
  ArrowDownLeft,
  Pencil,
  Cpu,
  History,
  Calendar,
  Tag,
  DollarSign,
  User as UserIcon,
  Clock,
} from 'lucide-vue-next'
import type { HardwareDetail } from '@/types'
import { useAssetBroadcast } from '@/composables/useAssetBroadcast'

// Modali za akcije
import AssetCheckoutModal from '@/components/assets/AssetCheckoutModal.vue'
import AssetCheckinModal from '@/components/assets/AssetCheckinModal.vue'

const route = useRoute()
const router = useRouter()
const assetStore = useAssetStore()
const { currentAsset } = storeToRefs(assetStore)

const assetId = computed(() => route.params.id as string)

const showCheckoutModal = ref(false)
const showCheckinModal = ref(false)

onMounted(async () => {
  if (assetId.value) {
    await assetStore.fetchAssetById(assetId.value)
  }
})

useAssetBroadcast((event) => {
  if (event.asset_id === assetId.value) {
    void assetStore.fetchAssetById(assetId.value).catch(() => undefined)
  }
})

watch(assetId, (id) => {
  if (id) void assetStore.fetchAssetById(id)
})

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'assigned':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    case 'maintenance':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

const hardwareDetails = computed(() => {
  if (currentAsset.value?.details && 'serial_number' in currentAsset.value.details) {
    return currentAsset.value.details as HardwareDetail
  }
  return null
})

const hardwareSpecs = computed(() => hardwareDetails.value?.specs ?? {})

const handleSuccess = async () => {
  await assetStore.fetchAssetById(assetId.value)
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
    <!-- Back & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Nazad"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            {{ currentAsset?.name || 'Učitavanje...' }}
            <span
              v-if="currentAsset"
              :class="[
                getStatusBadgeClass(currentAsset.status),
                'px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
              ]"
            >
              {{ currentAsset.status }}
            </span>
          </h1>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            TAG: {{ currentAsset?.asset_tag || '—' }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="currentAsset" class="flex items-center gap-2">
        <button
          v-if="currentAsset.status === 'active'"
          @click="showCheckoutModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserCheck class="w-4 h-4" />
          <span>Zaduži</span>
        </button>

        <button
          v-if="currentAsset.status === 'assigned'"
          @click="showCheckinModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>Razduži</span>
        </button>

        <button
          @click="router.push(`/assets/${currentAsset.id}/edit`)"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
        >
          <Pencil class="w-4 h-4" />
          <span>Izmeni</span>
        </button>
      </div>
    </div>

    <!-- Main Grid -->
    <div v-if="currentAsset" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Specs & Overview (2 cols) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Overview Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <Tag class="w-4 h-4 text-indigo-400" />
            <span>Osnovne Informacije</span>
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-500 block mb-1">Kategorija</span>
              <span class="text-slate-200 font-medium">{{
                currentAsset.category?.name || '—'
              }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-500 block mb-1">Datum Nabavke</span>
              <span class="text-slate-200 font-medium flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-400" />
                {{ hardwareSpecs.purchase_date || '—' }}
              </span>
            </div>

            <div>
              <span class="text-xs text-slate-500 block mb-1">Nabavna Cena</span>
              <span class="text-slate-200 font-medium flex items-center gap-1">
                <DollarSign class="w-3.5 h-3.5 text-emerald-400" />
                {{
                  hardwareSpecs.purchase_cost
                    ? `${hardwareSpecs.purchase_cost} €`
                    : '—'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Details Card (Hardware specs) -->
        <div
          v-if="hardwareDetails"
          class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
        >
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <Cpu class="w-4 h-4 text-indigo-400" />
            <span>Hardverske Specifikacije</span>
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div v-if="hardwareSpecs.manufacturer">
              <span class="text-xs text-slate-500 block mb-0.5">Proizvođač</span>
              <span class="text-slate-200 font-medium">{{ hardwareSpecs.manufacturer }}</span>
            </div>

            <div v-if="hardwareSpecs.model">
              <span class="text-xs text-slate-500 block mb-0.5">Model</span>
              <span class="text-slate-200 font-medium">{{ hardwareSpecs.model }}</span>
            </div>

            <div v-if="hardwareDetails.serial_number">
              <span class="text-xs text-slate-500 block mb-0.5">Serijski Broj</span>
              <span
                class="text-slate-200 font-mono text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 inline-block"
              >
                {{ hardwareDetails.serial_number }}
              </span>
            </div>

            <div v-if="hardwareSpecs.cpu">
              <span class="text-xs text-slate-500 block mb-0.5">Procesor (CPU)</span>
              <span class="text-slate-200 font-medium">{{ hardwareSpecs.cpu }}</span>
            </div>

            <div v-if="hardwareSpecs.ram">
              <span class="text-xs text-slate-500 block mb-0.5">Radna Memorija (RAM)</span>
              <span class="text-slate-200 font-medium">{{ hardwareSpecs.ram }}</span>
            </div>

            <div v-if="hardwareSpecs.storage">
              <span class="text-xs text-slate-500 block mb-0.5">Skladište (Storage)</span>
              <span class="text-slate-200 font-medium">{{ hardwareSpecs.storage }}</span>
            </div>
          </div>
        </div>

        <!-- Assignments History Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <History class="w-4 h-4 text-indigo-400" />
            <span>Istorija Zaduživanja</span>
          </h2>

          <p class="text-xs text-slate-400">
            Pregled svih zaposlenih koji su koristili ovu opremu.
          </p>

          <div
            class="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl"
          >
            <Clock class="w-8 h-8 mx-auto mb-2 opacity-50" />
            Prikaz istorije zaduženja biće dostupan sa spajanjem backend endpointa za assignments.
          </div>
        </div>
      </div>

      <!-- Right Column: Current Status & User Info (1 col) -->
      <div class="space-y-6">
        <!-- Assigned User Card -->
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 class="text-base font-semibold text-white flex items-center gap-2">
            <UserIcon class="w-4 h-4 text-indigo-400" />
            <span>Trenutno Zaduženo</span>
          </h2>

          <div
            v-if="currentAsset.status === 'assigned'"
            class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2"
          >
            <div class="font-medium text-white text-sm">Korisnik je zadužen</div>
            <p class="text-xs text-slate-400">Oprema je trenutno u upotrebi.</p>
          </div>

          <div v-else class="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
            <span class="text-xs text-slate-400"
              >Oprema nije zadužena (Slobodna je za izdavanje).</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AssetCheckoutModal
      v-if="showCheckoutModal && currentAsset"
      :asset="currentAsset"
      @close="showCheckoutModal = false"
      @success="handleSuccess"
    />

    <AssetCheckinModal
      v-if="showCheckinModal && currentAsset"
      :asset="currentAsset"
      @close="showCheckinModal = false"
      @success="handleSuccess"
    />
    </div>
  </AppLayout>
</template>
