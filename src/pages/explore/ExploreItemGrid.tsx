import { useNavigate } from "react-router-dom";
import ProgramCard from "../../components/ProgramCard";
import type { ExploreItem } from "./exploreTypes";
import ExploreMentorCard from "./components/ExploreMentorCard";

type Props = {
  items: ExploreItem[];
  loading?: boolean;
  onCommunityMembershipChange?: (
    communityId: string,
    isJoined: boolean
  ) => void;
};

export default function ExploreItemGrid({
  items,
  loading = false,
}: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="col-span-full flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="col-span-full rounded-2xl border border-dashed border-[#D2D8E6] bg-white p-10 text-center text-[#6F778E]">
        No results found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const handlePrimaryClick = async () => {
          if (item.tab === "communities") {
            navigate(`/community/${item.id}`);
          } else if (item.tab === "mentors") {
            navigate(`/profile/${item.id}`);
          } else if (item.tab === "programs") {
            if (item.isApplied) navigate(`/classroom/${item.id}`);
            else navigate(`/applications/${item.id}?apply=1`);
          } else if (item.tab === "roadmaps") {
            navigate(`/roadmap/${item.id}`);
          }
        };

        if (item.tab === "mentors") {
          return (
            <ExploreMentorCard
              key={`${item.tab}-${item.id}`}
              item={item}
              onClick={handlePrimaryClick}
            />
          );
        }

        return (
          <ProgramCard
            key={`${item.tab}-${item.id}`}
            variant={item.tab === "roadmaps" ? "simple-button" : "dual-buttons"}
            image={item.image}
            tag={item.tag}
            phases={item.phases}
            durationBadge={item.durationBadge}
            title={item.title}
            description={item.description}
            author={item.author}
            primaryButtonText={
              item.tab === "programs"
                ? item.isApplied
                  ? "Join classroom"
                  : "View Details"
                : item.tab === "communities"
                  ? "Explore"
                  : "View Roadmap"
            }
            onPrimaryClick={handlePrimaryClick}
            hideHeaderImage={item.tab === "roadmaps"}
            className="h-full"
          />
        );
      })}
    </>
  );
}
