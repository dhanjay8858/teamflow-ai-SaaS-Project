import React from 'react';
import { ActivityItem, ActivityEntityType } from '../../../types/activity';
import {
  Building2,
  Layers,
  Users,
  Mail,
  UserCheck,
  ShieldAlert,
  Clock,
  User as UserIcon,
} from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityItem;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getEntityIcon = (entityType: ActivityEntityType) => {
    switch (entityType) {
      case ActivityEntityType.ORGANIZATION:
        return <Building2 className="h-4 w-4 text-indigo-400" />;
      case ActivityEntityType.WORKSPACE:
        return <Layers className="h-4 w-4 text-purple-400" />;
      case ActivityEntityType.MEMBERSHIP:
        return <Users className="h-4 w-4 text-emerald-400" />;
      case ActivityEntityType.INVITATION:
        return <Mail className="h-4 w-4 text-sky-400" />;
      case ActivityEntityType.AUTHENTICATION:
        return <UserCheck className="h-4 w-4 text-amber-400" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#0e0e12] border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
        {getEntityIcon(activity.entityType)}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-white truncate">{activity.title}</h4>
          <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {new Date(activity.createdAt).toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-zinc-300">{activity.description}</p>

        <div className="pt-2 flex items-center gap-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
              {activity.user.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-2.5 w-2.5 text-zinc-400" />
              )}
            </div>
            <span className="font-medium text-zinc-300">{activity.user.name}</span>
          </div>

          <span className="text-zinc-600">•</span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono text-[10px]">
            {activity.entityType}
          </span>
        </div>
      </div>
    </div>
  );
};
