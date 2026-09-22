import apiClient from './client';

/**
 * Get paginated issues with search and filter parameters.
 * @param {object} params - Query params (page, size, search, projectId, moduleId, type, priority, stage, verificationStatus, reporterId)
 */
export async function getIssues(params = {}) {
  const response = await apiClient.get('/issues', { params });
  return response.data;
}

/**
 * Get single issue by ID.
 * @param {string} id - Issue UUID
 */
export async function getIssue(id) {
  const response = await apiClient.get(`/issues/${id}`);
  return response.data;
}

/**
 * Create a new issue.
 * @param {{ title: string, description: string, type: string, priority: string, projectId: string, moduleId?: string }} data
 */
export async function createIssue(data) {
  const response = await apiClient.post('/issues', data);
  return response.data;
}

/**
 * Update an existing issue details.
 * @param {string} id - Issue UUID
 * @param {{ title: string, description: string, type: string, priority: string, moduleId?: string }} data
 */
export async function updateIssue(id, data) {
  const response = await apiClient.put(`/issues/${id}`, data);
  return response.data;
}

/**
 * Transition an issue's stage.
 * @param {string} id - Issue UUID
 * @param {string} stage - Target stage name (e.g. SUBMITTED, RECEIVED, UNDER_DEVELOPMENT, etc.)
 */
export async function updateIssueStage(id, stage) {
  const response = await apiClient.patch(`/issues/${id}/stage`, { stage });
  return response.data;
}

/**
 * Delete an issue by ID.
 * @param {string} id - Issue UUID
 */
export async function deleteIssue(id) {
  const response = await apiClient.delete(`/issues/${id}`);
  return response.data;
}
