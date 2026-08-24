# Singlis Wind

Mobile-first Windprognose für **Singlis (Singliser See)** – Temperatur, Windstärke und Böen in Beaufort für die nächsten 5 Tage.

Datenquelle: [Windguru Spot 128495](https://www.windguru.cz/128495) (GFS 13 km).

## Start

```bash
npm install
npm run dev
```

App: http://localhost:5173

Produktion:

```bash
npm run build
npm start
```

Server mit API-Proxy: http://localhost:5174

## Vercel Deploy (empfohlen für Freunde)

Vercel kann:
1) die statische React-App aus `dist/` hosten  
2) gleichzeitig die API-Route `/api/forecast` als Serverless Function aus `api/forecast.js` ausführen  

### Schritte
1. Projekt auf GitHub pushen (oder neues Repo anlegen)
2. In Vercel: **Add New Project → Import Git Repository**
3. Build Settings:
   - **Framework preset**: (kein spezielles, nur Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Nach dem Deploy bekommst du eine öffentliche URL (z.B. `https://...vercel.app`)

### „Jeden 2. Tag Update“
- Die API-Antwort ist auf der Vercel-Edge für ca. **172800 Sekunden (~2 Tage)** gecached.
- Ein Vercel-Cron triggert `/api/forecast` im Rhythmus **alle 2 Tage** (UTC), sodass sich der Forecast spätestens dann aktualisiert.
