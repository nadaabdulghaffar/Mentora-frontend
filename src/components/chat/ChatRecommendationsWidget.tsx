import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatRecommendationItem, ChatProgramRecommendationItem, ChatCommunityRecommendationItem } from '../../services/chatService';
import { MentorRecommendationCard } from '../MentorRecommendationCard';
import { ProgramCard } from '../ProgramCard';
import { CommunityRecommendationCard } from '../CommunityRecommendationCard';

interface ChatRecommendationsWidgetProps {
  mentors?: ChatRecommendationItem[];
  programs?: ChatProgramRecommendationItem[];
  communities?: ChatCommunityRecommendationItem[];
}

export const ChatRecommendationsWidget = memo(function ChatRecommendationsWidget({ mentors, programs, communities }: ChatRecommendationsWidgetProps) {
  const navigate = useNavigate();

  const hasMentors = mentors && mentors.length > 0;
  const hasPrograms = programs && programs.length > 0;
  const hasCommunities = communities && communities.length > 0;

  if (!hasMentors && !hasPrograms && !hasCommunities) return null;

  return (
    <div className="mt-3 ml-12 max-w-[calc(100%-3rem)] md:max-w-[85%] min-w-0 overflow-hidden">
      <div className="flex flex-col gap-6 w-full min-w-0">
        {hasMentors && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar w-full min-w-0">
            {mentors.map((m, idx) => (
              <div key={idx} className="w-[280px] shrink-0 snap-start">
                <MentorRecommendationCard
                  id={m.mentor_id}
                  name={m.mentor_name}
                  domain={m.domain}
                  imageUrl={null}
                  matchPercentage={Math.round(m.match_percentage || 0)}
                  matchReason={m.reason ? m.reason.split('|')[0] : null}
                  explanationMetadata={m.explanation_metadata}
                  onSeeProfileClick={() => navigate(`/profile/${m.mentor_id}`)}
                />
              </div>
            ))}
          </div>
        )}

        {hasPrograms && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar w-full min-w-0">
            {programs.map((p, idx) => (
              <div key={idx} className="w-[300px] shrink-0 snap-start">
                <ProgramCard
                  variant="simple-button"
                  title={p.title}
                  tag={p.domain}
                  matchPercentage={Math.round(p.match_percentage || 0)}
                  matchReasons={p.reason ? p.reason.split('|').map(r => r.trim()).filter(Boolean) : undefined}
                  authorText={p.mentor_name}
                  explanationMetadata={p.explanation_metadata}
                  primaryButtonText="View Program"
                  onPrimaryClick={() => navigate(`/applications/${p.post_id}?apply=1`)}
                />
              </div>
            ))}
          </div>
        )}

        {hasCommunities && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar w-full min-w-0">
            {communities.map((c, idx) => (
              <div key={idx} className="w-[300px] shrink-0 snap-start">
                <CommunityRecommendationCard
                  id={c.id}
                  name={c.name || `Community ${c.id}`}
                  domain={c.domain}
                  matchPercentage={Math.round(c.match_percentage || 0)}
                  matchReasons={c.reason ? [c.reason] : undefined}
                  onExploreClick={() => navigate(`/community/${c.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
