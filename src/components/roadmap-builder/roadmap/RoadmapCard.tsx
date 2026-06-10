import { useState } from "react";

import {
  MoreVertical,
  Trash2,
} from "lucide-react";

import { formatRoadmapDuration, formatTargetLevel } from "../../../utils/roadmapDisplayUtils";

import { useNavigate } from "react-router-dom";

import type { RoadmapListItem } from "../../../types/roadmap";


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


  const safeDescription = roadmap.description ?? "";

  const shortDescription =
    safeDescription.length > 90
      ? safeDescription.slice(
          0,
          90
        ) + "..."
      : safeDescription;

  const durationLabel = formatRoadmapDuration(roadmap.duration);

  const targetLevelFromStr = formatTargetLevel(roadmap.targetLevelFrom);
  const targetLevelToStr = formatTargetLevel(roadmap.targetLevelTo);
  
  let targetAudienceLabel = "";
  if (targetLevelFromStr && targetLevelToStr && targetLevelFromStr !== targetLevelToStr) {
    targetAudienceLabel = `${targetLevelFromStr} → ${targetLevelToStr}`;
  } else if (targetLevelFromStr) {
    targetAudienceLabel = targetLevelFromStr;
  } else if (targetLevelToStr) {
    targetAudienceLabel = targetLevelToStr;
  }

  return (
    <div
      className="
        bg-white
        rounded-[28px]
        p-6
        border border-[#ECEFF5]
        relative
        flex flex-col h-full
      "
    >
      {/* top menu */}
      <div className="absolute top-6 right-6 z-10">
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
          pr-10
          text-[22px]
          leading-tight
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
          leading-6
          text-[#667085]
          break-words
          whitespace-normal
          flex-1
        "
      >
        {shortDescription}
      </p>

      {/* badges */}
      <div className="mt-5 flex items-center gap-2 flex-wrap">
        {roadmap.domainName && (
          <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#6B57B5] uppercase">
            {roadmap.domainName}
          </span>
        )}
        {roadmap.subDomainName && (
          <span className="rounded-full bg-[#EAF9F7] px-3 py-1 text-xs font-semibold tracking-wide text-[#2EA594] uppercase">
            {roadmap.subDomainName}
          </span>
        )}
        {durationLabel && (
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#4338CA] uppercase">
            {durationLabel}
          </span>
        )}
      </div>

      {targetAudienceLabel && (
        <div className="mt-3 text-sm text-[#5D6A85] flex items-center gap-1.5 font-medium">
          <span>🎯</span> Target Audience: {targetAudienceLabel}
        </div>
      )}

      {/* button */}
      <button
        onClick={() =>
          navigate(
            `/roadmap/${roadmap.roadmapId}`
          )
        }
        className="
          mt-5
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