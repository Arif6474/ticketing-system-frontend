import apiClient from './client';

/**
 * Get paginated modules list with search, active, and project filters.
 * @param {object} params
 */
export async function getModules(params = {}) {
  const response = await apiClient.get('/modules', { params });
  return response.data;
}

/**
 * Get single module by ID.
 * @param {string} id
 */
export async function getModule(id) {
  const response = await apiClient.get(`/modules/${id}`);
  return response.data;
}

/**
 * Create a new module.
 * @param {{ projectId: string, name: string, description?: string }} data
 */
export async function createModule(data) {
  const response = await apiClient.post('/modules', data);
  return response.data;
}

/**
 * Update existing module details.
 * @param {string} id
 * @param {{ name: string, description?: string, active?: boolean }} data
 */
export async function updateModule(id, data) {
  const response = await apiClient.put(`/modules/${id}`, data);
  return response.data;
}

/**
 * Delete a module by ID.
 * @param {string} id
 */
export async function deleteModule(id) {
  const response = await apiClient.delete(`/modules/${id}`);
  return response.data;
}

/**
 * Activate a module.
 * @param {string} id
 */
export async function activateModule(id) {
  const response = await apiClient.patch(`/modules/${id}/activate`);
  return response.data;
}

/**
 * Deactivate a module.
 * @param {string} id
 */
export async function deactivateModule(id) {
  const response = await apiClient.patch(`/modules/${id}/deactivate`);
  return response.data;
}
