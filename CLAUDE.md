# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Singlis Wind is a mobile-first wind forecast application for Singliser See (Singlis lake) in Germany. It displays temperature, wind speed, and gusts in Beaufort scale for the next 5 days, sourced from Windguru spot 128495 (GFS 13 km model).

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (Vite dev server with API proxy)
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Lint with oxlint
npm run lint

# Preview production build locally
npm run preview

# Production server (requires build first)
npm run serve
# Runs at http://localhost:5174
```

## Architecture

### Dual API Implementation

This project maintains **three separate implementations** of the same Windguru API proxy for different deployment contexts:

1. **`vite.config.ts`** - Vite plugin for local development (`npm run dev`)
2. **`server/index.js`** - Express server for self-hosted production (`npm run serve`)
3. **`api/forecast.js`** - Vercel serverless function for Vercel deployment

All three fetch from `https://www.windguru.net/int/iapi.php?q=forecast&id_spot=128495&id_model=3` with identical headers. When modifying the API logic, update all three files.

### Data Flow

```
Windguru API → API proxy (/api/forecast) → useForecast hook → parseWindguru → App component
```

1. **`useForecast.ts`** - React hook that fetches from `/api/forecast` on mount
2. **`forecast.ts`** - Contains `parseWindguru()` to transform Windguru JSON into typed `SpotForecast` and `ForecastPoint` objects
3. **`wind.ts`** - Utilities for Beaufort conversion, cardinal directions, date formatting (Europe/Berlin timezone)
4. **`App.tsx`** - Main UI component with day tabs, hourly forecast rows, and current conditions

### Timezone Handling

All date formatting uses **`Europe/Berlin`** timezone via `Intl.DateTimeFormat`. Day grouping is based on Berlin calendar days, not UTC. The `berlinDateKey()` function in both `forecast.ts` and `wind.ts` ensures consistent date grouping.

### Beaufort Scale

Wind speeds are stored in **knots** (source unit from Windguru) and converted to Beaufort using WMO marine standards in `knotsToBeaufort()`. The UI displays both units: e.g., "5 Bf (18.5 Kn)".

## Vercel Deployment

The project is configured for Vercel with:

- **Build**: `npm run build` → outputs to `dist/`
- **API Route**: `api/forecast.js` (serverless function)
- **Caching**: Edge cache for ~2 days (`s-maxage=172800`)
- **Cron**: Refreshes forecast every 2 days via `vercel.json` cron at 03:00 UTC

The `vercel.json` rewrite ensures SPA routing works: all non-API routes serve `index.html`.

## Key Constraints

- **Mobile-first design** - UI is optimized for small screens
- **German language** - All labels, date formats, and error messages are in German
- **5-day forecast** - `groupByDay()` limits output to 5 calendar days from today (Berlin time)
- **No external dependencies for UI** - Uses vanilla CSS, no component library
