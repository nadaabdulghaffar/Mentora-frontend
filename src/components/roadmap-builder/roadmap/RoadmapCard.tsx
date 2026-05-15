import { useState } from "react";

import {
  MoreVertical,
  Layers3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { RoadmapListItem } from "../../../types/roadmap";

import { ROADMAP_DOMAIN_META } from "../../../constants/roadmapDomains";

interface Props {
  roadmap: RoadmapListItem;
}

export default function RoadmapCard({
  roadmap,
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
                className="
                  w-full h-11
                  rounded-xl
                  text-left px-4
                  text-red-500
                  hover:bg-red-50
                  transition
                "
              >
                Unpublish 
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
          min-h-[84px]
        "
      >
        {shortDescription}
      </p>

      {/* phases */}
      <div
        className="
          mt-5
          flex items-center gap-2
          text-[#98A2B3]
          text-sm font-semibold
        "
      >
        <Layers3 size={16} />

        <span>
          {roadmap.phasesCount} PHASES
        </span>
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