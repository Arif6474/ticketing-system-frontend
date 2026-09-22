import apiClient from './client';

/**
 * Fetch projects list from backend.
 * @param {object} params
 */
export async function getProjects(params = {}) {
  const response = await apiClient.get('/projects', { params: { size: 100, active: true, ...params } });
  return response.data;
}
