<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastStore.isVisible"
        class="fixed bottom-5 right-5 z-[9999] max-w-md w-full sm:w-96 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-2xl shadow-slate-950/80 overflow-hidden backdrop-blur-xl"
      >
        <div class="p-4 flex items-start gap-3.5 relative">
          <!-- Ikonica zavisi od tipa -->
          <div
            v-if="toastStore.type === 'success'"
            class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5"
          >
            <CheckCircle2 class="w-5 h-5" />
          </div>

          <div
            v-else
            class="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 mt-0.5"
          >
            <AlertCircle class="w-5 h-5" />
          </div>

          <!-- Naslov i poruka -->
          <div class="flex-1 min-w-0 pr-6">
            <h4
              class="text-sm font-semibold tracking-tight"
              :class="toastStore.type === 'success' ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ toastStore.title }}
            </h4>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed break-words">
              {{ toastStore.message }}
            </p>
          </div>

          <!-- X dugme za zatvaranje -->
          <button
            @click="toastStore.close"
            class="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Progress bar na dnu -->
        <div class="w-full bg-slate-800/60 h-1 overflow-hidden">
          <div
            class="h-full progress-bar-shrink"
            :class="toastStore.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
            :style="{ animationDuration: `${toastStore.duration}ms` }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.progress-bar-shrink {
  animation-name: shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
