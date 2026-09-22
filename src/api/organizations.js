import apiClient from './client';

/**
 * Get client organizations list.
 * @param {object} params
 */
export async function getOrganizations(params = {}) {
  const response = await apiClient.get('/organizations', { params: { size: 100, ...params } });
  return response.data;
}

/**
 * Get single organization details.
 * @param {string} id
 */
export async function getOrganization(id) {
  const response = await apiClient.get(`/organizations/${id}`);
  return response.data;
}
