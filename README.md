# stats.cflc.email

Interactive statistics dashboard for [Cómo funcionan las cosas](https://cflc.email) (CFLC), a Spanish-language newsletter about how everyday things work. Displays 9 years of data (2017–2025): 35,103 subscribers, 593 emails sent.

**Live site:** [stats.cflc.email](https://stats.cflc.email)

## Features

- 16+ interactive charts (subscriber growth, open rates, content hours, finances, community activity, and more)
- Year-by-year tabbed interface (2017–2025) with metric cards and historical records
- Charts dynamically highlight the selected year
- Light/dark theme toggle with `localStorage` persistence
- Responsive layout (3-col → 2-col → 1-col)
- Colorblind-friendly Okabe-Ito color palette
- No build tools, no backend — pure HTML, CSS, and vanilla JavaScript

## File Structure

```
index.html        # Entry point: hero section, chart grid, tabs layout
qpql-data.js      # All statistical data for all 9 years
qpql-app.js       # App logic: tabs, chart initialization, theme toggle
qpql-dashboard.css  # Styles with CSS custom properties for theming
```

**Dependencies** (loaded from CDN, no install required):
- [Chart.js 4.4.1](https://www.chartjs.org/)
- Google Analytics (gtag.js)

## Running Locally

Open `index.html` in any modern browser. No server or build step required.

```sh
open index.html
```

## Updating the Data

All statistics are hardcoded in `qpql-data.js`. To add or update a year:

1. Open `qpql-data.js`.
2. Find the relevant data object (e.g., `subscribersByYear`, `openRates`, `financials`).
3. Add or edit the entry for the target year.
4. Reload `index.html` in your browser — no build step needed.

## Newsletter

CFLC publishes articles about how everyday things work. It has a free tier and a paid **Club de la curiosidad** membership tier. The newsletter is written in Spanish.
