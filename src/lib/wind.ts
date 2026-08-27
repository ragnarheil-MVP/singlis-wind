/** Beaufort from knots (WMO / marine standard). */
export function knotsToBeaufort(knots: number): number {
  const k = Math.max(0, knots)
  if (k < 1) return 0
  if (k < 4) return 1
  if (k < 7) return 2
  if (k < 11) return 3
  if (k < 17) return 4
  if (k < 22) return 5
  if (k < 28) return 6
  if (k < 34) return 7
  if (k < 41) return 8
  if (k < 48) return 9
  if (k < 56) return 10
  if (k < 64) return 11
  return 12
}

export function beaufortLabel(bf: number): string {
  const labels = [
    'Windstille',
    'leichter Zug',
    'leichte Brise',
    'schwache Brise',
    'mäßige Brise',
    'frische Brise',
    'starker Wind',
    'steifer Wind',
    'stürmischer Wind',
    'Sturm',
    'schwerer Sturm',
    'orkanartiger Sturm',
    'Orkan',
  ]
  return labels[Math.min(12, Math.max(0, bf))] ?? ''
}

export function directionToCardinal(deg: number): string {
  const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const i = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16
  return dirs[i]
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

/** Calendar-day difference in Europe/Berlin (ignores clock time). */
function berlinDayDiff(a: Date, b: Date): number {
  const aKey = berlinDateKey(a)
  const bKey = berlinDateKey(b)
  const aUtc = Date.parse(`${aKey}T12:00:00Z`)
  const bUtc = Date.parse(`${bKey}T12:00:00Z`)
  return Math.round((aUtc - bUtc) / 86400000)
}

export function formatDayLabel(date: Date, now = new Date()): string {
  const diffDays = berlinDayDiff(date, now)
  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Morgen'
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    weekday: 'short',
  }).format(date)
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatHour(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: BERLIN,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** CSS accent intensity class by Beaufort. */
export function bfTone(bf: number): string {
  if (bf <= 1) return 'tone-calm'
  if (bf <= 3) return 'tone-light'
  if (bf <= 5) return 'tone-fresh'
  if (bf <= 7) return 'tone-strong'
  return 'tone-storm'
}

/** Format knot values (Windguru source unit). */
export function formatKnots(knots: number): string {
  const k = Math.max(0, knots)
  const rounded = Math.round(k * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}
