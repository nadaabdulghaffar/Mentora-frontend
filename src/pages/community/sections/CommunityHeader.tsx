/**
 * CommunityHeader Section Component
 * Header with tabs navigation and create post button
 */

import React from 'react';

export type CommunityTab = 'discussion' | 'members' | 'media' | 'files';

interface CommunityHeaderSectionProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
}

const TAB_CONFIG: { id: CommunityTab; label: string }[] = [
  { id: 'discussion', label: 'Discussion' },
  { id: 'members', label: 'Members' },
];

/**
 * CommunityHeaderSection - Header with tab navigation
 * Features:
 * - Tab navigation
 * - Create post button
 * - Community title
 * - Responsive layout
 */
export const CommunityHeaderSection: React.FC<CommunityHeaderSectionProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div>
      <div className="overflow-x-auto border-b border-gray-200">
        <div className="flex gap-8">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
