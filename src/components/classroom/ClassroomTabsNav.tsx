import type { Dispatch, SetStateAction } from 'react';

export type ClassroomTab = 'classroom' | 'schedule' | 'roadmap' | 'tasks' | 'students';

type ClassroomTabsNavProps = {
  tabs: Array<{ id: ClassroomTab; label: string }>;
  activeTab: ClassroomTab;
  setActiveTab: Dispatch<SetStateAction<ClassroomTab>>;
};

const ClassroomTabsNav = ({ tabs, activeTab, setActiveTab }: ClassroomTabsNavProps) => {
  return (
    <div className="flex flex-wrap gap-5 border-b border-[#E6E9F2] pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`pb-1 text-sm font-medium transition ${
            activeTab === tab.id ? 'border-b-2 border-[#6E56CF] text-[#2A3142]' : 'text-[#7D8498] hover:text-[#2A3142]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ClassroomTabsNav;