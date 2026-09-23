import apiClient from './client';

/**
 * Fetch all comments for a given issue.
 * @param {string} issueId
 * @returns {Promise<Array>}
 */
export async function getIssueComments(issueId) {
  const response = await apiClient.get(`/issues/${issueId}/comments`);
  return response.data;
}

/**
 * Create a new comment on an issue.
 * @param {string} issueId
 * @param {{ content: string }} data
 * @returns {Promise<object>}
 */
export async function createComment(issueId, data) {
  const response = await apiClient.post(`/issues/${issueId}/comments`, data);
  return response.data;
}

/**
 * Update an existing comment on an issue.
 * @param {string} issueId
 * @param {string} commentId
 * @param {{ content: string }} data
 * @returns {Promise<object>}
 */
export async function updateComment(issueId, commentId, data) {
  const response = await apiClient.put(`/issues/${issueId}/comments/${commentId}`, data);
  return response.data;
}

/**
 * Delete a comment from an issue.
 * @param {string} issueId
 * @param {string} commentId
 * @returns {Promise<object>}
 */
export async function deleteComment(issueId, commentId) {
  const response = await apiClient.delete(`/issues/${issueId}/comments/${commentId}`);
  return response.data;
}
