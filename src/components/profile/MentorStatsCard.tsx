import { Clock, Monitor, Star, Users } from 'lucide-react';
import type { MentorStats } from '../../pages/profile/types';

interface MentorStatsCardProps {
  stats: MentorStats;
}

export function MentorStatsCard({ stats }: MentorStatsCardProps) {
  const rows = [
    { icon: Clock, label: 'Total Hours Mentored', value: stats.hoursMentored, color: 'text-primary' },
    { icon: Users, label: 'Active Mentees', value: stats.activeMentees, color: 'text-orange-500' },
    { icon: Monitor, label: 'Completed Sessions', value: stats.completedSessions, color: 'text-emerald-500' },
    { icon: Star, label: 'Average Rating', value: stats.averageRating, color: 'text-sky-500' },
  ] as const;

  return (
    <aside className="h-fit rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#8B92A8]">Community statistics</p>
      <ul className="space-y-4">
        {rows.map(({ icon: Icon, label, value, color }) => (
          <li key={label} className="flex items-start gap-3 rounded-2xl bg-[#F8F9FD] px-3 py-3">
            <span className={`mt-0.5 ${color}`}>
              <Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-[#1F2533]">{value}</p>
              <p className="mt-1 text-xs font-medium text-[#6B7289]">{label}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
