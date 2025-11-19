# Airflow Monitoring Dashboard

Modern React + Netlify dashboard for monitoring Apache Airflow DAGs running on Astronomer Cloud. The UI visualizes DAG health, provides quick drilldowns into run history, and exposes recent WARN/ERROR event logs — all while keeping API credentials on the server via Netlify Functions.

## Features

- Airflow workspace overview with key metrics, run state chart, and recent event logs.
- Searchable/filterable DAG directory with responsive cards.
- DAG detail page that combines metadata, run filters, run table, and per-run task instances.
- Error log explorer with DAG/task filters and adjustable limits.
- Comprehensive loading, empty, and error states for every network call.
- Responsive layout with persistent sidebar navigation on desktop and mobile-friendly tabs.
- Secure Netlify Function proxy that validates env vars and never exposes tokens to the browser.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Lucide icons, Recharts.
- **Backend**: Netlify Functions (Node 18 runtime, native `fetch`), Astronomer/Airflow REST API.
- **Tooling**: Tailwind/PostCSS pipeline, Netlify CLI, ESM modules, custom data-fetch hook.

## Project Structure

```
airflow-dashboard/
├─ netlify/
│  └─ functions/           # Serverless API proxy (dags, dagDetails, dagRuns, taskInstances, eventLogs)
├─ src/
│  ├─ components/          # Layout, DAG widgets, charts, logs, and shared UI
│  ├─ hooks/               # useAsyncData for consistent loading/error handling
│  ├─ pages/               # Dashboard, DAG List, DAG Detail, Error Logs, Not Found
│  └─ utils/               # API client + formatters
├─ netlify.toml            # Build + redirect config
├─ tailwind.config.js      # Tailwind setup
├─ package.json            # Scripts/dependencies
└─ README.md
```

## Environment Variables

Create a `.env` file (or configure Netlify site env vars) using `.env.example` as a template:

| Variable | Description |
| --- | --- |
| `AIRFLOW_API_BASE_URL` | Astronomer workspace URL (no `/api/v*`), e.g., `https://<deployment>.astronomer.run` |
| `AIRFLOW_API_VERSION` | Optional API version (defaults to `2` for Airflow 3+) |
| `AIRFLOW_API_TOKEN` | Read-only Astronomer API token with DAG read permissions |

> ⚠️ Never commit `.env` files. Tokens only live in Netlify environment variables.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Populate `.env`**
   ```bash
   cp .env.example .env
   # update AIRFLOW_API_BASE_URL + AIRFLOW_API_VERSION + AIRFLOW_API_TOKEN
   ```
3. **Run locally**
   ```bash
   npm run dev        # Vite dev server
   npm run netlify    # Optional: runs Netlify Functions + Vite together
   ```
4. **Build for production**
   ```bash
   npm run build
   npm run preview    # Serve the built bundle locally
   ```

## Deployment (Netlify)

1. Push to GitHub and create a Netlify site from that repo.
2. Netlify build command: `npm run build`, publish directory: `dist`.
3. Add env vars (`AIRFLOW_API_BASE_URL`, `AIRFLOW_API_VERSION`, `AIRFLOW_API_TOKEN`) under Site settings → Environment.
4. Deploy. Netlify will run the Vite build and expose the functions under `/.netlify/functions/*`.

## API & Security Notes

- All frontend requests hit `/.netlify/functions/*` and **never** talk directly to Astronomer.
- `netlify/functions/utils/airflowClient.js` validates env vars, applies the bearer token, and normalizes errors.
- API version defaults to `/api/v2` (Airflow 3); override `AIRFLOW_API_VERSION` if you must target a different version.
- `.gitignore` excludes any `.env*` file; `.env.example` documents required config.
- Friendly errors are shown in the UI; technical details are only logged server-side.

Security checklist:

- [x] API credentials only live in serverless env vars
- [x] `.env` is ignored
- [x] API calls flow through Netlify Functions
- [x] Functions validate incoming params + env config

## Testing Guidance

- `npm run dev` + browser testing covers the interactive flows.
- Use browser DevTools + the built-in refresh buttons to validate loading/error/empty states.
- For API validation without real credentials, mock Netlify Function responses or use Astronomer’s sandbox tokens.

## Future Enhancements

- Persisted filters & time ranges using URL params.
- Additional charts (duration trends, SLA warnings).
- WebSocket/SSE status updates for near-real-time monitoring.

## License

MIT License – internal training project for AI coding agents.
