import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import RoadmapSelectionField from "../../create-program/RoadmapSelectionField";
import { classroomService } from "../../../services/classroomService";

type ChooseRoadmapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  subDomainId: number;
  onSuccess: (roadmapId: number) => void;
};

export default function ChooseRoadmapModal({
  isOpen,
  onClose,
  programId,
  subDomainId,
  onSuccess,
}: ChooseRoadmapModalProps) {
  const navigate = useNavigate();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoadmapId(null);
      setSubmitAttempted(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const selectionError =
    submitAttempted && !selectedRoadmapId
      ? "Please select a roadmap."
      : null;

  const handleCreateNewRoadmap = () => {
    navigate(
      `/roadmap/create?programId=${programId}&returnTo=${encodeURIComponent(`/classroom/${programId}`)}`
    );
    onClose();
  };

  const handleSave = async () => {
    setSubmitAttempted(true);

    if (!selectedRoadmapId) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await classroomService.attachRoadmapToProgram(
        programId,
        selectedRoadmapId
      );

      if (response?.success === false) {
        throw new Error(response?.message || "Failed to attach roadmap.");
      }

      toast.success("Roadmap attached to this classroom.");
      onSuccess(selectedRoadmapId);
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to attach roadmap."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="choose-roadmap-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="choose-roadmap-title"
              className="text-xl font-bold text-[#1F2432]"
            >
              Choose Roadmap
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Select a published roadmap that matches this program&apos;s
              sub-domain.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F4F6FA]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {subDomainId < 1 ? (
          <p className="text-sm text-amber-700">
            Unable to load compatible roadmaps for this program. Try refreshing
            the page.
          </p>
        ) : (
          <RoadmapSelectionField
            subDomainId={subDomainId}
            value={selectedRoadmapId}
            onChange={setSelectedRoadmapId}
            allowEmpty={false}
            emptyOptionLabel="Select a roadmap"
            showCreateLink
            onCreateNewRoadmap={handleCreateNewRoadmap}
            className="w-full rounded-xl border border-[#E6E9F2] bg-[#F4F6FA] px-4 py-3 text-sm text-[#1F2432] outline-none transition focus:border-[#5E4BC5] focus:bg-white"
          />
        )}

        {selectionError && (
          <p className="mt-2 text-sm font-medium text-red-600">{selectionError}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-[#D6DBE8] bg-white px-5 py-3 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F7F8FB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#5E4BC5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F3DB0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Attach Roadmap"}
          </button>
        </div>
      </div>
    </div>
  );
}
