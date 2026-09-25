import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchWindguruForecast } from './shared/windguru.js'

function windguruApiPlugin(): Plugin {
  return {
    name: 'windguru-api',
    configureServer(server) {
      server.middlewares.use('/api/forecast', async (_req, res) => {
        try {
          const data = await fetchWindguruForecast()
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
    allowedHosts: true,
  },
})
