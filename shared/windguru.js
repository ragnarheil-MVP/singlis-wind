export const WINDGURU_SPOT_ID = 128495
export const WINDGURU_MODEL_ID = 3 // GFS 13 km

const WINDGURU_URL = `https://www.windguru.net/int/iapi.php?q=forecast&id_spot=${WINDGURU_SPOT_ID}&id_model=${WINDGURU_MODEL_ID}`

const WINDGURU_HEADERS = {
  Referer: `https://www.windguru.cz/${WINDGURU_SPOT_ID}`,
  'User-Agent': 'Mozilla/5.0 (compatible; SinglisWind/1.0; +https://www.windguru.cz/128495)',
  Accept: 'application/json',
}

/**
 * Fetches the raw Windguru forecast JSON for the configured spot/model.
 * Throws on a non-OK response; callers decide how to format the error.
 * @returns {Promise<unknown>}
 */
export async function fetchWindguruForecast() {
  const response = await fetch(WINDGURU_URL, { headers: WINDGURU_HEADERS })
  if (!response.ok) {
    throw new Error(`Windguru responded with ${response.status}`)
  }
  return response.json()
}
