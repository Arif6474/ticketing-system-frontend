import apiClient from './client';

/**
 * Get paginated users list with optional search, role, active, and organization filters.
 * @param {object} params
 */
export async function getUsers(params = {}) {
  const response = await apiClient.get('/users', { params });
  return response.data;
}

/**
 * Get single user by ID.
 * @param {string} id
 */
export async function getUser(id) {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

/**
 * Create a new user.
 * @param {{ email: string, password: string, firstName: string, lastName: string, mobile?: string, designation?: string, office?: string, role: string, organizationId?: string }} data
 */
export async function createUser(data) {
  const response = await apiClient.post('/users', data);
  return response.data;
}

/**
 * Update an existing user.
 * @param {string} id
 * @param {{ firstName: string, lastName: string, mobile?: string, designation?: string, office?: string, role?: string, organizationId?: string, active?: boolean }} data
 */
export async function updateUser(id, data) {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}

/**
 * Deactivate a user.
 * @param {string} id
 */
export async function deactivateUser(id) {
  const response = await apiClient.patch(`/users/${id}/deactivate`);
  return response.data;
}

/**
 * Hard delete a user by ID.
 * @param {string} id
 */
export async function deleteUser(id) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}

/**
 * Force password reset for a user.
 * @param {string} id
 * @param {string} newPassword
 */
export async function forcePasswordReset(id, newPassword) {
  const response = await apiClient.post(`/users/${id}/force-password-reset`, { newPassword });
  return response.data;
}
