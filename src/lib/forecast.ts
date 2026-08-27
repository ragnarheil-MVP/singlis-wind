import { knotsToBeaufort } from './wind'

export type ForecastPoint = {
  time: Date
  temperatureC: number
  windKnots: number
  gustKnots: number
  windBf: number
  gustBf: number
  windDir: number
}

export type SpotForecast = {
  spotId: number
  lat: number
  lon: number
  alt: number
  modelName: string
  sunrise: string
  sunset: string
  updatedAt: string | null
  points: ForecastPoint[]
}

type WindguruPayload = {
  id_spot: number
  lat: number
  lon: number
  alt: number
  sunrise?: string
  sunset?: string
  wgmodel?: { model_name?: string }
  fcst: {
    hours: number[]
    initstamp: number
    TMP?: number[]
    TMPE?: number[]
    WINDSPD: number[]
    GUST: number[]
    WINDDIR: number[]
    update_last?: string
    model_name?: string
  }
}

export function parseWindguru(data: WindguruPayload): SpotForecast {
  const { fcst } = data
  const temps = fcst.TMPE ?? fcst.TMP ?? []
  const points: ForecastPoint[] = []

  for (let i = 0; i < fcst.hours.length; i++) {
    const utcMs = (fcst.initstamp + fcst.hours[i] * 3600) * 1000
    const windKnots = fcst.WINDSPD[i] ?? 0
    const gustKnots = fcst.GUST[i] ?? windKnots
    points.push({
      time: new Date(utcMs),
      temperatureC: temps[i] ?? 0,
      windKnots,
      gustKnots,
      windBf: knotsToBeaufort(windKnots),
      gustBf: knotsToBeaufort(gustKnots),
      windDir: fcst.WINDDIR[i] ?? 0,
    })
  }

  return {
    spotId: data.id_spot,
    lat: data.lat,
    lon: data.lon,
    alt: data.alt,
    modelName: fcst.model_name ?? data.wgmodel?.model_name ?? 'GFS',
    sunrise: data.sunrise ?? '',
    sunset: data.sunset ?? '',
    updatedAt: fcst.update_last ?? null,
    points,
  }
}

const BERLIN = 'Europe/Berlin'

function berlinDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Next 5 calendar days in Europe/Berlin, from today. */
export function groupByDay(points: ForecastPoint[], dayCount = 5): Map<string, ForecastPoint[]> {
  const nowKey = berlinDateKey(new Date())
  const grouped = new Map<string, ForecastPoint[]>()

  for (const p of points) {
    const key = berlinDateKey(p.time)
    if (key < nowKey) continue
    const existing = grouped.get(key)
    if (existing) {
      existing.push(p)
      continue
    }
    if (grouped.size >= dayCount) continue
    grouped.set(key, [p])
  }

  return grouped
}

export function nearestPoint(points: ForecastPoint[], now = new Date()): ForecastPoint | null {
  if (!points.length) return null
  let best = points[0]
  let bestDiff = Math.abs(best.time.getTime() - now.getTime())
  for (const p of points) {
    const d = Math.abs(p.time.getTime() - now.getTime())
    if (d < bestDiff) {
      best = p
      bestDiff = d
    }
  }
  return best
}

export function daySummary(points: ForecastPoint[]) {
  if (!points.length) {
    return {
      minTemp: 0,
      maxTemp: 0,
      maxWindBf: 0,
      maxGustBf: 0,
      maxWindKnots: 0,
      maxGustKnots: 0,
    }
  }
  let minTemp = points[0].temperatureC
  let maxTemp = points[0].temperatureC
  let maxWindBf = points[0].windBf
  let maxGustBf = points[0].gustBf
  let maxWindKnots = points[0].windKnots
  let maxGustKnots = points[0].gustKnots
  for (const p of points) {
    minTemp = Math.min(minTemp, p.temperatureC)
    maxTemp = Math.max(maxTemp, p.temperatureC)
    maxWindBf = Math.max(maxWindBf, p.windBf)
    maxGustBf = Math.max(maxGustBf, p.gustBf)
    maxWindKnots = Math.max(maxWindKnots, p.windKnots)
    maxGustKnots = Math.max(maxGustKnots, p.gustKnots)
  }
  return { minTemp, maxTemp, maxWindBf, maxGustBf, maxWindKnots, maxGustKnots }
}
