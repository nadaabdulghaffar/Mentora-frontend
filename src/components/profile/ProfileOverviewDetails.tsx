import type { ProfileEntity } from '../../pages/profile/types';
import { formatMentorYearsDisplay } from '../../pages/profile/profileService';

interface ProfileOverviewDetailsProps {
  profile: ProfileEntity;
}

function ProfileChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
      {children}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[#1F2533]">{value}</dd>
    </div>
  );
}

function formatExperienceLevelLabel(levelName: string): string {
  const value = levelName.trim();
  if (!value) {
    return '';
  }

  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function hasMentorOverviewData(profile: ProfileEntity): boolean {
  return Boolean(
    profile.domainName?.trim() ||
      profile.subDomains.some((item) => item.name.trim()) ||
      formatMentorYearsDisplay(profile.yearsOfExperience) ||
      profile.expertise.some((item) => item.technologyName.trim())
  );
}

function hasMenteeOverviewData(profile: ProfileEntity): boolean {
  return Boolean(
    profile.domainName?.trim() ||
      profile.subDomains.some((item) => item.name.trim()) ||
      profile.educationStatus?.trim() ||
      profile.currentLevel?.trim() ||
      profile.technologies.some((item) => item.technologyName.trim())
  );
}

function MentorOverviewDetails({ profile }: ProfileOverviewDetailsProps) {
  const domain = profile.domainName?.trim();
  const subDomains = profile.subDomains.map((item) => item.name.trim()).filter(Boolean);
  const yearsLabel = formatMentorYearsDisplay(profile.yearsOfExperience);
  const expertise = profile.expertise
    .map((item) => item.technologyName.trim())
    .filter(Boolean);

  return (
    <div className="mb-8 space-y-4 border-b border-[#ECEFF5] pb-8">
      {domain ? <MetaItem label="Domain" value={domain} /> : null}

      {subDomains.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
            Subdomains
          </p>
          <div className="flex flex-wrap gap-2">
            {subDomains.map((name) => (
              <ProfileChip key={name}>{name}</ProfileChip>
            ))}
          </div>
        </div>
      ) : null}

      {yearsLabel ? <MetaItem label="Years of experience" value={yearsLabel} /> : null}

      {expertise.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
            Expertise
          </p>
          <div className="flex flex-wrap gap-2">
            {expertise.map((name) => (
              <ProfileChip key={name}>{name}</ProfileChip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenteeOverviewDetails({ profile }: ProfileOverviewDetailsProps) {
  const domain = profile.domainName?.trim();
  const subDomains = profile.subDomains.map((item) => item.name.trim()).filter(Boolean);
  const educationStatus = profile.educationStatus?.trim();
  const currentLevel = profile.currentLevel?.trim();
  const technologies = profile.technologies
    .map((item) => ({
      id: item.technologyId,
      label: [item.technologyName.trim(), formatExperienceLevelLabel(item.experienceLevelName)]
        .filter(Boolean)
        .join(' • '),
    }))
    .filter((item) => item.label);

  return (
    <div className="mb-8 space-y-4 border-b border-[#ECEFF5] pb-8">
      {domain ? <MetaItem label="Domain" value={domain} /> : null}

      {subDomains.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
            Subdomains
          </p>
          <div className="flex flex-wrap gap-2">
            {subDomains.map((name) => (
              <ProfileChip key={name}>{name}</ProfileChip>
            ))}
          </div>
        </div>
      ) : null}

      {educationStatus || currentLevel ? (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {educationStatus ? <MetaItem label="Education status" value={educationStatus} /> : null}
          {currentLevel ? <MetaItem label="Current level" value={currentLevel} /> : null}
        </div>
      ) : null}

      {technologies.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
            Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((item) => (
              <ProfileChip key={item.id}>{item.label}</ProfileChip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileOverviewDetails({ profile }: ProfileOverviewDetailsProps) {
  if (profile.role === 'mentor') {
    if (!hasMentorOverviewData(profile)) {
      return null;
    }
    return <MentorOverviewDetails profile={profile} />;
  }

  if (!hasMenteeOverviewData(profile)) {
    return null;
  }

  return <MenteeOverviewDetails profile={profile} />;
}
