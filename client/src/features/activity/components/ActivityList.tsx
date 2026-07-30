import React from 'react';
import { ActivityItem } from '../../../types/activity';
import { ActivityCard } from './ActivityCard';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityListProps {
  activities: ActivityItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  isLoading,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl">
        Loading activity log timeline...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500 bg-[#0e0e12] border border-zinc-800 rounded-2xl space-y-2">
        <History className="h-8 w-8 text-zinc-600 mx-auto" />
        <p>No activity log entries recorded matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
          <span className="text-zinc-500 font-mono">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
