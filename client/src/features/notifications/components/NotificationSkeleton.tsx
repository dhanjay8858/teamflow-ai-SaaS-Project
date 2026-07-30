import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-900/40 animate-pulse border border-zinc-800/40">
          <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-zinc-800 rounded" />
            <div className="h-2 w-1/2 bg-zinc-800/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
