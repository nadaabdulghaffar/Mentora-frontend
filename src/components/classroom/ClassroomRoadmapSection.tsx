import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import EmbeddedRoadmapStructure from "../roadmap-builder/EmbeddedRoadmapStructure";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

type ClassroomRoadmapSectionProps = {
  roadmapId?: number | null;
  isMentor?: boolean;
};

const ClassroomRoadmapSection = ({
  roadmapId,
  isMentor = false,
}: ClassroomRoadmapSectionProps) => {

  const navigate = useNavigate();

  const loadForView =
    useRoadmapBuilderStore(
      (s) => s.loadForView
    );

  const phases =
    useRoadmapBuilderStore(
      (s) => s.phases
    );

    useEffect(() => {

  console.log(
    "ROADMAP PHASES UPDATED:",
    phases
  );

}, [phases]);

    const collapseAll =
  useRoadmapBuilderStore(
    (s) => s.collapseAll
  );

const expandAll =
  useRoadmapBuilderStore(
    (s) => s.expandAll
  );


  const isLoading =
    useRoadmapBuilderStore(
      (s) => s.isSaving
    );

  const error =
    useRoadmapBuilderStore(
      (s) => s.error
    );

  // roadmap loading is handled at the page level (ClassroomPageRefactored)

  if (!roadmapId) {

    return (
      <section className="space-y-5">

        <div
          className="
            rounded-2xl
            border border-dashed
            border-[#D7DBE7]
            bg-white
            p-10
            text-center
          "
        >

          <h3
            className="
              text-lg
              font-semibold
              text-[#1F2432]
            "
          >
            No roadmap attached yet
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-[#667085]
            "
          >
            This classroom does not
            have a roadmap linked yet.
          </p>

        </div>

        

      </section>
    );
  }

  return (

    <section className="space-y-5">

      <div
        className="
          flex items-center
          justify-between
          gap-4
          flex-wrap
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-[#1F2432]
            "
          >
            Learning Roadmap
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[#667085]
            "
          >
            Follow the roadmap structure
            and complete the required tasks.
          </p>

        </div>
        

        {isMentor && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/roadmap/${roadmapId}/edit`

              )
            }
            className="
              rounded-xl
              bg-[#5E4BC5]
              px-5 py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#4F3DB0]
            "
          >
            Edit Roadmap
          </button>
        )}

      </div>
<div
  className="
    flex items-center
    justify-between
    gap-4
    flex-wrap
  "
>

  <h3
    className="
      text-lg
      font-semibold
      text-[#1F2432]
    "
  >
  </h3>

  <div
    className="
      flex items-center
      gap-3
    "
  >

    <button
      onClick={expandAll}
      className="
        text-[#5E4BC5]
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
        text-[#5E4BC5]
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
      {isLoading ? (

        <div
          className="
            rounded-2xl
            bg-white
            p-10
            text-center
            text-[#667085]
          "
        >
          Loading roadmap...
        </div>

      ) : error ? (

        <div
          className="
            rounded-2xl
            bg-white
            p-6
            text-sm
            font-medium
            text-red-600
          "
        >
          {error}
        </div>

      ) : (

        <EmbeddedRoadmapStructure
          phases={phases}
        />

      )}

    </section>
  );
};

export default ClassroomRoadmapSection;