import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getIssues, updateIssueStage } from '../api/issues';
import { getProjects } from '../api/projects';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const KANBAN_STAGES = [
  'SUBMITTED',
  'RECEIVED',
  'UNDER_DEVELOPMENT',
  'TESTING',
  'DEPLOYED',
  'DECLINED',
  'RESOLVED',
];

const ISSUE_TYPES = ['BUG', 'ENHANCEMENT', 'NEW_FEATURE'];
const ISSUE_PRIORITIES = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STAGE_COLORS = {
  SUBMITTED: 'border-t-slate-500',
  RECEIVED: 'border-t-blue-500',
  UNDER_DEVELOPMENT: 'border-t-amber-500',
  TESTING: 'border-t-purple-500',
  DEPLOYED: 'border-t-emerald-500',
  DECLINED: 'border-t-rose-500',
  RESOLVED: 'border-t-teal-500',
};

export function IssueKanbanPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');

  const [updatingIssueId, setUpdatingIssueId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [draggedIssueId, setDraggedIssueId] = useState(null);

  // Fetch projects for filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ page: 0, size: 100 }),
  });

  // Fetch all matching issues for Kanban board
  const {
    data: issuesPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['kanban-issues', { search, projectId, priority, type }],
    queryFn: () =>
      getIssues({
        page: 0,
        size: 200,
        search: search || undefined,
        projectId: projectId || undefined,
        priority: priority || undefined,
        type: type || undefined,
      }),
  });

  const projects = projectsData?.content || [];
  const issues = issuesPage?.content || [];

  const handleStageChange = async (issueId, targetStage) => {
    if (!issueId || !targetStage) return;
    const currentIssue = issues.find((i) => i.id === issueId);
    if (currentIssue?.stage === targetStage) return;

    setUpdatingIssueId(issueId);
    setActionError('');

    try {
      await updateIssueStage(issueId, targetStage);
      await refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          `Failed to transition issue stage to ${targetStage.replace(/_/g, ' ')}.`
      );
    } finally {
      setUpdatingIssueId(null);
      setDraggedIssueId(null);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, issueId) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      handleStageChange(issueId, targetStage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Issue Kanban Board</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualize issue workflow, track stages, and manage defect lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/issues">
            <Button variant="secondary" size="sm">
              &larr; Table View
            </Button>
          </Link>
          <Link to="/issues/new">
            <Button variant="primary" size="sm">
              + Create Issue
            </Button>
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError('')}
            className="text-rose-400 hover:text-rose-200 ml-2 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <Input
            placeholder="Search title or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Project Filter */}
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main Board View */}
      {isLoading && <LoadingSpinner message="Loading Kanban board..." />}

      {isError && (
        <ErrorMessage
          title="Error Loading Kanban Board"
          message={error?.message || 'Could not fetch issues for Kanban view.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[600px] scrollbar-thin">
          {KANBAN_STAGES.map((stg) => {
            const columnIssues = issues.filter((i) => i.stage === stg);
            return (
              <div
                key={stg}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stg)}
                className={`w-72 shrink-0 rounded-xl bg-slate-900/90 border border-slate-800/80 border-t-4 ${
                  STAGE_COLORS[stg] || 'border-t-slate-600'
                } flex flex-col max-h-[750px] shadow-lg`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
                    {stg.replace(/_/g, ' ')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700 font-semibold">
                    {columnIssues.length}
                  </span>
                </div>

                {/* Column Content Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto flex-1 min-h-[150px]">
                  {columnIssues.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-[11px] text-slate-500 italic">
                      No issues in {stg.replace(/_/g, ' ')}
                    </div>
                  ) : (
                    columnIssues.map((issue) => {
                      const isUpdatingThis = updatingIssueId === issue.id;
                      return (
                        <div
                          key={issue.id}
                          draggable={!isUpdatingThis}
                          onDragStart={(e) => handleDragStart(e, issue.id)}
                          className={`p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group relative cursor-grab active:cursor-grabbing ${
                            isUpdatingThis ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {/* Card Top: Type & Priority */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono">
                              {issue.type}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                                issue.priority === 'URGENT' || issue.priority === 'HIGH'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}
                            >
                              {issue.priority}
                            </span>
                          </div>

                          {/* Card Title Link */}
                          <Link
                            to={`/issues/${issue.id}`}
                            className="text-xs font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 block mb-2"
                          >
                            {issue.title}
                          </Link>

                          {/* Details Metadata */}
                          <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-900 font-sans">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Project:</span>
                              <span className="text-slate-300 font-medium truncate max-w-[140px]">
                                {issue.projectName || '—'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Reporter:</span>
                              <span className="text-slate-400 truncate max-w-[140px]">
                                {issue.reporterName || issue.reporterEmail || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Verification Status & Stage Selector */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                issue.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : issue.verificationStatus === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {issue.verificationStatus}
                            </span>

                            {/* Quick Stage selector dropdown */}
                            <select
                              value={issue.stage}
                              disabled={isUpdatingThis}
                              onChange={(e) => handleStageChange(issue.id, e.target.value)}
                              className="rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          {isUpdatingThis && (
                            <div className="absolute inset-0 bg-slate-950/70 rounded-lg flex items-center justify-center text-[11px] font-mono text-indigo-400">
                              Updating stage...
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IssueKanbanPage;
