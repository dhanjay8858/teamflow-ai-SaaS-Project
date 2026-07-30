import React from 'react';

interface RelativeTimeProps {
  dateString: string;
  className?: string;
}

export const RelativeTime: React.FC<RelativeTimeProps> = ({ dateString, className = '' }) => {
  const getRelativeTime = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 30) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <span className={`text-[10px] text-zinc-500 font-mono ${className}`}>
      {getRelativeTime(dateString)}
    </span>
  );
};
