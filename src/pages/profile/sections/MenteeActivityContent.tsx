import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../../../components/ProgramCard';
import { ActivityScrollSection } from '../../../components/profile/ActivityScrollSection';
import { resolveProgramImageUrl, getMyApplications, getProgramView } from '../../../services/programService';
import { classroomService } from '../../../services/classroomService';
import { resolveProfilePictureUrl } from '../../../utils/profileImageUrl';
import authAPI from '../../../services/authService';
import {
  mapAcceptedApplicationToMyProgram,
  type MyProgramStyleItem,
} from '../profileActivityMappers';

import { getPublicMenteePrograms } from '../profileService';

interface MenteeActivityContentProps {
  isOwner: boolean;
  targetUserId?: string;
}

export function MenteeActivityContent({ isOwner, targetUserId }: MenteeActivityContentProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
        const user = authAPI.getCurrentUser();
        const mapped = await Promise.all(
          accepted.map(async (a: any) => {
            const base = mapAcceptedApplicationToMyProgram(a);
            const programId = Number(a.programId ?? 0);
            if (programId > 0) {
              base.id = String(programId); // Override application ID with actual Program ID for correct classroom navigation
              try {
                const [view, completionRes] = await Promise.all([
                  getProgramView(programId),
                  classroomService.getClassroomCompletion(programId),
                ]);
                base.phases = view?.subDomainName || base.phases;
                if (completionRes?.success && completionRes.data?.students) {
                  const mentee = completionRes.data.students.find((s: any) => s.studentId === user?.userId);
                  if (mentee) {
                    base.progress = mentee.overallCompletionPercent || 0;
                  }
                }
              } catch {
                // Ignore errors
              }
            }
            return base;
          })
        );
        setPrograms(mapped);
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

  const loadPublicPrograms = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await getPublicMenteePrograms(targetUserId);
      if (res.success && res.data) {
        const mapped = res.data.map((p: any) => ({
          id: String(p.programId ?? ''),
          title: String(p.title ?? ''),
          description: String(p.description ?? ''),
          image: p.programImageUrl ? resolveProgramImageUrl(p.programImageUrl) : undefined,
          tag: String(p.domainName ?? ''),
          phases: String(p.subDomainName ?? ''),
          mentorName: String(p.mentorName ?? 'Mentor'),
          mentorAvatar: p.mentorAvatar ? resolveProfilePictureUrl(p.mentorAvatar) : undefined,
        }));
        setPrograms(mapped);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error('Failed to load public mentee programs', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (isOwner) {
      void loadOwnPrograms();
    } else {
      void loadPublicPrograms();
    }
  }, [isOwner, loadOwnPrograms, loadPublicPrograms]);

  if (!isOwner) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <ActivityScrollSection
          title="Enrolled Programs"
          loading={loading}
          isEmpty={programs.length === 0}
          emptyMessage="No programs yet"
        >
          {programs.map((program) => (
            <div key={program.id} className="w-[320px] shrink-0 snap-start md:w-[340px]">
              <ProgramCard
                variant="dual-buttons"
                tag={program.tag}
                phases={program.phases}
                image={program.image}
                title={program.title}
                description={program.description}
                author={{
                  name: program.mentorName ?? 'Mentor',
                  avatar:
                    program.mentorAvatar ??
                    'https://randomuser.me/api/portraits/lego/1.jpg',
                }}
                primaryButtonText="View Details"
                className="h-full w-full"
                onPrimaryClick={() => {
                  navigate(`/applications/${program.id}`);
                }}
              />
            </div>
          ))}
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
              image={program.image}
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
