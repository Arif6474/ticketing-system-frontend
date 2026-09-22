import apiClient from './client';

/**
 * Get paginated verification queue for pending issues.
 * @param {object} params - Query params (page, size, search, projectId)
 */
export async function getVerificationQueue(params = {}) {
  const response = await apiClient.get('/issues/verification-queue', { params });
  return response.data;
}

/**
 * Update issue verification status.
 * @param {string} id - Issue UUID
 * @param {'VERIFIED'|'REJECTED'} status - Verification decision
 */
export async function updateVerificationStatus(id, status) {
  const response = await apiClient.patch(`/issues/${id}/verification`, { status });
  return response.data;
}
