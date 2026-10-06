<script setup lang="ts">
import { ref } from 'vue'
import { useAssetStore } from '@/stores/assets'
import { ArrowDownLeft, RefreshCw, X } from 'lucide-vue-next'
import type { Asset } from '@/types'

const props = defineProps<{
  asset: Asset
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const assetStore = useAssetStore()
const isSubmitting = ref(false)

const form = ref({
  condition_on_checkin: 'good' as 'new' | 'good' | 'damaged',
  notes: '',
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await assetStore.checkinAsset(props.asset.id, {
      condition_on_checkin: form.value.condition_on_checkin,
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
              class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <ArrowDownLeft class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Razduži Opremu</h3>
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
          <!-- Condition on Checkin -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">
              Stanje opreme pri vraćanju <span class="text-rose-400">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                v-for="cond in ['new', 'good', 'damaged'] as const"
                :key="cond"
                @click="form.condition_on_checkin = cond"
                :class="[
                  'py-2 px-3 text-xs font-medium rounded-xl border transition-all capitalize',
                  form.condition_on_checkin === cond
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
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
              >Napomena o povratu (opciono)</label
            >
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Npr. Vraćeno bez vidljivih oštećenja, punjač u kompletu..."
              class="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
            >
              <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <span>Potvrdi Razduženje</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
