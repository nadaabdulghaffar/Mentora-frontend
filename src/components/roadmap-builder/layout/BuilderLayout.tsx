import BuilderStepper from "./BuilderStepper";
import BuilderFooter from "./BuilderFooter";
import BasicInfoStep from "../steps/BasicInfoStep";
import ContentStep from "../steps/ContentStep";
import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

export default function BuilderLayout() {
  const currentStep = useRoadmapBuilderStore(
    (state) => state.currentStep
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Stepper */}
      <BuilderStepper />

      {/* Content */}
      <div className="flex-1 pb-36 mt-8">
        {currentStep === 1 && <BasicInfoStep />}
        {currentStep === 2 && <ContentStep />}
      </div>

      {/* Footer */}
      <BuilderFooter />
    </div>
  );
}