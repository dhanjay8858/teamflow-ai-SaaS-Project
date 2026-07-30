import React, { useState, useEffect } from 'react';
import {
  Bot,
  Play,
  CheckCircle,
  XCircle,
  Sparkles,
  Brain,
  History,
  ShieldCheck,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { apiClient } from '../../../config/api.client';
import { AuthApiResponse } from '../../../types/auth';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { MarkdownRenderer } from '../../ai/components/MarkdownRenderer';

export interface AgentItem {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  supportedGoals: string[];
}

export const AIHub: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('scrum-master-agent');
  const [goalInput, setGoalInput] = useState<string>('Generate 2-week sprint planning allocation and velocity assessment');
  const [isMultiAgent, setIsMultiAgent] = useState<boolean>(false);
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await apiClient.get<unknown, AuthApiResponse<AgentItem[]>>('/agents');
      if (res.success && res.data) {
        setAgents(res.data);
      }
    } catch {
      // Fallback local agents list if offline
      setAgents([
        { id: 'scrum-master-agent', name: 'ScrumMaster Agent', description: 'Sprint planning & retrospectives', category: 'SCRUM_MASTER', version: '1.0.0', supportedGoals: [] },
        { id: 'project-manager-agent', name: 'ProjectManager Agent', description: 'Milestones & roadmap risk', category: 'PROJECT_MANAGER', version: '1.0.0', supportedGoals: [] },
        { id: 'qa-agent', name: 'QA Engineer Agent', description: 'Test cases & acceptance criteria', category: 'QA_ENGINEER', version: '1.0.0', supportedGoals: [] },
        { id: 'technical-writer-agent', name: 'TechnicalWriter Agent', description: 'Release notes & docs', category: 'TECHNICAL_WRITER', version: '1.0.0', supportedGoals: [] },
        { id: 'release-manager-agent', name: 'ReleaseManager Agent', description: 'Deployment readiness checklist', category: 'RELEASE_MANAGER', version: '1.0.0', supportedGoals: [] },
        { id: 'knowledge-agent', name: 'Knowledge Agent', description: 'Workspace architecture search', category: 'KNOWLEDGE_ENGINEER', version: '1.0.0', supportedGoals: [] },
      ]);
    }
  };

  const handleRun = async () => {
    if (!currentWorkspace || !goalInput.trim()) return;
    setIsLoading(true);
    setExecutionResult(null);
    setApprovalStatus('');

    try {
      const res = await apiClient.post<unknown, AuthApiResponse<any>>('/agents/run', {
        agentId: selectedAgentId,
        workspaceId: currentWorkspace._id,
        goal: goalInput,
        requireApproval,
        delegations: isMultiAgent
          ? ['project-manager-agent', 'scrum-master-agent', 'qa-agent', 'release-manager-agent']
          : undefined,
      });

      if (res.success && res.data) {
        setExecutionResult(res.data);
      }
    } catch (err: any) {
      setExecutionResult({
        output: `Execution Error: ${err?.message || 'Agent runtime error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAction = async (approved: boolean) => {
    if (!executionResult) return;
    try {
      const endpoint = approved ? '/agents/approve' : '/agents/reject';
      await apiClient.post(endpoint, { executionId: executionResult.executionId });
      setApprovalStatus(approved ? 'APPROVED' : 'REJECTED');
    } catch (err: any) {
      alert(err.message || 'Approval request failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Multi-Agent Orchestration Hub
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                v12.0
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Autonomous specialized agents for TeamFlow AI</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Autonomous Agent</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  selectedAgentId === agent.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{agent.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {agent.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{agent.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Goal Execution & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Goal Input Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
              <Brain size={14} className="text-purple-400" /> Goal Execution Parameters
            </h3>

            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Enter goal for the agent..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isMultiAgent}
                    onChange={(e) => setIsMultiAgent(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-0"
                  />
                  <GitBranch size={13} className="text-indigo-400" /> Multi-Agent Delegation
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-0"
                  />
                  <ShieldCheck size={13} className="text-emerald-400" /> Human Approval
                </label>
              </div>

              <button
                onClick={handleRun}
                disabled={isLoading || !goalInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                <span>{isLoading ? 'Executing...' : 'Run Agent'}</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 animate-pulse">
              <RefreshCw size={14} className="animate-spin text-indigo-400" />
              <span>Orchestrating agent workflow & gathering Hybrid RAG telemetry…</span>
            </div>
          )}

          {/* Execution Result */}
          {executionResult && !isLoading && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} /> Agent Execution Output ({executionResult.agentId})
                </span>

                {executionResult.reflection && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Confidence: {Math.round((executionResult.reflection.confidenceScore || 0.9) * 100)}%
                  </span>
                )}
              </div>

              {/* Multi-Agent Delegation Graph */}
              {executionResult.delegationGraph && (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                  <GitBranch size={13} className="text-indigo-400 shrink-0" />
                  <span className="font-semibold">Delegation Pipeline:</span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-300">
                    {executionResult.delegationGraph.map((item: string, idx: number) => (
                      <span key={item}>
                        {idx > 0 && ' ➔ '}
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Approval Status Banner */}
              {requireApproval && !approvalStatus && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-medium">
                    ⚠️ Plan requires human approval before destructive execution.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveAction(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleApproveAction(false)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[11px]"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {approvalStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    approvalStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  Human Approval Status: {approvalStatus}
                </div>
              )}

              {/* Markdown Content */}
              <MarkdownRenderer content={executionResult.output || 'No output generated'} />

              {/* Reflection Panel */}
              {executionResult.reflection && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs text-zinc-400">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <History size={11} /> Agent Reflection Engine
                  </span>
                  <p>{executionResult.reflection.reflectionSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
