import apiClient from './client';

/**
 * Get paginated projects with optional search, active status, and organization filters.
 * @param {object} params
 */
export async function getProjects(params = {}) {
  const response = await apiClient.get('/projects', { params });
  return response.data;
}

/**
 * Get single project by ID.
 * @param {string} id
 */
export async function getProject(id) {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
}

/**
 * Create a new project.
 * @param {{ name: string, shortCode: string, description?: string, organizationId: string }} data
 */
export async function createProject(data) {
  const response = await apiClient.post('/projects', data);
  return response.data;
}

/**
 * Update project details.
 * @param {string} id
 * @param {{ name: string, shortCode: string, description?: string, active?: boolean }} data
 */
export async function updateProject(id, data) {
  const response = await apiClient.put(`/projects/${id}`, data);
  return response.data;
}

/**
 * Delete a project by ID.
 * @param {string} id
 */
export async function deleteProject(id) {
  const response = await apiClient.delete(`/projects/${id}`);
  return response.data;
}
