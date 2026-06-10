import { memo } from 'react';
import type { ChatStatItem } from '../../services/chatService';

interface ChatStatsWidgetProps {
  stats: ChatStatItem[];
}

export const ChatStatsWidget = memo(function ChatStatsWidget({ stats }: ChatStatsWidgetProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="mt-2 ml-12 max-w-[85%]">
      <div className="flex flex-col gap-2">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50">
            <span className="text-xs font-bold text-gray-800">{stat.label}</span>
            <span className="mt-1 text-sm font-medium text-gray-500">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
