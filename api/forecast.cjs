const SPOT_ID = 128495;
const MODEL_ID = 3; // GFS 13 km

async function handler(req, res) {
  try {
    if (req.method && req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const url = `https://www.windguru.net/int/iapi.php?q=forecast&id_spot=${SPOT_ID}&id_model=${MODEL_ID}`;

    const response = await fetch(url, {
      headers: {
        Referer: `https://www.windguru.cz/${SPOT_ID}`,
        'User-Agent': 'Mozilla/5.0 (compatible; SinglisWind/1.0; +https://www.windguru.cz/128495)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Windguru responded with ${response.status}` }));
      return;
    }

    const data = await response.json();

    // Cache for ~2 days on Vercel edge to match "update every 2 days".
    // next refresh happens when cache expires and cron / user hits the endpoint.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=172800');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Forecast konnte nicht geladen werden', detail: String(err?.message || err) }));
  }
}

module.exports = handler;

