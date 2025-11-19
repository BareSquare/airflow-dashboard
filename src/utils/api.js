const FUNCTIONS_BASE = '/.netlify/functions';

/**
 * Builds a query string from provided params.
 * @param {Record<string, string | number | undefined>} params
 * @returns {string}
 */
const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

/**
 * Makes a request to a Netlify Function and returns parsed JSON.
 * @param {string} path
 * @param {Record<string, string | number>} [params]
 */
const request = async (path, params = {}) => {
  const response = await fetch(`${FUNCTIONS_BASE}/${path}${buildQueryString(params)}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch data');
  }

  return response.json();
};

export const fetchDags = (params) => request('dags', params);

export const fetchDagDetails = (dagId) => request('dagDetails', { dagId });

export const fetchDagRuns = (dagId, params) =>
  request('dagRuns', { dagId, ...params });

export const fetchTaskInstances = (dagId, dagRunId, params) =>
  request('taskInstances', { dagId, dagRunId, ...params });

export const fetchEventLogs = (params) => request('eventLogs', params);
