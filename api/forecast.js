import { fetchWindguruForecast } from '../shared/windguru.js'

export async function GET() {
  try {
    const data = await fetchWindguruForecast()

    return Response.json(data, {
      status: 200,
      headers: {
        // ~2 days edge cache; cron refreshes every 2 days
        'Cache-Control': 'public, max-age=0, s-maxage=172800',
      },
    })
  } catch (err) {
    return Response.json(
      {
        error: 'Forecast konnte nicht geladen werden',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    )
  }
}
