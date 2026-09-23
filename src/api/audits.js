import apiClient from './client';

/**
 * Fetch audit trail events for an issue.
 * @param {string} issueId
 * @returns {Promise<Array>}
 */
export async function getIssueAudits(issueId) {
  const response = await apiClient.get(`/issues/${issueId}/audits`);
  return response.data;
}
