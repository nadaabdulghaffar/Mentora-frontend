import type { ProfileRole } from '../../pages/profile/types';

type MentorTab = 'overview' | 'activity' | 'reviews';
type MenteeTab = 'overview' | 'activity';

interface ProfileTabsProps {
  role: ProfileRole;
  active: MentorTab | MenteeTab;
  onChange: (tab: MentorTab | MenteeTab) => void;
}

const MENTOR_TABS: { id: MentorTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'reviews', label: 'Reviews' },
];

const MENTEE_TABS: { id: MenteeTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
];

export function ProfileTabs({ role, active, onChange }: ProfileTabsProps) {
  const tabs = role === 'mentor' ? MENTOR_TABS : MENTEE_TABS;

  return (
    <nav className="mb-6 flex gap-8 border-b border-[#E4E7EF] overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 pb-3 text-sm font-semibold transition ${
              isActive ? 'text-primary' : 'text-[#8B92A8] hover:text-[#5C6378]'
            }`}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
