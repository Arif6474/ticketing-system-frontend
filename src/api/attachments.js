import apiClient from './client';

/**
 * Fetch all attachments for a given issue.
 * @param {string} issueId
 * @returns {Promise<Array>}
 */
export async function getIssueAttachments(issueId) {
  const response = await apiClient.get(`/issues/${issueId}/attachments`);
  return response.data;
}

/**
 * Upload a file attachment to an issue.
 * @param {string} issueId
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function uploadAttachment(issueId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/issues/${issueId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Generate download URL for an attachment.
 * @param {string} issueId
 * @param {string} attachmentId
 * @returns {Promise<{ attachment: object, downloadUrl: string }>}
 */
export async function downloadAttachment(issueId, attachmentId) {
  const response = await apiClient.get(`/issues/${issueId}/attachments/${attachmentId}/download`);
  return response.data;
}

/**
 * Delete an attachment from an issue.
 * @param {string} issueId
 * @param {string} attachmentId
 * @returns {Promise<object>}
 */
export async function deleteAttachment(issueId, attachmentId) {
  const response = await apiClient.delete(`/issues/${issueId}/attachments/${attachmentId}`);
  return response.data;
}
