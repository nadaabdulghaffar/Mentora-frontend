import { useEffect } from "react";

import Layout from "../../shared/components/Layout";

import BuilderLayout from "../../components/roadmap-builder/layout/BuilderLayout";
import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

export default function CreateRoadmapPage() {
  const startCreateSession = useRoadmapBuilderStore(
    (s) => s.startCreateSession
  );

  const roadmapId = useRoadmapBuilderStore(
    (s) => s.roadmapId
  );

  useEffect(() => {
    if (!roadmapId) {
      startCreateSession();
    }
  }, [roadmapId, startCreateSession]);

  return (
    <Layout>
      <BuilderLayout />
    </Layout>
  );
}