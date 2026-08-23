import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5174
const SPOT_ID = 128495
const MODEL_ID = 3 // GFS 13 km

app.use(cors())

app.get('/api/forecast', async (_req, res) => {
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
      throw new Error(`Windguru responded with ${response.status}`)
    }

    const data = await response.json()
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
app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Singlis Wind server on http://localhost:${PORT}`)
})
