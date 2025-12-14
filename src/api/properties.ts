import { fetchPropertiesResponseSchema } from 'shared/types/properties';
import { client, handleApiError } from './client';

async function fetchProperties() {
  try {
    const response = await client.get('/properties');
    return fetchPropertiesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProperties');
  }
}

export { fetchProperties };
