import { useEffect, useMemo } from "react";

import { useParams } from "react-router-dom";

import {
  BarChart3,
  Clock4,
  Bookmark,
} from "lucide-react";

import Layout from "../../shared/components/Layout";

import PhaseCard from "../../components/roadmap-builder/roadmap/PhaseCard";
import EmbeddedRoadmapStructure from "../../components/roadmap-builder/EmbeddedRoadmapStructure";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

function formatDurationWeeks(duration?: number) {
  if (!duration || duration <= 0) return "—";
  return `${duration} week${duration === 1 ? "" : "s"}`;
}

function formatRoadmapStatus(
  status?: string | number
) {

  if (
    status === "Published" ||
    status === 1
  ) {
    return "Published";
  }

  return "Draft";
}

export default function RoadmapViewPage() {

  const { roadmapId } =
    useParams();

  const loadForView =
    useRoadmapBuilderStore(
      (s) => s.loadForView
    );

  const loadExperienceLevels =
    useRoadmapBuilderStore(
      (s) => s.loadExperienceLevels
    );

  const loadDomains =
    useRoadmapBuilderStore(
      (s) => s.loadDomains
    );

  const loadSubDomains =
    useRoadmapBuilderStore(
      (s) => s.loadSubDomains
    );

  const isLoading =
    useRoadmapBuilderStore(
      (s) => s.isSaving
    );

  const error =
    useRoadmapBuilderStore(
      (s) => s.error
    );

  const basicInfo =
    useRoadmapBuilderStore(
      (s) => s.basicInfo
    );

  const phases =
    useRoadmapBuilderStore(
      (s) => s.phases
    );

  const experienceLevels =
    useRoadmapBuilderStore(
      (s) => s.experienceLevels
    );

  const domains =
  useRoadmapBuilderStore(
    (s) => s.domains
  ) ?? [];

const subDomains =
  useRoadmapBuilderStore(
    (s) => s.subDomains
  ) ?? [];

  const collapseAll =
    useRoadmapBuilderStore(
      (s) => s.collapseAll
    );

  const expandAll =
    useRoadmapBuilderStore(
      (s) => s.expandAll
    );

  useEffect(() => {

    const id =
      roadmapId
        ? Number(roadmapId)
        : NaN;

    if (Number.isFinite(id)) {
      loadForView(id);
    }

  }, [
    loadForView,
    roadmapId,
  ]);

  useEffect(() => {

    if (
      experienceLevels.length === 0
    ) {
      loadExperienceLevels();
    }

  }, [
    experienceLevels.length,
    loadExperienceLevels,
  ]);

  useEffect(() => {

    if (
      domains.length === 0
    ) {
      loadDomains();
    }

  }, [
    domains.length,
    loadDomains,
  ]);

  useEffect(() => {

    if (
      basicInfo.skillDomainId
    ) {

      loadSubDomains(
        basicInfo.skillDomainId
      );
    }

  }, [
    basicInfo.skillDomainId,
    loadSubDomains,
  ]);

  const levelLabel =
    useMemo(() => {

      const from =
        basicInfo.targetLevelFrom;

      const to =
        basicInfo.targetLevelTo;

      if (
        from == null &&
        to == null
      ) {
        return "All levels";
      }

      const nameFor = (
        id?: number | null
      ) =>
        id == null
          ? undefined
          : experienceLevels.find(
              (x) => x.id === id
            )?.name ??
            `Level ${id}`;

      const fromName =
        nameFor(from);

      const toName =
        nameFor(to);

      if (
        fromName &&
        toName
      ) {

        return from === to
          ? fromName
          : `${fromName} → ${toName}`;
      }

      return (
        fromName ??
        toName ??
        "All levels"
      );

    }, [
      basicInfo.targetLevelFrom,
      basicInfo.targetLevelTo,
      experienceLevels,
    ]);

  const domainName =
    domains.find(
      (d) =>
        d.id ===
        basicInfo.skillDomainId
    )?.name ?? "Domain";

  const subDomainName =
    subDomains.find(
      (s) =>
        s.id ===
        basicInfo.subDomainId
    )?.name ?? "Subdomain";

  return (

    <Layout>

      <div
        className="
          max-w-[1050px]
          mx-auto
          px-4
          space-y-6
        "
      >

        {/* HERO HEADER */}

        <div
          className="
            relative overflow-hidden
            rounded-[32px]
            border border-[#ECEFF5]
            bg-white
            px-8 py-8
            shadow-sm
          "
        >

          {/* glow */}
          <div
            className="
              absolute
              -top-24 -right-24
              h-64 w-64
              rounded-full
              bg-primary/10
              blur-3xl
              pointer-events-none
            "
          />

          <div
            className="
              relative
              flex flex-col
              gap-8
              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >

            {/* LEFT */}
            <div className="min-w-0 flex-1">

              {/* top row */}
              <div
                className="
                  flex items-center
                  justify-between
                  gap-4
                  flex-wrap
                  mb-5
                "
              >

                {/* status */}
                <div
                  className="
                    inline-flex items-center
                    rounded-full
                    bg-primary/10
                    px-3 py-1
                    text-xs font-semibold
                    text-primary
                  "
                >
                {basicInfo.status}
                </div>

                {/* save */}
                <button
                  className="
                    inline-flex items-center
                    gap-2
                    rounded-2xl
                    border border-[#E4E7EC]
                    bg-white
                    px-4 py-2.5
                    text-sm font-semibold
                    text-[#344054]
                    hover:border-primary/30
                    hover:bg-primary/5
                    transition
                  "
                >

                  <Bookmark size={16} />

                  Save Roadmap

                </button>

              </div>

              {/* title */}
              <h1
                className="
                  text-[38px]
                  leading-[46px]
                  font-bold
                  tracking-[-1px]
                  text-[#1F2432]
                "
              >
                {basicInfo.title ||
                  "Roadmap"}
              </h1>

              {/* description */}
              <p
                className="
                  mt-4
                  max-w-[760px]
                  text-[16px]
                  leading-8
                  text-[#667085]
                "
              >
                {basicInfo.description ||
                  "—"}
              </p>

              {/* domain chips */}
              <div
                className="
                  mt-5
                  flex flex-wrap
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    rounded-full
                    bg-[#F2F4F7]
                    px-3 py-1.5
                    text-xs
                    font-semibold
                    text-[#344054]
                  "
                >
                  {domainName}
                </span>

                <span
                  className="
                    rounded-full
                    bg-primary/10
                    px-3 py-1.5
                    text-xs
                    font-semibold
                    text-primary
                  "
                >
                  {subDomainName}
                </span>

              </div>

              {/* mentor */}
              <div
                className="
                  mt-6
                  flex items-center
                  gap-4
                "
              >

                <img
                  src={
                    basicInfo.profilePictureUrl ||
                    `https://ui-avatars.com/api/?name=${
                      basicInfo.mentorName ||
                      "Mentor"
                    }`
                  }
                  alt={
                    basicInfo.mentorName ||
                    "Mentor"
                  }
                  className="
                    h-14 w-14
                    rounded-full
                    object-cover
                    border-2 border-white
                    shadow-sm
                  "
                />

                <div>

                  <p
                    className="
                      text-xs uppercase
                      tracking-wide
                      text-[#98A2B3]
                      font-semibold
                    "
                  >
                    Created by
                  </p>

                  <p
                    className="
                      text-[16px]
                      font-bold
                      text-[#1F2432]
                    "
                  >
                    {basicInfo.mentorName ||
                      "Mentor"}
                  </p>

                </div>

              </div>

            </div>

            {/* RIGHT STATS */}
            <div
              className="
                grid grid-cols-2
                gap-3
                shrink-0
              "
            >

              {/* level */}
              <div
                className="
                  rounded-2xl
                  border border-[#EEF2F6]
                  bg-[#FCFCFD]
                  px-5 py-4
                  min-w-[170px]
                "
              >

                <div
                  className="
                    flex items-center
                    gap-2
                    text-[#667085]
                    text-sm
                    font-medium
                  "
                >

                  <BarChart3
                    size={16}
                    className="
                      text-primary
                    "
                  />

                  Level

                </div>

                <p
                  className="
                    mt-2
                    text-[15px]
                    font-bold
                    text-[#1F2432]
                  "
                >
                  {levelLabel}
                </p>

              </div>

              {/* duration */}
              <div
                className="
                  rounded-2xl
                  border border-[#EEF2F6]
                  bg-[#FCFCFD]
                  px-5 py-4
                  min-w-[170px]
                "
              >

                <div
                  className="
                    flex items-center
                    gap-2
                    text-[#667085]
                    text-sm
                    font-medium
                  "
                >

                  <Clock4
                    size={16}
                    className="
                      text-primary
                    "
                  />

                  Duration

                </div>

                <p
                  className="
                    mt-2
                    text-[15px]
                    font-bold
                    text-[#1F2432]
                  "
                >
                  {formatDurationWeeks(
                    basicInfo.duration
                  )}
                </p>

              </div>

              {/* phases */}
              <div
                className="
                  rounded-2xl
                  border border-[#EEF2F6]
                  bg-[#FCFCFD]
                  px-5 py-4
                "
              >

                <p
                  className="
                    text-sm
                    text-[#667085]
                    font-medium
                  "
                >
                  Phases
                </p>

                <p
                  className="
                    mt-2
                    text-[26px]
                    font-bold
                    text-[#1F2432]
                  "
                >
                  {phases.length}
                </p>

              </div>

              {/* topics */}
              <div
                className="
                  rounded-2xl
                  border border-[#EEF2F6]
                  bg-[#FCFCFD]
                  px-5 py-4
                "
              >

                <p
                  className="
                    text-sm
                    text-[#667085]
                    font-medium
                  "
                >
                  Topics
                </p>

                <p
                  className="
                    mt-2
                    text-[26px]
                    font-bold
                    text-[#1F2432]
                  "
                >
                  {phases.reduce(
                    (acc, phase) =>
                      acc +
                      phase.topics.length,
                    0
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* COLLAPSE CONTROLS */}
        <div
          className="
            flex items-center
            justify-between
            gap-4
            flex-wrap
          "
        >

          <h2
            className="
              text-[20px]
              font-bold
              text-[#1F2432]
            "
          >
            Roadmap Structure
          </h2>

          <div
            className="
              flex items-center
              gap-3
            "
          >

            <button
              onClick={expandAll}
              className="
                text-primary
                text-sm
                font-semibold
                hover:opacity-80
                transition
              "
            >
              Expand All
            </button>

            <span
              className="
                text-[#D0D5DD]
              "
            >
              |
            </span>

            <button
              onClick={collapseAll}
              className="
                text-primary
                text-sm
                font-semibold
                hover:opacity-80
                transition
              "
            >
              Collapse All
            </button>

          </div>

        </div>

        {/* loading / error */}
        {isLoading ? (

          <div
            className="
              text-center
              py-14
              text-[#667085]
            "
          >
            Loading roadmap...
          </div>

        ) : error ? (

          <div
            className="
              text-sm
              text-red-600
              font-medium
            "
          >
            {error}
          </div>

        ) : null}

        {/* roadmap structure */}
        {!isLoading &&
          !error && (
<EmbeddedRoadmapStructure
  phases={phases}
/>

        )}

      </div>

    </Layout>
  );
}