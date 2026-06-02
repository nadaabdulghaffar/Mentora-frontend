import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../../../components/ProgramCard';
import { ActivityScrollSection } from '../../../components/profile/ActivityScrollSection';
import { getMyApplications } from '../../../services/programService';
import {
  mapAcceptedApplicationToMyProgram,
  type MyProgramStyleItem,
} from '../profileActivityMappers';

interface MenteeActivityContentProps {
  isOwner: boolean;
}

export function MenteeActivityContent({ isOwner }: MenteeActivityContentProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isOwner);
  const [programs, setPrograms] = useState<MyProgramStyleItem[]>([]);

  const loadOwnPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const appsRes = await getMyApplications();
      if (appsRes.success && appsRes.data) {
        const items = appsRes.data.items ?? appsRes.data.Items ?? [];
        const accepted = (items as Record<string, unknown>[]).filter(
          (a) => String(a.status ?? '').toLowerCase() === 'accepted'
        );
        setPrograms(accepted.map(mapAcceptedApplicationToMyProgram));
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error(error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      void loadOwnPrograms();
    }
  }, [isOwner, loadOwnPrograms]);

  if (!isOwner) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <ActivityScrollSection
          title="Programs"
          isEmpty
          emptyMessage="No programs yet"
        >
          {null}
        </ActivityScrollSection>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <ActivityScrollSection
        title="My Programs"
        loading={loading}
        isEmpty={programs.length === 0}
        emptyMessage="No programs yet"
      >
        {programs.map((program) => (
          <div key={program.id} className="w-[320px] shrink-0 snap-start md:w-[360px]">
            <ProgramCard
              variant="simple-button"
              tag={program.tag}
              phases={program.phases}
              title={program.title}
              description={program.description}
              progress={program.progress}
              author={{
                name: program.mentorName ?? 'Mentor',
                avatar:
                  program.mentorAvatar ??
                  'https://randomuser.me/api/portraits/lego/1.jpg',
              }}
              primaryButtonText="Join classroom"
              className="h-full w-full"
              onPrimaryClick={() => {
                navigate(`/classroom/${program.id}`, {
                  state: { role: 'mentee' },
                });
              }}
            />
          </div>
        ))}
      </ActivityScrollSection>
    </div>
  );
}
