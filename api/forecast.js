const SPOT_ID = 128495
const MODEL_ID = 3 // GFS 13 km

export async function GET() {
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
      return Response.json(
        { error: `Windguru responded with ${response.status}` },
        { status: 502 },
      )
    }

    const data = await response.json()

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
