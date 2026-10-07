import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { broadcastApi } from '@/api/axios'

// Deklaracija na globalnom window objektu da spreči TS kompilacione greške
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<any>
  }
}

window.Pusher = Pusher

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env['VITE_REVERB_APP_KEY'] || 'twub3191142289410111',
  wsHost: import.meta.env['VITE_REVERB_HOST'] || 'localhost',
  wsPort: Number(import.meta.env['VITE_REVERB_PORT']) || 8080,
  wssPort: Number(import.meta.env['VITE_REVERB_PORT']) || 8080,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      broadcastApi
        .post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then(({ data }) => callback(null, data))
        .catch((error: unknown) => {
          console.error('Broadcast channel authorization failed:', error)
          callback(error as Error, { auth: '' })
        })
    },
  }),
})
