import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

const steps = [
  {
    id: 1,
    title: "BASIC INFO",
  },
  {
    id: 2,
    title: "CONTENT",
  },
] as const;

export default function BuilderStepper() {
  const currentStep =
    useRoadmapBuilderStore(
      (state) => state.currentStep
    );

  return (
    <div className="w-full flex justify-center pt-8 px-4">
      <div className="w-full max-w-[950px] flex items-center">
        {steps.map((step, index) => {
          const isActive =
            currentStep === step.id;

          const isCompleted =
            currentStep > step.id;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1"
            >
              {/* Step */}
              <div className="flex flex-col items-center min-w-fit">
                <div
                  className={`
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    text-sm font-semibold
                    transition-all

                    ${
                      isActive ||
                      isCompleted
                        ? "bg-primary text-white"
                        : "bg-[#EEF1F6] text-[#9AA3B2]"
                    }
                  `}
                >
                  {step.id}
                </div>

                <span
                  className={`
                    mt-3 text-[11px]
                    font-semibold tracking-wide

                    hidden sm:block

                    ${
                      isActive ||
                      isCompleted
                        ? "text-primary"
                        : "text-[#A3ACBB]"
                    }
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Line */}
              {index !==
                steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-[1.5px]
                    mx-4 mb-6

                    ${
                      isCompleted
                        ? "bg-primary"
                        : "bg-[#D9DEE8]"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}