import apiClient from './client';

/**
 * Fetch modules list from backend.
 * @param {object} params - optional projectId filter
 */
export async function getModules(params = {}) {
  const response = await apiClient.get('/modules', { params: { size: 100, active: true, ...params } });
  return response.data;
}
