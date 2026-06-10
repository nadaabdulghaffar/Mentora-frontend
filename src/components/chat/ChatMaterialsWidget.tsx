import { memo } from 'react';
import { ExternalLink, FileText, Video, Link2 } from 'lucide-react';
import type { ChatMaterialItem } from '../../services/chatService';

interface ChatMaterialsWidgetProps {
  materials: ChatMaterialItem[];
}

export const ChatMaterialsWidget = memo(function ChatMaterialsWidget({ materials }: ChatMaterialsWidgetProps) {
  if (!materials || materials.length === 0) return null;

  return (
    <div className="mt-2 ml-12 max-w-[85%]">
      <div className="flex flex-col gap-3">
        {materials.map((item, idx) => {
          const Icon = item.kind?.toLowerCase().includes('video') ? Video : 
                       item.kind?.toLowerCase().includes('docs') ? FileText : Link2;

          return (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon size={16} />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-primary leading-tight">
                    {item.title}
                  </span>
                </div>
                <ExternalLink size={16} className="shrink-0 text-gray-400 group-hover:text-primary" />
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                {item.source && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {item.source}
                  </span>
                )}
                {item.reason && (
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {item.reason}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
});
