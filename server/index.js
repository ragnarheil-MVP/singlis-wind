import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchWindguruForecast } from '../shared/windguru.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5174

app.use(cors())

app.get('/api/forecast', async (_req, res) => {
  try {
    const data = await fetchWindguruForecast()
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(502).json({
      error: 'Forecast konnte nicht geladen werden',
      detail: error instanceof Error ? error.message : String(error),
    })
  }
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Singlis Wind server on http://localhost:${PORT}`)
})
