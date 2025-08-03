import { useToast as usePrimeToast } from 'primevue/usetoast'
import { i18n } from '@/main'
// Хук для получения тоста
export function useToast() {
  const toast = usePrimeToast()
  if (!toast) {
    throw new Error('Toast provider not found!')
  }

  return {
    error: (message: string) => toast.add({
      summary: i18n.global.t('toast.error'),
      severity: 'error',
      detail: message,
      life: 300000
    }),

    info: (message: string) => toast.add({
      summary: i18n.global.t('toast.info'),
      severity: 'info',
      detail: message,
      life: 30000
    }),

    success: (message: string) => toast.add({
      summary: i18n.global.t('toast.success'),
      severity: 'success',
      detail: message,
      life: 3000,
    }),

    warning: (message: string) => toast.add({
      summary: i18n.global.t('toast.warning'),
      severity: 'warn',
      detail: message,
      life: 3000
    })
  }
}
