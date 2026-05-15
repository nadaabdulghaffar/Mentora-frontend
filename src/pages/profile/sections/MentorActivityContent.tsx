import { Award } from 'lucide-react';
import type { ProfileEntity } from '../types';
import { ProgramCard } from '../../../components/profile';

interface MentorActivityContentProps {
  profile: ProfileEntity;
}

export function MentorActivityContent({ profile }: MentorActivityContentProps) {
  const apps = profile.activeApplications ?? [];
  const programs = profile.mentorshipPrograms ?? [];

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Award className="text-primary" size={22} />
          <h2 className="text-lg font-bold text-[#1F2533]">Active Applications</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {apps.slice(0, 1).map((p) => (
            <ProgramCard key={p.id} program={p} actionLabel="Apply" onAction={() => undefined} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[#1F2533]">Mentorship Programs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
