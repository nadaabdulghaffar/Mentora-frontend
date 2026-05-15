import BuilderStepper from "../../components/roadmap-builder/layout/BuilderStepper";
import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";


export default function RoadmapContentStep() {
  const phases = useRoadmapBuilderStore(
    (state) => state.phases
  );

  const addPhase = useRoadmapBuilderStore(
    (state) => state.addPhase
  );

  return (
    <div className="pb-32">
      {/* Stepper */}
      <BuilderStepper />

      {/* Header */}
      <div className="mt-16 text-center">
        <h1 className="text-[42px] font-bold text-[#1F2432]">
          Build Your Roadmap
        </h1>

        <p className="mt-4 text-lg text-[#70798B] max-w-3xl mx-auto">
          Design the structural journey of your mentorship.
          Add phases, topics, and actionable milestones
          for your mentees.
        </p>
      </div>

      {/* Content */}
      <div className="mt-14 max-w-6xl mx-auto px-6">
        {/* Phases */}
        <div className="space-y-8">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className="
                rounded-[28px]
                border
                border-[#E7EAF1]
                bg-white
                p-8
                shadow-sm
              "
            >
              <h2 className="text-3xl font-bold text-[#1F2432]">
                Phase {index + 1}
              </h2>

              <p className="mt-3 text-[#7B8497]">
                Phase component will be here
              </p>
            </div>
          ))}
        </div>

        {/* Add Phase */}
        <button
         onClick={() =>
  addPhase({
    title: "New Phase",
    summary: "",
    order: phases.length + 1,
    topics: [],
  })
}
          className="
            mt-8
            w-full
            h-[120px]
            rounded-[28px]
            border-2
            border-dashed
            border-[#D9DDEA]
            bg-white
            text-[#7F8797]
            text-2xl
            font-semibold
            hover:border-primary
            hover:text-primary
            transition
          "
        >
          + Add New Phase
        </button>
      </div>

      {/* Bottom Actions */}
      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          bg-white
          border-t
          border-[#ECEFF5]
          px-10
          py-5
        "
      >
        <div className="flex items-center justify-between">
          <button className="text-[#596579] font-medium">
            Back to Basic Info
          </button>

          <div className="flex items-center gap-4">
            <button
              className="
                h-12
                px-7
                rounded-2xl
                border
                border-primary
                text-primary
                font-semibold
              "
            >
              Save Draft
            </button>

            <button
              className="
                h-12
                px-8
                rounded-2xl
                bg-primary
                text-white
                font-semibold
              "
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}