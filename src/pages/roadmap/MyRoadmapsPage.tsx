import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Layout from "../../shared/components/Layout";

import RoadmapCard from "../../components/roadmap-builder/roadmap/RoadmapCard";

import {
  deleteRoadmap,
  extractErrorMessage,
  getMyPublishedRoadmaps,
} from "../../services/roadmapService";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

import type { RoadmapListItem } from "../../types/roadmap";

import {
  loadRoadmapDomainNameMaps,
  normalizeRoadmapDetailsList,
  roadmapDetailsToListItem,
} from "../../utils/roadmapDisplayUtils";

export default function MyRoadmapPage() {
  const navigate = useNavigate();

  const resetStore = useRoadmapBuilderStore(
    (s) => s.resetStore
  );

  const [roadmaps, setRoadmaps] =
    useState<RoadmapListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const handleDelete = async (roadmapId: number) => {
    if (!window.confirm("Delete this roadmap? This action cannot be undone.")) {
      return;
    }
    setDeletingId(roadmapId);
    try {
      await deleteRoadmap(roadmapId);
      setRoadmaps((prev) =>
        prev.filter((r) => r.roadmapId !== roadmapId)
      );
    } catch (error) {
      console.error(extractErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchRoadmaps =
      async () => {
        try {
          const rawList = await getMyPublishedRoadmaps();
          const normalized = normalizeRoadmapDetailsList(rawList);
          const maps = await loadRoadmapDomainNameMaps();
          const mappedRoadmaps = normalized.map((item) =>
            roadmapDetailsToListItem(item, maps)
          );

          setRoadmaps(mappedRoadmaps);
        } catch (error) {
          console.error(
            error
          );
        } finally {
          setLoading(false);
        }
      };

    fetchRoadmaps();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div
          className="
            flex flex-col
            lg:flex-row
            lg:items-start
            lg:justify-between
            gap-5
          "
        >
          <div>
            <h1
              className="
                text-[42px]
                font-bold
                leading-tight
                text-[#1F2432]
              "
            >
              Your Roadmaps
            </h1>

            <p
              className="
                mt-2
                max-w-4xl
                text-xl
                text-[#5B6474]
              "
            >
              Turn goals into clear milestones
              with interactive and
              easy-to-follow roadmaps.
            </p>
          </div>

          {/* create button */}
          {roadmaps.length >
            0 && (
            <button
              onClick={() => {
                resetStore();
                navigate(
                  "/roadmap/create"
                );
              }}
              className="
                h-12 px-6
                rounded-2xl
                bg-primary
                text-white
                font-semibold
                hover:opacity-90
                transition
                shrink-0
              "
            >
              + Create Roadmap
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20 text-[#667085]">
            Loading roadmaps...
          </div>
        ) : roadmaps.length ===
          0 ? (
          /* Empty State */
          <div
            className="
              rounded-2xl
              border border-dashed
              border-[#C8CDD9]
              bg-white
              p-10
              text-center
            "
          >
            <h2
              className="
                text-xl
                font-semibold
                text-[#2A3042]
              "
            >
              No roadmaps yet
            </h2>

            <p
              className="
                mt-2
                text-[#7B869C]
              "
            >
              Create your first roadmap
              and start.
            </p>

            <button
              onClick={() => {
                resetStore();
                navigate(
                  "/roadmap/create"
                );
              }}
              className="
                mt-6
                h-11 px-6
                rounded-xl
                bg-primary
                text-white
                font-semibold
                hover:bg-primary-dark
                transition
              "
            >
              Create Roadmap
            </button>
          </div>
        ) : (
          /* Grid */
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >
            {roadmaps.map(
              (
                roadmap
              ) => (
                <RoadmapCard
                key={roadmap.roadmapId}
                roadmap={roadmap}
                onDelete={() => handleDelete(roadmap.roadmapId)}
                isDeleting={deletingId === roadmap.roadmapId}
              />
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}