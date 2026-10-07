import { onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { echo } from '@/echo'

interface AssetChangedEvent {
  asset_id: string
  action: string
}

export function useAssetBroadcast(onAssetChanged: (event: AssetChangedEvent) => void) {
  const auth = useAuthStore()
  let subscribedChannel: string | null = null

  const stopWatching = watch(
    () => auth.user?.tenant_id,
    (tenantId) => {
      if (subscribedChannel) {
        echo.leave(subscribedChannel)
        subscribedChannel = null
      }

      if (!tenantId) return

      const channelName = `tenants.${tenantId}.assets`
      subscribedChannel = channelName
      echo
        .private(channelName)
        .subscribed(() => {
          console.info(`Subscribed to private broadcast channel: ${channelName}`)
        })
        .error((error) => {
          console.error(`Could not subscribe to private broadcast channel: ${channelName}`, error)
        })
        .listen('.asset.changed', (event: AssetChangedEvent) => {
          console.info('Received asset.changed broadcast:', event)
          onAssetChanged(event)
        })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stopWatching()
    if (subscribedChannel) echo.leave(subscribedChannel)
  })
}
