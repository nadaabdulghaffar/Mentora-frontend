import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../ProgramCard';

export type MyProgramItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  phases: string;
  subDomainName?: string;
  image?: string;
  mentorName?: string;
  mentorAvatar?: string;
  progress?: number;
};

interface ChatMyProgramsWidgetProps {
  programs: MyProgramItem[];
  isMentor: boolean;
}

export const ChatMyProgramsWidget = memo(function ChatMyProgramsWidget({ programs, isMentor }: ChatMyProgramsWidgetProps) {
  const navigate = useNavigate();

  if (!programs || programs.length === 0) return null;

  return (
    <div className="mt-3 ml-12 max-w-[calc(100%-3rem)] md:max-w-[85%] min-w-0 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar w-full min-w-0">
        {programs.map((program, idx) => (
          <div key={idx} className="w-[300px] shrink-0 snap-start">
            <ProgramCard
              variant="simple-button"
              tag={program.tag}
              phases={program.phases}
              image={program.image}
              title={program.title}
              description={program.description}
              progress={program.progress}
              author={
                !isMentor
                  ? {
                      name: program.mentorName ?? "Mentor",
                      avatar: program.mentorAvatar ?? "",
                    }
                  : undefined
              }
              primaryButtonText="Join classroom"
              className="w-full h-full"
              onPrimaryClick={() => {
                navigate(`/classroom/${program.id}`, {
                  state: {
                    role: isMentor ? 'mentor' : 'mentee',
                  },
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
