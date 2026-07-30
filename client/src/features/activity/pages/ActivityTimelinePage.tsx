import React, { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { ActivityFilters } from '../components/ActivityFilters';
import { ActivityList } from '../components/ActivityList';
import { DomainEventType, ActivityEntityType } from '../../../types/activity';
import { History, Layers, Building2 } from 'lucide-react';

export const ActivityTimelinePage: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const { useWorkspaceActivity, useOrganizationActivity } = useActivity();

  const [activeTab, setActiveTab] = useState<'workspace' | 'organization'>('workspace');
  const [page, setPage] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState<DomainEventType | undefined>(undefined);
  const [selectedEntityType, setSelectedEntityType] = useState<ActivityEntityType | undefined>(undefined);

  const wsQueryResult = useWorkspaceActivity({
    page,
    limit: 15,
    eventType: selectedEventType,
    entityType: selectedEntityType,
  });

  const orgQueryResult = useOrganizationActivity({
    page,
    limit: 15,
    eventType: selectedEventType,
    entityType: selectedEntityType,
  });

  const activeQueryResult = activeTab === 'workspace' ? wsQueryResult : orgQueryResult;
  const activities = activeQueryResult.data?.data?.activities || [];
  const pagination = activeQueryResult.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="h-6 w-6 text-amber-400" />
            <span>Activity Timeline</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time domain events and audit logs for <strong className="text-purple-400">{currentWorkspace.name}</strong>
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#0e0e12] border border-zinc-800 text-xs">
          <button
            onClick={() => {
              setActiveTab('workspace');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'workspace'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Workspace Activity</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('organization');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'organization'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Organization Wide</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <ActivityFilters
        selectedEventType={selectedEventType}
        selectedEntityType={selectedEntityType}
        onEventTypeChange={(type) => {
          setSelectedEventType(type);
          setPage(1);
        }}
        onEntityTypeChange={(type) => {
          setSelectedEntityType(type);
          setPage(1);
        }}
        onReset={() => {
          setSelectedEventType(undefined);
          setSelectedEntityType(undefined);
          setPage(1);
        }}
      />

      {/* Activity Timeline List */}
      <ActivityList
        activities={activities}
        isLoading={activeQueryResult.isLoading}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};
