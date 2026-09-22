import apiClient from '../api/client';

/**
 * Fetch backend application health status.
 * @returns {Promise<{status: string}>}
 */
export async function getHealthStatus() {
  const response = await apiClient.get('/health');
  return response.data;
}
