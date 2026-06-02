import { useState } from "react";

import {
  MoreVertical,
  Trash2,
} from "lucide-react";

import { formatRoadmapDuration } from "../../../utils/roadmapDisplayUtils";

import { useNavigate } from "react-router-dom";

import type { RoadmapListItem } from "../../../types/roadmap";

import { ROADMAP_DOMAIN_META } from "../../../constants/roadmapDomains";

interface Props {
  roadmap: RoadmapListItem;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function RoadmapCard({
  roadmap,
  onDelete,
  isDeleting = false,
}: Props) {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] =
    useState(false);

  const rawDomainBucket =
    roadmap.domainId ??
    (roadmap.skillDomainId != null
      ? ((Math.max(1, roadmap.skillDomainId) - 1) % 4) + 1
      : 1);

  const domainBucket =
    Number.isFinite(rawDomainBucket) && rawDomainBucket >= 1 && rawDomainBucket <= 4
      ? rawDomainBucket
      : 1;

  const domainMeta =
    ROADMAP_DOMAIN_META[
      domainBucket as keyof typeof ROADMAP_DOMAIN_META
    ] ?? ROADMAP_DOMAIN_META[1];

  const Icon =
    domainMeta?.icon;

  const safeDescription = roadmap.description ?? "";

  const shortDescription =
    safeDescription.length > 90
      ? safeDescription.slice(
          0,
          90
        ) + "..."
      : safeDescription;

  const durationLabel = formatRoadmapDuration(roadmap.duration);

  return (
    <div
      className="
        bg-white
        rounded-[28px]
        p-6
        border border-[#ECEFF5]
        relative
      "
    >
      {/* top */}
      <div className="flex items-start justify-between">
        <div
          className={`
            w-14 h-14 rounded-2xl
            flex items-center justify-center
            ${domainMeta.bg}
          `}
        >
          {Icon && (
            <Icon
              size={26}
              className={
                domainMeta.color
              }
            />
          )}
        </div>

        {/* menu */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(
                !openMenu
              )
            }
            className="
              w-10 h-10 rounded-xl
              bg-[#F5F7FB]
              flex items-center justify-center
              hover:bg-[#ECEFF5]
              transition
            "
          >
            <MoreVertical
              size={18}
            />
          </button>

          {openMenu && (
            <div
              className="
                absolute right-0 top-12
                w-[210px]
                rounded-2xl
                bg-white
                border border-[#ECEFF5]
                shadow-xl
                p-2
                z-20
              "
            >
              <button
                onClick={() =>
                  navigate(
                    `/roadmap/${roadmap.roadmapId}/edit`
                  )
                }
                className="
                  w-full h-11
                  rounded-xl
                  text-left px-4
                  hover:bg-[#F5F7FB]
                  transition
                "
              >
                Edit Roadmap
              </button>

              <button
                onClick={() => {
                  setOpenMenu(false);
                  onDelete?.();
                }}
                disabled={isDeleting}
                className="
                  w-full h-11
                  rounded-xl
                  text-left px-4
                  flex items-center gap-2
                  text-red-500
                  hover:bg-red-50
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Trash2 size={15} />
                )}
                {isDeleting ? "Deleting…" : "Delete Roadmap"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* title */}
      <h2
        className="
          mt-6
          text-[24px]
          leading-[30px]
          font-bold
          text-[#1F2432]
          break-words
          whitespace-normal
        "
      >
        {roadmap.title}
      </h2>

      {/* description */}
      <p
        className="
          mt-3
          text-[15px]
          leading-7
          text-[#667085]
          min-h-[48px]
          break-words
          whitespace-normal
        "
      >
        {shortDescription}
      </p>

      {/* domain / subdomain / duration */}
      <div
        className="
          mt-5
          space-y-1.5
          text-[#98A2B3]
          text-sm font-semibold
        "
      >
        <p>
          <span className="text-[#B0B7C3]">Domain:</span>{' '}
          {roadmap.domainName || '—'}
        </p>
        <p>
          <span className="text-[#B0B7C3]">Subdomain:</span>{' '}
          {roadmap.subDomainName || '—'}
        </p>
        <p>
          <span className="text-[#B0B7C3]">Duration:</span>{' '}
          {durationLabel || '—'}
        </p>
      </div>

      {/* button */}
      <button
        onClick={() =>
          navigate(
            `/roadmap/${roadmap.roadmapId}`
          )
        }
        className="
          mt-6
          w-full h-12
          rounded-2xl
          bg-primary
          text-white
          font-semibold
          hover:opacity-90
          transition
        "
      >
        View Roadmap
      </button>
    </div>
  );
}