# Airflow Dashboard API Reference

This document describes every Netlify Function exposed by the dashboard. Each function proxies requests to the Astronomer/Airflow REST API while keeping credentials on the server. All functions return JSON and accept the `Authorization` header internally using `AIRFLOW_API_TOKEN`; the browser never sends credentials directly.

## Environment Variables

| Variable | Description |
| --- | --- |
| `AIRFLOW_API_BASE_URL` | Astronomer workspace URL (no `/api/v*` suffix). |
| `AIRFLOW_API_VERSION` | Optional API version (default `2`). Resolves to `/api/v{version}`. |
| `AIRFLOW_API_TOKEN` | Read-only Astronomer API token used for all upstream calls. |

> `.env`, `.env.local`, etc. are ignored by git to prevent leaking credentials.

---

## `GET /.netlify/functions/dags`

Lists DAGs from Airflow.

| Query Param | Type | Default | Description |
| --- | --- | --- | --- |
| `limit` | number | `50` | Maximum DAGs to fetch. |
| `offset` | number | `0` | Pagination offset. |
| `tags` | string | — | Filter by tag name. |
| `only_active` | boolean | — | Limit to active DAGs. |
| `dag_id_pattern` | string | — | Apply pattern matching to DAG IDs. |

**Upstream call:** `GET {AIRFLOW_API_BASE_URL}/api/v{n}/dags`

**Response body:** Airflow's DAG collection payload (`{ dags: [...], total_entries: number }`).

---

## `GET /.netlify/functions/dagDetails`

Retrieves metadata for a specific DAG.

| Query Param | Type | Required | Description |
| --- | --- | --- | --- |
| `dagId` (or `dag_id`) | string | ✅ | Target DAG ID. |

**Upstream call:** `GET {base}/dags/{dag_id}`

**Response body:** Airflow DAG resource.

---

## `GET /.netlify/functions/dagRuns`

Fetches DAG run history for a given DAG.

| Query Param | Type | Default | Description |
| --- | --- | --- | --- |
| `dagId` (or `dag_id`) | string | — | Target DAG ID (required). |
| `limit` | number | `25` | Number of runs to retrieve. |
| `offset` | number | `0` | Pagination offset. |
| `state` | string | — | Filter by run state (`success`, `failed`, etc.). |
| `execution_date_gte` / `startDate` | ISO date | — | Lower bound for execution date. |
| `execution_date_lte` / `endDate` | ISO date | — | Upper bound for execution date. |
| `order_by` | string | — | Sort key (e.g., `-execution_date`). |

**Upstream call:** `GET {base}/dags/{dag_id}/dagRuns`

**Response body:** `{ dag_runs: [...], total_entries: number }`

---

## `GET /.netlify/functions/taskInstances`

Returns task instances for a specific DAG run.

| Query Param | Type | Required | Description |
| --- | --- | --- | --- |
| `dagId` (or `dag_id`) | string | ✅ | DAG identifier. |
| `dagRunId` (or `dag_run_id`) | string | ✅ | DAG run identifier. |
| `state` | string | — | Filter by task state. |
| `map_index` | number | — | Filter for mapped task index. |

**Upstream call:** `GET {base}/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances`

**Response body:** `{ task_instances: [...] }`

---

## `GET /.netlify/functions/eventLogs`

Lists recent Airflow event logs (typically WARN/ERROR entries).

| Query Param | Type | Default | Description |
| --- | --- | --- | --- |
| `limit` | number | `50` | Max number of events. |
| `dag_id` / `dagId` | string | — | Filter logs for a single DAG. |
| `task_id` / `taskId` | string | — | Filter logs for a specific task. |
| `event` | string | — | Filter by event type (`ERROR`, `WARNING`, etc.). |

**Upstream call:** `GET {base}/eventLogs`

**Response body:** `{ event_logs: [...] }`

---

## Error Handling

- Upstream non-2xx responses are logged server-side and returned as `{ error: 'Internal server error', message: '<details>' }` with the appropriate status code.
- Missing required parameters respond with `400` and a descriptive `error` message.

Keep this reference alongside `README.md` so developers can integrate or extend the API safely without inspecting function code.
