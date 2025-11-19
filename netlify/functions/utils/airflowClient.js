const REQUIRED_ENV_VARS = ['AIRFLOW_API_BASE_URL', 'AIRFLOW_API_TOKEN'];
const DEFAULT_API_VERSION = process.env.AIRFLOW_API_VERSION || '2';

/**
 * Builds a standard JSON HTTP response for Netlify Functions.
 * @param {number} statusCode
 * @param {Object} payload
 * @returns {{statusCode:number, headers:Object, body:string}}
 */
export const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(payload)
});

/**
 * Ensures the Netlify runtime has the required environment variables.
 * @throws {Error}
 */
const ensureEnvironment = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Resolves the Airflow API base URL and guarantees `/api/vX` suffix.
 * Builds the Airflow API base using AIRFLOW_API_BASE_URL and AIRFLOW_API_VERSION.
 * @returns {string}
 */
const resolveAirflowBaseUrl = () => {
  const configured = process.env.AIRFLOW_API_BASE_URL;

  if (!configured) {
    throw new Error('AIRFLOW_API_BASE_URL is not configured');
  }

  const trimmed = configured.replace(/\/$/, '');
  const version =
    (process.env.AIRFLOW_API_VERSION || DEFAULT_API_VERSION).toString() || '2';
  const normalizedVersion = version.replace(/^v/i, '');
  const desiredSuffix = `/api/v${normalizedVersion}`;

  const lower = trimmed.toLowerCase();
  if (lower.endsWith(desiredSuffix)) {
    return trimmed;
  }

  const knownSuffixes = ['/api/v1', '/api/v2', '/api/v3'];
  const matchedSuffix = knownSuffixes.find((suffix) => lower.endsWith(suffix));
  if (matchedSuffix) {
    return trimmed.slice(0, -matchedSuffix.length) + desiredSuffix;
  }

  return `${trimmed}${desiredSuffix}`;
};

/**
 * Fetches data from the Airflow API proxying the request securely.
 * @param {string} endpoint - Relative Airflow endpoint (no leading slash needed)
 * @param {Object} options
 * @param {Object} [options.searchParams]
 * @param {string} [options.method='GET']
 * @param {Object} [options.body]
 * @returns {Promise<any>}
 */
export const fetchFromAirflow = async (endpoint, options = {}) => {
  ensureEnvironment();

  const { searchParams, method = 'GET', body } = options;
  const baseUrl = resolveAirflowBaseUrl();
  const safeEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = new URL(`${baseUrl}/${safeEndpoint}`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.AIRFLOW_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Airflow API error (${response.status}) ${message}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
};

/**
 * Helper that returns the query parameters from the Netlify event.
 * @param {import('@netlify/functions').HandlerEvent} event
 * @returns {URLSearchParams}
 */
export const getQueryParams = (event) =>
  new URLSearchParams(event.rawQueryString || '');

/**
 * Selects only allowed keys from URLSearchParams and returns a plain object.
 * @param {URLSearchParams} params
 * @param {string[]} allowed
 */
export const pickSearchParams = (params, allowed) => {
  const picked = {};
  allowed.forEach((key) => {
    const value = params.get(key);
    if (value !== null && value !== '') {
      picked[key] = value;
    }
  });
  return picked;
};

/**
 * Logs and formats unexpected errors before returning to the client.
 * @param {unknown} error
 */
export const handleFunctionError = (error) => {
  console.error('Netlify Function error:', error);
  const statusCode =
    typeof error.statusCode === 'number' && error.statusCode >= 400
      ? error.statusCode
      : 500;
  return jsonResponse(statusCode, {
    error: 'Internal server error',
    message: error.message || 'Unknown error'
  });
};
