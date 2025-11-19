import {
  fetchFromAirflow,
  getQueryParams,
  handleFunctionError,
  jsonResponse,
  pickSearchParams
} from './utils/airflowClient.js';

export const handler = async (event) => {
  try {
    const params = getQueryParams(event);
    const searchParams = {
      limit: params.get('limit') || '50',
      offset: params.get('offset') || '0',
      ...pickSearchParams(params, ['tags', 'only_active', 'dag_id_pattern'])
    };

    const data = await fetchFromAirflow('dags', { searchParams });
    return jsonResponse(200, data);
  } catch (error) {
    return handleFunctionError(error);
  }
};
