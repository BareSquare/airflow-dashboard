import {
  fetchFromAirflow,
  getQueryParams,
  handleFunctionError,
  jsonResponse,
  pickSearchParams
} from './utils/airflowClient.js';

const DEFAULT_LIMIT = '25';

export const handler = async (event) => {
  try {
    const dagId =
      event.queryStringParameters?.dagId ||
      event.queryStringParameters?.dag_id;

    if (!dagId) {
      return jsonResponse(400, { error: 'dagId is required' });
    }

    const params = getQueryParams(event);
    const searchParams = {
      limit: params.get('limit') || DEFAULT_LIMIT,
      offset: params.get('offset') || '0',
      ...pickSearchParams(params, [
        'state',
        'execution_date_gte',
        'execution_date_lte',
        'order_by'
      ])
    };

    if (params.get('startDate')) {
      searchParams.execution_date_gte = params.get('startDate');
    }

    if (params.get('endDate')) {
      searchParams.execution_date_lte = params.get('endDate');
    }

    const data = await fetchFromAirflow(
      `dags/${encodeURIComponent(dagId)}/dagRuns`,
      { searchParams }
    );

    return jsonResponse(200, data);
  } catch (error) {
    return handleFunctionError(error);
  }
};
