import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Layout from "../../shared/components/Layout";
import ProgramCard from "../../components/ProgramCard";

import apiClient from "../../services/api";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

import type {
  ApiResponse,
  RoadmapListItem,
} from "../../types/roadmap";

export default function MyRoadmapPage() {
  const navigate = useNavigate();

  const resetBuilderStore = () => {
    useRoadmapBuilderStore
      .getState()
      .resetStore();
  };

  const [roadmaps, setRoadmaps] =
    useState<RoadmapListItem[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmaps =
      async () => {
        try {
          setError(null);
          const response =
            await apiClient.get<
              ApiResponse<
                RoadmapListItem[]
              >
            >(
              "/Roadmap/View-my-roadmaps"
            );

          const mappedRoadmaps =
            Array.isArray(response.data.data)
              ? response.data.data
                  .filter(
                    (item) =>
                      Number.isFinite(Number(item.roadmapId)) &&
                      Number(item.roadmapId) > 0
                  )
                  .map((item) => ({
                    roadmapId: Number(item.roadmapId),
                    title: String(item.title || "Roadmap"),
                    description: String(item.description || ""),
                    phasesCount: Number(item.phasesCount ?? 0),
                    skillDomainId: Number(item.skillDomainId ?? 1),
                    domainId:
                      ((Math.max(1, Number(item.skillDomainId ?? 1)) - 1) % 4) + 1,
                  }))
              : [];

          setRoadmaps(
            mappedRoadmaps
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load your roadmaps."
          );
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
                resetBuilderStore();
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
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            {error}
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
                resetBuilderStore();
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
              lg:grid-cols-3
              gap-6
            "
          >
            {roadmaps.map(
              (
                roadmap
              ) => (
                <ProgramCard
                  key={
                    roadmap.roadmapId
                  }
                  variant="simple-button"
                  tag="ROADMAP"
                  phases={`${roadmap.phasesCount} PHASES`}
                  title={roadmap.title}
                  description={roadmap.description || ""}
                  primaryButtonText="View Roadmap"
                  onPrimaryClick={() =>
                    navigate(
                      `/roadmap/${roadmap.roadmapId}`
                    )
                  }
                  className="h-full"
                />
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}