<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAssetStore } from '@/stores/assets'
import { api } from '@/api/axios'
import { X, Laptop, Key, Plus, Pencil, AlertCircle } from 'lucide-vue-next'
import type { Asset, AssetStatus, Category } from '@/types'

const props = defineProps<{
  assetToEdit?: Asset | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const assetStore = useAssetStore()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const categories = ref<Category[]>([])

const isEditMode = computed(() => !!props.assetToEdit)

const assetType = ref<'hardware' | 'license'>('hardware')

const form = reactive({
  name: '',
  asset_tag: '',
  category_id: '',
  status: 'active' as AssetStatus,
  serial_number: '',
  license_key: '',
  seats: 1,
})

// Popunjavanje ili resetovanje forme u zavisnosti od toga da li je prosleđen assetToEdit
const resetOrFillForm = () => {
  if (props.assetToEdit) {
    const asset = props.assetToEdit

    form.name = asset.name || ''
    form.asset_tag = asset.asset_tag || ''
    form.category_id = asset.category_id || asset.category?.id || ''
    form.status = asset.status || 'active'

    // Prepoznavanje polymorph tipa i detalja
    if (asset.details && 'serial_number' in asset.details) {
      assetType.value = 'hardware'
      form.serial_number = asset.details.serial_number || ''
      form.license_key = ''
      form.seats = 1
    } else if (asset.details && 'license_key' in asset.details) {
      assetType.value = 'license'
      form.license_key = asset.details.license_key || ''
      form.seats = asset.details.seats || 1
      form.serial_number = ''
    } else {
      assetType.value = 'hardware'
    }
  } else {
    // Reset na podrazumevane vrednosti pri kreiranju
    form.name = ''
    form.asset_tag = ''
    form.status = 'active'
    form.serial_number = ''
    form.license_key = ''
    form.seats = 1
    assetType.value = 'hardware'

    if (categories.value.length > 0 && categories.value[0]) {
      form.category_id = categories.value[0].id
    }
  }
}

watch(() => props.assetToEdit, resetOrFillForm, { immediate: true })

onMounted(async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data || res.data

    // Ako nemamo izabranu kategoriju pri kreiranju, postavi prvu dostupnu
    if (!form.category_id && categories.value.length > 0 && categories.value[0]) {
      form.category_id = categories.value[0].id
    }
  } catch (err) {
    console.error('Greška pri dohvatanju kategorija:', err)
  }
})

async function handleSubmit() {
  if (!form.name || !form.asset_tag || !form.category_id) {
    errorMessage.value = 'Molimo vas popunite sva obavezna polja (Naziv, Asset Tag, Kategorija).'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const payload: Record<string, any> = {
      name: form.name,
      asset_tag: form.asset_tag,
      category_id: form.category_id,
      status: form.status,
      type: assetType.value,
      details:
        assetType.value === 'hardware'
          ? { serial_number: form.serial_number || null }
          : { license_key: form.license_key || null, seats: form.seats || 1 },
    }

    if (isEditMode.value && props.assetToEdit?.id) {
      // API poziv za izmenu (Update)
      await assetStore.updateAsset(props.assetToEdit.id, payload)
    } else {
      // API poziv za kreiranje
      await assetStore.createAsset(payload)
    }

    emit('success')
    emit('close')
  } catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const messages = Object.values(err.response.data.errors).flat()
      errorMessage.value = messages.join(' ')
    } else {
      errorMessage.value = err.response?.data?.message || 'Došlo je do greške pri čuvanju opreme.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-200"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Pencil v-if="isEditMode" class="h-5 w-5" />
            <Plus v-else class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">
              {{ isEditMode ? 'Izmeni Opremu' : 'Dodaj Novu Opremu' }}
            </h3>
            <p class="text-xs text-slate-400">
              {{
                isEditMode
                  ? 'Ažurirajte detalje postojećeg resursa'
                  : 'Unesite detalje novog resursa u sistem'
              }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
        >
          <AlertCircle class="h-4 w-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Name Input -->
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">
            Naziv Opreme <span class="text-indigo-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="npr. MacBook Pro 16 M3 Max"
            class="w-full px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <!-- Category Dropdown -->
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">
            Kategorija <span class="text-indigo-400">*</span>
          </label>
          <select
            v-model="form.category_id"
            required
            class="w-full px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="" disabled>Izaberite kategoriju...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Asset Tag & Status Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">
              Asset Tag <span class="text-indigo-400">*</span>
            </label>
            <input
              v-model="form.asset_tag"
              type="text"
              required
              placeholder="AST-00123"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
            <select
              v-model="form.status"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="active">Aktivan (Active)</option>
              <option value="assigned">Dodeljen (Assigned)</option>
              <option value="maintenance">Servis (Maintenance)</option>
              <option value="retired">Otpisan (Retired)</option>
              <option value="inactive">Neaktivan (Inactive)</option>
            </select>
          </div>
        </div>

        <!-- Tip Resursa Switcher -->
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-2">Tip Resursa</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="assetType = 'hardware'"
              :class="[
                'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all duration-200',
                assetType === 'hardware'
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70',
              ]"
            >
              <Laptop class="h-4 w-4" />
              Hardver (Hardware)
            </button>

            <button
              type="button"
              @click="assetType = 'license'"
              :class="[
                'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all duration-200',
                assetType === 'license'
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70',
              ]"
            >
              <Key class="h-4 w-4" />
              Licenca (License)
            </button>
          </div>
        </div>

        <!-- Dynamic Fields: Hardware -->
        <div
          v-if="assetType === 'hardware'"
          class="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3"
        >
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1"
              >Serijski Broj (Serial Number)</label
            >
            <input
              v-model="form.serial_number"
              type="text"
              placeholder="npr. C02X1234YH61"
              class="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <!-- Dynamic Fields: License -->
        <div
          v-if="assetType === 'license'"
          class="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3"
        >
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Licencni Ključ</label>
            <input
              v-model="form.license_key"
              type="text"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              class="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1"
              >Broj Licenci / Mesta (Seats)</label
            >
            <input
              v-model.number="form.seats"
              type="number"
              min="1"
              class="w-full px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Otkaži
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all"
          >
            <span v-if="isSubmitting">Čuvanje...</span>
            <span v-else>{{ isEditMode ? 'Sačuvaj Izmene' : 'Sačuvaj Opremu' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
