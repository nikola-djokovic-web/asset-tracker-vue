import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error'

export interface ToastOptions {
  message: string
  title?: string
  type?: ToastType
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false)
  const message = ref('')
  const title = ref('')
  const type = ref<ToastType>('success')
  const duration = ref(3000)

  let timer: ReturnType<typeof setTimeout> | null = null

  const show = (options: ToastOptions) => {
    // Resetujemo prethodni tajmer ako postoji
    if (timer) clearTimeout(timer)

    message.value = options.message
    title.value = options.title || (options.type === 'error' ? 'Greška' : 'Uspešno')
    type.value = options.type || 'success'
    duration.value = options.duration || 3000
    isVisible.value = true

    timer = setTimeout(() => {
      close()
    }, duration.value)
  }

  const success = (msg: string, customTitle?: string) => {
    show({ message: msg, title: customTitle, type: 'success' })
  }

  const error = (msg: string, customTitle?: string) => {
    show({ message: msg, title: customTitle, type: 'error' })
  }

  const close = () => {
    isVisible.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    isVisible,
    message,
    title,
    type,
    duration,
    show,
    success,
    error,
    close,
  }
})
