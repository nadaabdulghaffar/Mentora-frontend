import { useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

import Layout from "../../shared/components/Layout";
import BuilderLayout from "../../components/roadmap-builder/layout/BuilderLayout";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

export default function EditRoadmapPage() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const loadForEdit = useRoadmapBuilderStore((s) => s.loadForEdit);
  const isLoadingForEdit = useRoadmapBuilderStore((s) => s.isLoadingForEdit);
  const error = useRoadmapBuilderStore((s) => s.error);
  const phases = useRoadmapBuilderStore((s) => s.phases);

  const numericId = roadmapId ? Number(roadmapId) : NaN;
  const validId = Number.isFinite(numericId) && numericId > 0;

  // Guard: invalid URL param → redirect immediately
  useEffect(() => {
    if (!validId) {
      navigate("/roadmap", { replace: true });
    }
  }, [validId, navigate]);

  // Load roadmap data on mount (only when ID is valid)
  useEffect(() => {
    if (validId) {
      loadForEdit(numericId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]);

  // Loading state — prevent builder from flashing empty
  if (isLoadingForEdit) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-[#667085]">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-sm font-medium">Loading roadmap…</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state — load failed, show message + retry button
  if (error && phases.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <p className="text-[#667085] text-sm max-w-xs">{error}</p>
          <button
            onClick={() => loadForEdit(numericId)}
            className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BuilderLayout />
    </Layout>
  );
}

