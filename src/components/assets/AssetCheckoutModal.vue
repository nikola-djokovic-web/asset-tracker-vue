<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetStore } from '@/stores/assets'
import { useUserStore } from '@/stores/users'
import { UserCheck, RefreshCw, X } from 'lucide-vue-next'
import type { Asset } from '@/types'

const props = defineProps<{
  asset: Asset
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const assetStore = useAssetStore()
const userStore = useUserStore()

const { users, loading: isLoadingUsers } = storeToRefs(userStore)

const isSubmitting = ref(false)

const form = ref({
  assigned_to_user_id: '',
  condition_on_checkout: 'good' as 'new' | 'good' | 'damaged',
  notes: '',
})

onMounted(async () => {
  if (users.value.length === 0) {
    await userStore.fetchUsers({ per_page: 100 })
  }
})

const handleSubmit = async () => {
  if (!form.value.assigned_to_user_id) return

  isSubmitting.value = true
  try {
    await assetStore.checkoutAsset(props.asset.id, {
      assigned_to_user_id: form.value.assigned_to_user_id,
      condition_on_checkout: form.value.condition_on_checkout,
      notes: form.value.notes || undefined,
    })
    emit('success')
    emit('close')
  } catch (error) {
    // Grešku hvata i prikazuje toast u assetStore-u
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        class="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div
              class="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
            >
              <UserCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Zaduži Opremu</h3>
              <p class="text-xs text-slate-400 font-mono">
                {{ asset.name }} ({{ asset.asset_tag }})
              </p>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Select User -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">
              Zaposleni / Korisnik <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="form.assigned_to_user_id"
              required
              :disabled="isLoadingUsers"
              class="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              <option value="" disabled>
                {{ isLoadingUsers ? 'Učitavanje korisnika...' : 'Izaberi korisnika...' }}
              </option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <!-- Condition on Checkout -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">
              Stanje opreme pri izdavanju
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                v-for="cond in ['new', 'good', 'damaged'] as const"
                :key="cond"
                @click="form.condition_on_checkout = cond"
                :class="[
                  'py-2 px-3 text-xs font-medium rounded-xl border transition-all capitalize',
                  form.condition_on_checkout === cond
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800',
                ]"
              >
                {{ cond === 'new' ? 'Novo' : cond === 'good' ? 'Dobro' : 'Oštećeno' }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5"
              >Napomena (opciono)</label
            >
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Npr. Predat punjač i torba za laptop..."
              class="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-medium text-sm transition-colors"
            >
              Odustani
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !form.assigned_to_user_id"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <span>Potvrdi Zaduženje</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
