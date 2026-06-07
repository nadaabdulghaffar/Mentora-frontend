import { useLocation, useNavigate } from "react-router-dom";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";
import { classroomService } from "../../../services/classroomService";

export default function BuilderFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useRoadmapBuilderStore((state) => state.mode);

  const roadmapStatus = useRoadmapBuilderStore(
    (state) => state.basicInfo.status
  );

  const currentStep = useRoadmapBuilderStore(
    (state) => state.currentStep
  );

  const previousStep = useRoadmapBuilderStore(
    (state) => state.previousStep
  );

  const setCurrentStep = useRoadmapBuilderStore(
    (state) => state.setCurrentStep
  );

  const resetStore = useRoadmapBuilderStore(
    (state) => state.resetStore
  );

  const saveBasicInfo = useRoadmapBuilderStore(
    (state) => state.saveBasicInfo
  );

  const saveDraft = useRoadmapBuilderStore(
    (state) => state.saveDraft
  );

  const publishRoadmap = useRoadmapBuilderStore(
    (state) => state.publishRoadmap
  );

  const roadmapId = useRoadmapBuilderStore(
    (state) => state.roadmapId
  );

  const isSaving = useRoadmapBuilderStore(
    (state) => state.isSaving
  );

  const isPublishing = useRoadmapBuilderStore(
    (state) => state.isPublishing
  );

  const isDirty = useRoadmapBuilderStore(
    (state) => state.isDirty
  );

  /* ========================================
     HANDLERS
  ======================================== */

  const handleCancelEdit = () => {
    resetStore();
    navigate("/roadmap");
  };

  const handleSaveChanges = async () => {
    return await saveDraft();
  };

  /** Step 1 "Next" */
  const handleNext = async () => {

  const ok =
    await saveBasicInfo();

  if (!ok) return;

  setCurrentStep(2);
};

  /** Publish */
  const handlePublish = async () => {
    const ok = await publishRoadmap();

    if (ok) {
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get("returnTo");
      const programId = Number(searchParams.get("programId"));

      if (roadmapId && Number.isInteger(programId) && programId > 0) {
        try {
          await classroomService.attachRoadmapToProgram(programId, roadmapId);
          navigate(returnTo || `/classroom/${programId}`, {
            replace: true,
            state: { initialTab: "roadmap" },
          });
          return;
        } catch (error) {
          console.error("Failed to link roadmap to classroom", error);
        }
      }

      if (returnTo) {
        navigate(returnTo, {
          replace: true,
          state: {
            reopenCreateProgram: true,
            pendingRoadmapId: roadmapId ?? null,
          },
        });
        return;
      }

      navigate("/roadmap");
    }
  };

  const anyBusy =
    isSaving || isPublishing;

  /* ========================================
     RENDER
  ======================================== */

  return (
    <div
      className="
        fixed bottom-0
        left-0 lg:left-[256px]
        right-0
        bg-white
        border-t border-[#E7EAF1]
        z-50
      "
    >
      {/* Buttons row */}
      <div className="h-[76px] px-4 lg:px-10 flex items-center justify-between">
        {mode === "edit" ? (
          <>
            {/* LEFT SIDE */}
            <div>
              {currentStep === 2 ? (
                <button
                  onClick={previousStep}
                  disabled={anyBusy}
                  className="
                    text-sm font-medium
                    text-[#5B6474]
                    hover:text-primary
                    transition
                    disabled:opacity-50
                  "
                >
                  Back
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
              {/* Cancel */}
              <button
                id="builder-edit-cancel"
                onClick={() => {
                  if (isDirty) {
                    const ok = window.confirm(
                      "You have unsaved changes. Cancel and discard them?"
                    );

                    if (!ok) return;
                  }

                  handleCancelEdit();
                }}
                disabled={anyBusy}
                className="
                  h-11 px-6 rounded-2xl
                  border border-[#D0D5DD]
                  text-[#475467]
                  text-sm font-semibold
                  hover:bg-[#F2F4F7]
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>

                {/* Save Changes */}
              <button
                id="builder-edit-save"
                disabled={anyBusy}
                onClick={async () => {
                  const ok =
                    await handleSaveChanges();

                  if (ok) {
                    navigate("/roadmap");
                  }
                }}
                className="
                  h-11 px-6 rounded-2xl
                  border-2 border-primary
                  text-primary
                  text-sm font-semibold
                  hover:bg-primary hover:text-white
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isSaving
                  ? "Saving…"
                  : "Save Changes"}
              </button>

               {/* Publish */}
              {roadmapStatus !== "Published" && (
                <button
                  id="builder-edit-publish"
                  onClick={handlePublish}
                  disabled={anyBusy}
                  className="
                    h-11 px-6 rounded-2xl
                    bg-primary text-white
                    text-sm font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isPublishing
                    ? "Publishing…"
                    : "Publish"}
                </button>
              )}

              {/* Step 1 only → Next */}
              {currentStep === 1 && (
                <button
                  id="builder-edit-next"
                  onClick={handleNext}
                  disabled={anyBusy}
                  className="
                    h-11 px-6 rounded-2xl
                    bg-primary text-white
                    text-sm font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* LEFT SIDE */}
            <div>
              {currentStep > 1 && (
                <button
                  onClick={previousStep}
                  disabled={anyBusy}
                  className="
                    text-sm font-medium
                    text-[#5B6474]
                    hover:text-primary
                    transition
                    disabled:opacity-50
                  "
                >
                  Back to Basic Info
                </button>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
              {/* Step 2 → Publish */}
              {currentStep === 2 ? (
                <button
                  id="builder-footer-publish"
                  onClick={handlePublish}
                  disabled={anyBusy}
                  className="
                    h-11 px-6 rounded-2xl
                    bg-primary text-white
                    text-sm font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isPublishing
                    ? "Publishing…"
                    : "Publish"}
                </button>
              ) : (
                /* Step 1 → Next */
                <button
                  id="builder-footer-next"
                  onClick={handleNext}
                  disabled={anyBusy}
                  className="
                    h-11 px-6 rounded-2xl
                    bg-primary text-white
                    text-sm font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isSaving
                    ? "Saving…"
                    : "Next"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}