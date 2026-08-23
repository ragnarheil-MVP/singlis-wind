import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const SPOT_ID = 128495
const MODEL_ID = 3

function windguruApiPlugin(): Plugin {
  return {
    name: 'windguru-api',
    configureServer(server) {
      server.middlewares.use('/api/forecast', async (_req, res) => {
        try {
          const url = `https://www.windguru.net/int/iapi.php?q=forecast&id_spot=${SPOT_ID}&id_model=${MODEL_ID}`
          const response = await fetch(url, {
            headers: {
              Referer: `https://www.windguru.cz/${SPOT_ID}`,
              'User-Agent':
                'Mozilla/5.0 (compatible; SinglisWind/1.0; +https://www.windguru.cz/128495)',
              Accept: 'application/json',
            },
          })
          if (!response.ok) {
            throw new Error(`Windguru ${response.status}`)
          }
          const data = await response.json()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Forecast konnte nicht geladen werden',
              detail: error instanceof Error ? error.message : String(error),
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), windguruApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
