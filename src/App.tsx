import { useMemo, useState } from 'react'
import {
  daySummary,
  groupByDay,
  nearestPoint,
  type ForecastPoint,
} from './lib/forecast'
import { useForecast } from './lib/useForecast'
import {
  beaufortLabel,
  bfTone,
  directionToCardinal,
  formatDayLabel,
  formatFullDate,
  formatHour,
  formatKnots,
} from './lib/wind'
import './index.css'

function WindArrow({ deg }: { deg: number }) {
  return (
    <span className="dir-arrow" aria-hidden>
      <svg viewBox="0 0 24 24" style={{ transform: `rotate(${deg}deg)` }}>
        <path
          d="M12 3.5 L16.5 12.5 L12.9 11.1 L12 20.5 L11.1 11.1 L7.5 12.5 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

function Metric({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string
  value: string | number
  unit?: string
  sub?: string
  tone?: string
}) {
  return (
    <div className={`metric ${tone ?? ''}`.trim()}>
      <span className="metric-label">{label}</span>
      <div className="metric-value">
        {value}
        {unit ? <span className="metric-unit">{unit}</span> : null}
      </div>
      {sub ? <div className="metric-sub">{sub}</div> : null}
    </div>
  )
}

function WindPill({
  label,
  bf,
  knots,
}: {
  label: string
  bf: number
  knots: number
}) {
  const tone = bfTone(bf)
  return (
    <div className={`bf-pill ${tone}`}>
      <span className="bf-label">{label}</span>
      <span className="bf-num">{bf} Bf</span>
      <span className="bf-kn">{formatKnots(knots)} Kn</span>
    </div>
  )
}

function HourRow({ point, index }: { point: ForecastPoint; index: number }) {
  return (
    <article className="hour-row" style={{ animationDelay: `${Math.min(index, 12) * 0.03}s` }}>
      <div className="hour-time">{formatHour(point.time)}</div>
      <div className="hour-main">
        <WindArrow deg={point.windDir} />
        <div className="hour-temps">
          <div className="hour-temp">{Math.round(point.temperatureC)}°</div>
          <div className="hour-dir">{directionToCardinal(point.windDir)}</div>
        </div>
      </div>
      <div className="hour-winds">
        <WindPill label="Wind" bf={point.windBf} knots={point.windKnots} />
        <WindPill label="Böen" bf={point.gustBf} knots={point.gustKnots} />
      </div>
    </article>
  )
}

export default function App() {
  const { state, reload } = useForecast()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const days = useMemo(() => {
    if (state.status !== 'ready') return []
    return Array.from(groupByDay(state.data.points, 5).entries()).map(([key, points]) => ({
      key,
      points,
      date: points[0]?.time ?? new Date(`${key}T12:00:00`),
      summary: daySummary(points),
    }))
  }, [state])

  const activeKey = selectedKey && days.some((d) => d.key === selectedKey) ? selectedKey : days[0]?.key
  const activeDay = days.find((d) => d.key === activeKey) ?? days[0]
  const now = state.status === 'ready' ? nearestPoint(state.data.points) : null

  return (
    <main className="app">
      <header className="hero">
        <div className="wind-ribbons" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="spot-meta">
          <span className="spot-dot" />
          Singliser See · DE
        </div>
        <h1 className="brand">Singlis</h1>
        <p className="tagline">Wind, Böen & Temperatur – die nächsten 5 Tage am See.</p>

        {state.status === 'loading' ? (
          <div className="skeleton" aria-label="Lädt" />
        ) : null}

        {state.status === 'error' ? (
          <div className="status">
            <p>{state.message}</p>
            <button type="button" className="reload-btn" onClick={() => void reload()}>
              Erneut laden
            </button>
          </div>
        ) : null}

        {state.status === 'ready' && now ? (
          <section className="now-panel" aria-label="Aktuelle Prognose">
            <Metric
              label="Temperatur"
              value={Math.round(now.temperatureC)}
              unit="°C"
              sub={formatHour(now.time)}
            />
            <Metric
              label="Wind"
              value={now.windBf}
              unit="Bf"
              sub={`${formatKnots(now.windKnots)} Kn · ${beaufortLabel(now.windBf)}`}
              tone={bfTone(now.windBf)}
            />
            <Metric
              label="Böen"
              value={now.gustBf}
              unit="Bf"
              sub={`${formatKnots(now.gustKnots)} Kn · ${beaufortLabel(now.gustBf)}`}
              tone={bfTone(now.gustBf)}
            />
          </section>
        ) : null}
      </header>

      {state.status === 'ready' && activeDay ? (
        <section aria-label="5-Tage-Prognose">
          <div className="toolbar">
            <h2>Prognose</h2>
            <div className="source">
              <div>{state.data.modelName}</div>
              <a href="https://www.windguru.cz/128495" target="_blank" rel="noreferrer">
                Windguru 128495
              </a>
            </div>
          </div>

          <div className="day-tabs" role="tablist" aria-label="Tag wählen">
            {days.map((day) => (
              <button
                key={day.key}
                type="button"
                role="tab"
                aria-selected={day.key === activeKey}
                className={`day-tab${day.key === activeKey ? ' active' : ''}`}
                onClick={() => setSelectedKey(day.key)}
              >
                <span className="dow">{formatDayLabel(day.date)}</span>
                <span className={`peak ${bfTone(day.summary.maxWindBf)}`}>
                  {day.summary.maxWindBf} Bf
                </span>
                <span className="peak-kn">{formatKnots(day.summary.maxWindKnots)} Kn</span>
                <span className="range">
                  {Math.round(day.summary.minTemp)}–{Math.round(day.summary.maxTemp)}°
                </span>
              </button>
            ))}
          </div>

          <div className="day-heading">
            <h3>{formatFullDate(activeDay.date)}</h3>
            <p>
              Max Wind {activeDay.summary.maxWindBf} Bf ({formatKnots(activeDay.summary.maxWindKnots)}{' '}
              Kn) · Böen bis {activeDay.summary.maxGustBf} Bf (
              {formatKnots(activeDay.summary.maxGustKnots)} Kn)
            </p>
          </div>

          <div className="hours">
            {activeDay.points.map((point, index) => (
              <HourRow key={point.time.toISOString()} point={point} index={index} />
            ))}
          </div>

          <p className="footer-note">
            Daten von Windguru (GFS). Wind & Böen in Beaufort und Knoten (Kn).
            {state.data.updatedAt ? ` Stand Modell: ${state.data.updatedAt}` : null}
          </p>
        </section>
      ) : null}
    </main>
  )
}
