import { useNavigate } from "react-router-dom";
import ProgramCard from "../../components/ProgramCard";
import { joinCommunity, leaveCommunity } from "../../services/communityService";
import type { ExploreItem } from "./exploreTypes";

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
  onCommunityMembershipChange,
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
      {items.map((item) => (
        <ProgramCard
          key={`${item.tab}-${item.id}`}
          variant={item.tab === "roadmaps" ? "simple-button" : "dual-buttons"}
          image={item.image}
          tag={item.tag}
          phases={item.phases}
          title={item.title}
          description={item.description}
          author={item.author}
          primaryButtonText={
            item.tab === "mentors"
              ? "See Full Profile"
              : item.tab === "programs"
                ? item.isApplied
                  ? "Join classroom"
                  : "Apply"
                : item.tab === "communities"
                  ? item.isJoined
                    ? "Leave Community"
                    : "Join Community"
                  : "View Roadmap"
          }
          secondaryButtonText={
            item.tab === "mentors"
              ? "Message"
              : item.tab === "programs"
                ? "Details"
                : item.tab === "communities"
                  ? "Preview"
                  : "Details"
          }
          onPrimaryClick={async () => {
            if (item.tab === "communities") {
              try {
                if (item.isJoined) {
                  await leaveCommunity(item.id);
                  onCommunityMembershipChange?.(item.id, false);
                } else {
                  await joinCommunity(item.id);
                  onCommunityMembershipChange?.(item.id, true);
                }
              } catch (err) {
                console.error("Failed to update community membership", err);
              }
            } else if (item.tab === "mentors") {
              navigate(`/profile/${item.id}`);
            } else if (item.tab === "programs") {
              if (item.isApplied) navigate(`/classroom/${item.id}`);
              else navigate(`/applications/${item.id}?apply=1`);
            } else if (item.tab === "roadmaps") {
              navigate(`/roadmap/${item.id}`);
            }
          }}
          onSecondaryClick={() => {
            if (item.tab === "communities") navigate(`/community/${item.id}`);
            if (item.tab === "programs") navigate(`/applications/${item.id}`);
            if (item.tab === "roadmaps") navigate(`/roadmap/${item.id}`);
          }}
          hideHeaderImage={item.tab === "roadmaps"}
          className="h-full"
        />
      ))}
    </>
  );
}
