import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatRecommendationItem, ChatProgramRecommendationItem } from '../../services/chatService';
import { MentorRecommendationCard } from '../MentorRecommendationCard';
import { ProgramCard } from '../ProgramCard';

interface ChatRecommendationsWidgetProps {
  mentors?: ChatRecommendationItem[];
  programs?: ChatProgramRecommendationItem[];
}

export const ChatRecommendationsWidget = memo(function ChatRecommendationsWidget({ mentors, programs }: ChatRecommendationsWidgetProps) {
  const navigate = useNavigate();

  const hasMentors = mentors && mentors.length > 0;
  const hasPrograms = programs && programs.length > 0;

  if (!hasMentors && !hasPrograms) return null;

  return (
    <div className="mt-3 ml-12 max-w-[90%] md:max-w-[85%]">
      <div className="flex flex-col gap-6">
        {hasMentors && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {mentors.map((m, idx) => (
              <div key={idx} className="w-[280px] shrink-0 snap-start">
                <MentorRecommendationCard
                  id={m.mentor_id}
                  name={m.mentor_name}
                  domain={m.domain}
                  imageUrl={null}
                  matchPercentage={Math.round(m.match_percentage || 0)}
                  matchReason={m.reason ? m.reason.split('|')[0] : null}
                  onSeeProfileClick={() => navigate(`/profile/${m.mentor_id}`)}
                />
              </div>
            ))}
          </div>
        )}

        {hasPrograms && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {programs.map((p, idx) => (
              <div key={idx} className="w-[300px] shrink-0 snap-start">
                <ProgramCard
                  variant="simple-button"
                  title={p.title}
                  tag={p.domain}
                  description={p.reason ? p.reason.replace(/\|/g, ' • ') : ''}
                  authorText={p.mentor_name}
                  primaryButtonText="View Program"
                  onPrimaryClick={() => navigate(`/applications/${p.post_id}?apply=1`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
