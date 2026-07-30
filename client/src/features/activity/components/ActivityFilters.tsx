import React from 'react';
import { DomainEventType, ActivityEntityType } from '../../../types/activity';
import { Filter, RefreshCcw } from 'lucide-react';

interface ActivityFiltersProps {
  selectedEventType?: DomainEventType;
  selectedEntityType?: ActivityEntityType;
  onEventTypeChange: (eventType?: DomainEventType) => void;
  onEntityTypeChange: (entityType?: ActivityEntityType) => void;
  onReset: () => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  selectedEventType,
  selectedEntityType,
  onEventTypeChange,
  onEntityTypeChange,
  onReset,
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#0e0e12] border border-zinc-800 flex items-center justify-between gap-4 text-xs flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Entity Type Filter */}
        <select
          value={selectedEntityType || ''}
          onChange={(e) => onEntityTypeChange((e.target.value as ActivityEntityType) || undefined)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Entity Types</option>
          {Object.values(ActivityEntityType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Event Type Filter */}
        <select
          value={selectedEventType || ''}
          onChange={(e) => onEventTypeChange((e.target.value as DomainEventType) || undefined)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Event Types</option>
          {Object.values(DomainEventType).map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </div>

      {(selectedEventType || selectedEntityType) && (
        <button
          onClick={onReset}
          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
        >
          <RefreshCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
