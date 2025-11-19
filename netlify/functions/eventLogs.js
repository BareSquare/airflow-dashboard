import {
  fetchFromAirflow,
  getQueryParams,
  handleFunctionError,
  jsonResponse,
  pickSearchParams
} from './utils/airflowClient.js';

const DEFAULT_LIMIT = '50';

export const handler = async (event) => {
  try {
    const params = getQueryParams(event);
    const searchParams = {
      limit: params.get('limit') || DEFAULT_LIMIT,
      ...pickSearchParams(params, ['dag_id', 'task_id', 'event'])
    };

    if (params.get('dagId')) {
      searchParams.dag_id = params.get('dagId');
    }

    if (params.get('taskId')) {
      searchParams.task_id = params.get('taskId');
    }

    const data = await fetchFromAirflow('eventLogs', { searchParams });
    return jsonResponse(200, data);
  } catch (error) {
    return handleFunctionError(error);
  }
};
