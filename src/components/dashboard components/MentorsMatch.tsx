import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgramCard from '../ProgramCard';

const MentorsMatch: React.FC = () => {
  const mentors = [
    {
      id: 'mentor-1',
      name: 'Mona Zaki',
      bio: 'Senior product manager who work in tech field and build products in many companies',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'mentor-2',
      name: 'Mona Zaki',
      bio: 'Senior product manager who work in tech field and build products in many companies',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'mentor-3',
      name: 'Mona Zaki',
      bio: 'Senior product manager who work in tech field and build products in many companies',
      imageUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800">Mentors Match with you</h3>
        </div>
        <Link
          to="/recommended-mentors"
          className="text-sm text-primary transition hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {mentors.map((m) => (
          <ProgramCard
            key={m.id}
            variant="simple-button"
            image={m.imageUrl}
            tag="DESIGN"
            phases="50% MATCHING"
            title={m.name}
            description={m.bio}
            authorText="This mentor match with you because both of us study design"
            authorIcon={<Lightbulb size={16} />}
            hideAuthorAvatar
            primaryButtonText="See profile"
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
};

export default MentorsMatch;
