import { useEffect } from "react";

import { useParams } from "react-router-dom";

import Layout from "../../shared/components/Layout";
import BuilderLayout from "../../components/roadmap-builder/layout/BuilderLayout";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

export default function EditRoadmapPage() {
  const { roadmapId } = useParams();

  const loadForEdit = useRoadmapBuilderStore((s) => s.loadForEdit);

  useEffect(() => {
    const id = roadmapId ? Number(roadmapId) : NaN;
    if (Number.isFinite(id)) {
      loadForEdit(id);
    }
  }, [loadForEdit, roadmapId]);

  return (
    <Layout>
      <BuilderLayout />
    </Layout>
  );
}

