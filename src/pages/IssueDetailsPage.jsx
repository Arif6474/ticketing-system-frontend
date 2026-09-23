import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getIssue, deleteIssue, updateIssueStage } from '../api/issues';
import { updateVerificationStatus } from '../api/verification';
import { getIssueComments, createComment, updateComment, deleteComment } from '../api/comments';
import { getIssueAttachments, uploadAttachment, downloadAttachment, deleteAttachment } from '../api/attachments';
import { getIssueAudits } from '../api/audits';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const STAGE_OPTIONS = [
  'SUBMITTED',
  'RECEIVED',
  'UNDER_DEVELOPMENT',
  'TESTING',
  'DEPLOYED',
  'DECLINED',
  'RESOLVED',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
const FORBIDDEN_EXTENSIONS = ['exe', 'sh', 'bat', 'cmd', 'dll', 'so', 'dylib', 'py', 'js', 'vbs', 'jar', 'bin', 'com', 'msi'];

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateAttachmentFile(file) {
  if (!file) return 'Please select a file to upload.';
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds maximum allowed limit of 10 MB.';
  }
  const fileExt = file.name.split('.').pop().toLowerCase();
  if (FORBIDDEN_EXTENSIONS.includes(fileExt)) {
    return 'Executable file extensions are strictly forbidden.';
  }
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, PDF, Plain Text.`;
  }
  return null;
}

export function IssueDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [updatingVerification, setUpdatingVerification] = useState(false);

  // Comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  const canVerify = user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN';

  // Fetch issue details
  const {
    data: issue,
    isLoading,
    isError,
    error,
    refetch: refetchIssue,
  } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => getIssue(id),
    enabled: Boolean(id),
  });

  // Fetch issue comments
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    isError: isErrorComments,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getIssueComments(id),
    enabled: Boolean(id),
  });

  // Fetch issue attachments
  const {
    data: attachments = [],
    isLoading: isLoadingAttachments,
    isError: isErrorAttachments,
    error: attachmentsError,
    refetch: refetchAttachments,
  } = useQuery({
    queryKey: ['attachments', id],
    queryFn: () => getIssueAttachments(id),
    enabled: Boolean(id),
  });

  // Fetch issue audit history
  const {
    data: audits = [],
    isLoading: isLoadingAudits,
    isError: isErrorAudits,
    refetch: refetchAudits,
  } = useQuery({
    queryKey: ['audits', id],
    queryFn: () => getIssueAudits(id),
    enabled: Boolean(id),
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    setActionError('');
    setSuccessMsg('');
    try {
      await deleteIssue(id);
      navigate('/issues');
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete issue.');
    }
  };

  const handleStageChange = async (newStage) => {
    if (!newStage || newStage === issue.stage) return;
    setUpdatingStage(true);
    setActionError('');
    setSuccessMsg('');
    try {
      await updateIssueStage(id, newStage);
      setSuccessMsg(`Issue stage updated to ${newStage.replace(/_/g, ' ')}.`);
      refetchIssue();
      refetchAudits();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update issue stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleVerificationDecision = async (status) => {
    if (status === 'REJECTED') {
      if (!window.confirm('Are you sure you want to REJECT verification for this issue?')) {
        return;
      }
    }
    setUpdatingVerification(true);
    setActionError('');
    setSuccessMsg('');
    try {
      await updateVerificationStatus(id, status);
      setSuccessMsg(`Verification status updated to ${status}.`);
      refetchIssue();
      refetchAudits();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update verification status.');
    } finally {
      setUpdatingVerification(false);
    }
  };

  // Comment Handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    const trimmed = newCommentText.trim();
    if (!trimmed) {
      setCommentError('Comment text cannot be empty.');
      return;
    }
    if (trimmed.length > 10000) {
      setCommentError('Comment text cannot exceed 10000 characters.');
      return;
    }

    setCommentSubmitting(true);
    try {
      await createComment(id, { content: trimmed });
      setNewCommentText('');
      refetchComments();
      refetchAudits();
    } catch (err) {
      setCommentError(err.response?.data?.message || err.message || 'Failed to add comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content || '');
    setCommentError('');
  };

  const handleSaveEditComment = async (commentId) => {
    setCommentError('');
    const trimmed = editingCommentText.trim();
    if (!trimmed) {
      setCommentError('Comment text cannot be empty.');
      return;
    }
    if (trimmed.length > 10000) {
      setCommentError('Comment text cannot exceed 10000 characters.');
      return;
    }

    try {
      await updateComment(id, commentId, { content: trimmed });
      setEditingCommentId(null);
      setEditingCommentText('');
      refetchComments();
      refetchAudits();
    } catch (err) {
      setCommentError(err.response?.data?.message || err.message || 'Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    setCommentError('');
    try {
      await deleteComment(id, commentId);
      refetchComments();
      refetchAudits();
    } catch (err) {
      setCommentError(err.response?.data?.message || err.message || 'Failed to delete comment.');
    }
  };

  // Attachment Handlers
  const handleFileSelect = (e) => {
    setAttachmentError('');
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const valErr = validateAttachmentFile(file);
    if (valErr) {
      setAttachmentError(valErr);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setAttachmentError('Please select a valid file first.');
      return;
    }
    const valErr = validateAttachmentFile(selectedFile);
    if (valErr) {
      setAttachmentError(valErr);
      return;
    }

    setAttachmentUploading(true);
    setAttachmentError('');
    try {
      await uploadAttachment(id, selectedFile);
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('attachment-file-input');
      if (fileInput) fileInput.value = '';
      refetchAttachments();
      refetchAudits();
    } catch (err) {
      setAttachmentError(err.response?.data?.message || err.message || 'Failed to upload attachment.');
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const res = await downloadAttachment(id, attachmentId);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Download URL is unavailable.');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to download attachment.');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }
    setAttachmentError('');
    try {
      await deleteAttachment(id, attachmentId);
      refetchAttachments();
      refetchAudits();
    } catch (err) {
      setAttachmentError(err.response?.data?.message || err.message || 'Failed to delete attachment.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading issue details..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Error Loading Issue"
        message={error?.message || 'Failed to load issue details.'}
        onRetry={refetchIssue}
      />
    );
  }

  if (!issue) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-300">Issue not found.</p>
        <div className="mt-4">
          <Link to="/issues">
            <Button variant="secondary">Back to Issues</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link
            to="/issues"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 mb-2"
          >
            &larr; Back to Issues
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">{issue.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/issues/${id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit Issue
            </Button>
          </Link>

          {(user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN') && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Issue
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          {actionError}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Comments, Attachments, Audits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans">
                {issue.description}
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachmentError && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                  {attachmentError}
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={handleUploadAttachment} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <input
                  id="attachment-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={attachmentUploading}
                  className="flex-1 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={attachmentUploading}
                  disabled={!selectedFile || attachmentUploading}
                >
                  Upload Attachment
                </Button>
              </form>
              <p className="text-[11px] text-slate-500 font-mono">
                Supported types: JPG, PNG, WebP, PDF, TXT (Max size: 10 MB)
              </p>

              {/* Attachments List */}
              {isLoadingAttachments ? (
                <LoadingSpinner message="Loading attachments..." />
              ) : isErrorAttachments ? (
                <div className="text-xs text-rose-400 font-mono">
                  Failed to load attachments: {attachmentsError?.message || 'Server error'}
                </div>
              ) : attachments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No attachments uploaded for this issue.</p>
              ) : (
                <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
                  {attachments.map((att) => {
                    const isUploader = att.uploadedBy?.id === user?.id || user?.role === 'APP_ADMIN' || user?.role === 'CLIENT_ADMIN';
                    return (
                      <div key={att.id} className="p-3 bg-slate-900/50 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-200 truncate">
                              {att.originalFilename}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400 border border-slate-700">
                              {formatFileSize(att.fileSize)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-x-3">
                            <span>Uploaded by: <strong className="text-slate-400 font-normal">{att.uploadedBy?.name || 'Unknown'}</strong></span>
                            <span>{att.createdAt ? new Date(att.createdAt).toLocaleString() : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadAttachment(att.id)}
                          >
                            Download
                          </Button>
                          {isUploader && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteAttachment(att.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {commentError && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                  {commentError}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={commentSubmitting}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs p-3 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={commentSubmitting}
                    disabled={commentSubmitting || !newCommentText.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              {isLoadingComments ? (
                <LoadingSpinner message="Loading comments..." />
              ) : isErrorComments ? (
                <div className="text-xs text-rose-400 font-mono">
                  Failed to load comments: {commentsError?.message || 'Server error'}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const isAuthor = comment.author?.id === user?.id || user?.role === 'APP_ADMIN';
                    const isEditing = editingCommentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {comment.author?.name || 'Anonymous'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                              {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                            </span>
                          </div>

                          {isAuthor && !isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditComment(comment)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={3}
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs p-2.5 focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingCommentId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleSaveEditComment(comment.id)}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit / Timeline Section */}
          <Card>
            <CardHeader>
              <CardTitle>Activity & Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAudits ? (
                <LoadingSpinner message="Loading audit history..." />
              ) : isErrorAudits ? (
                <div className="text-xs text-rose-400 font-mono">
                  Failed to load audit history.
                </div>
              ) : audits.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No activity records logged for this issue.</p>
              ) : (
                <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-4 my-2">
                  {audits.map((audit) => (
                    <div key={audit.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-slate-900" />
                      <div className="flex flex-wrap items-center gap-x-2 text-slate-300 font-mono">
                        <span className="font-semibold text-indigo-400">{audit.action}</span>
                        <span className="text-slate-400">by {audit.actor?.name || 'System'}</span>
                        <span className="text-[11px] text-slate-500">
                          {audit.createdAt ? new Date(audit.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      {(audit.fieldName || audit.oldValue || audit.newValue) && (
                        <div className="mt-1 text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800/80 font-mono">
                          {audit.fieldName && <span className="text-slate-300 font-medium">{audit.fieldName}: </span>}
                          {audit.oldValue && <span className="text-rose-400/80 line-through mr-1">{audit.oldValue}</span>}
                          {audit.oldValue && audit.newValue && <span className="text-slate-500">&rarr; </span>}
                          {audit.newValue && <span className="text-emerald-400/90">{audit.newValue}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Metadata & Stage Transition */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Type
                </span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-slate-200">
                  {issue.type}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Priority
                </span>
                <span
                  className={`px-2 py-1 rounded font-mono font-semibold ${
                    issue.priority === 'URGENT' || issue.priority === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {issue.priority}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Current Stage
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-mono">
                    {issue.stage?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Change Stage
                </span>
                <select
                  value={issue.stage || ''}
                  disabled={updatingStage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {STAGE_OPTIONS.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Verification Status
                </span>
                <div className="flex flex-col gap-2">
                  <div>
                    <span
                      className={`px-2 py-1 rounded font-mono ${
                        issue.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : issue.verificationStatus === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {issue.verificationStatus}
                    </span>
                  </div>

                  {canVerify && issue.verificationStatus === 'PENDING_VERIFICATION' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        disabled={updatingVerification}
                        onClick={() => handleVerificationDecision('VERIFIED')}
                        className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Verify Issue
                      </button>
                      <button
                        disabled={updatingVerification}
                        onClick={() => handleVerificationDecision('REJECTED')}
                        className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reject Issue
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Project
                  </span>
                  <span className="text-slate-200 font-medium">{issue.projectName || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Module
                  </span>
                  <span className="text-slate-200 font-medium">{issue.moduleName || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Reporter
                  </span>
                  <span className="text-slate-200 font-medium">{issue.reporterName || issue.reporterEmail || '—'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Created At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : '—'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase text-slate-500">
                    Updated At
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default IssueDetailsPage;
