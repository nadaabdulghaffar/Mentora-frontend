import { useNavigate } from 'react-router-dom';
import MentorRecommendationCard from '../MentorRecommendationCard';
import { useRecommendations } from '../../hooks/useRecommendations';
import SectionTitle from '../SectionTitle';
import ViewAllLink from '../ViewAllLink';
import React from 'react';
const MentorsMatch: React.FC = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, isError } = useRecommendations('mentors', 3);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Mentors Match with you</SectionTitle>
        <ViewAllLink to="/recommended-mentors" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80 w-full"></div>
          ))}
        </div>
      ) : isError || !mentors || mentors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No mentor recommendations available right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {mentors.map((m) => (
            <MentorRecommendationCard
              key={m.id}
              id={m.id}
              name={m.name}
              domain={m.headline}
              imageUrl={m.avatarUrl}
              matchPercentage={m.aiMatchScore}
              matchReasons={m.aiMatchReasons}
              onSeeProfileClick={() => navigate(`/profile/${m.id}`)}
              className="h-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorsMatch;
