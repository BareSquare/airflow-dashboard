import {
  fetchFromAirflow,
  getQueryParams,
  handleFunctionError,
  jsonResponse,
  pickSearchParams
} from './utils/airflowClient.js';

export const handler = async (event) => {
  try {
    const dagId =
      event.queryStringParameters?.dagId ||
      event.queryStringParameters?.dag_id;
    const dagRunId =
      event.queryStringParameters?.dagRunId ||
      event.queryStringParameters?.dag_run_id;

    if (!dagId || !dagRunId) {
      return jsonResponse(400, {
        error: 'dagId and dagRunId are required'
      });
    }

    const params = getQueryParams(event);
    const searchParams = pickSearchParams(params, ['state', 'map_index']);

    const data = await fetchFromAirflow(
      `dags/${encodeURIComponent(dagId)}/dagRuns/${encodeURIComponent(
        dagRunId
      )}/taskInstances`,
      { searchParams }
    );

    return jsonResponse(200, data);
  } catch (error) {
    return handleFunctionError(error);
  }
};
