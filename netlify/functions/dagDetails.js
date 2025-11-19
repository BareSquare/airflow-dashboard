import {
  fetchFromAirflow,
  handleFunctionError,
  jsonResponse
} from './utils/airflowClient.js';

export const handler = async (event) => {
  try {
    const dagId =
      event.queryStringParameters?.dagId ||
      event.queryStringParameters?.dag_id;

    if (!dagId) {
      return jsonResponse(400, { error: 'dagId is required' });
    }

    const data = await fetchFromAirflow(`dags/${encodeURIComponent(dagId)}`);
    return jsonResponse(200, data);
  } catch (error) {
    return handleFunctionError(error);
  }
};
