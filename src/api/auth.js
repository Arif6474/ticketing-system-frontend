import apiClient from './client';

/**
 * Login user with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, tokenType: string, user: object }>}
 */
export async function loginApi(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Fetch current authenticated user profile.
 * @returns {Promise<object>}
 */
export async function getMeApi() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * Change current user password.
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function changePasswordApi(data) {
  const response = await apiClient.post('/auth/change-password', data);
  return response.data;
}

/**
 * Request password reset token by email.
 * @param {{ email: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPasswordApi(data) {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
}

/**
 * Reset password using token and new password.
 * @param {{ token: string, newPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function resetPasswordApi(data) {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
}
