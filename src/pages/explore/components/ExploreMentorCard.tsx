import type { ExploreItem } from '../exploreTypes';
import { Star } from 'lucide-react';
import { ProfileAvatar } from '../../../components/profile/ProfileAvatar';

interface ExploreMentorCardProps {
  item: ExploreItem;
  onClick: () => void;
}

export default function ExploreMentorCard({ item, onClick }: ExploreMentorCardProps) {
  // item.phases usually contains something like "4.9 ★" from the mapper.
  const ratingText = item.phases ? item.phases.replace('★', '').trim() : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary/20">
      {/* Top Background Pattern */}
      <div className="relative h-28 w-full bg-[#E5E0F8] overflow-hidden">
        {/* Subtle decorative shapes can go here if needed */}
        
        {/* Wavy bottom shape */}
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 left-0 w-full h-12 object-cover translate-y-[2px]" 
          preserveAspectRatio="none"
        >
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,192C1120,181,1280,139,1360,117.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Avatar Section */}
      <div className="relative flex justify-center -mt-14 px-4">
        <div className="relative inline-block shrink-0">
          <ProfileAvatar 
            pictureUrl={item.image} 
            name={item.title}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
          />
          {/* Default Online Status dot for visual similarity to design */}
          <span className="absolute bottom-1 right-1 h-4 w-4 bg-[#22C55E] border-2 border-white rounded-full"></span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col items-center px-4 pt-4 pb-5 text-center">
        {/* Domain Badge */}
        {item.tag && (
          <span className="mb-3 inline-flex items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
            {item.tag}
          </span>
        )}
        
        {/* Name */}
        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">
          {item.title}
        </h3>
        
        {/* Description/Bio */}
        {item.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-2 px-2">
            {item.description}
          </p>
        )}

        {/* Rating */}
        {ratingText && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600">
            <Star className="h-[18px] w-[18px] fill-[#FFB800] text-[#FFB800]" />
            <span>{ratingText}</span>
          </div>
        )}
        
        <div className="mt-auto pt-5 w-full">
          <button 
            onClick={onClick}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            See Full Profile
          </button>
        </div>
      </div>
    </div>
  );
}
