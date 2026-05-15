import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import Layout from "../../shared/components/Layout";
import { MenteeRoadmap } from "../../components/classroom/roadmap/MenteeRoadmap";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

type ClassroomTask = {
  id: string;
  title: string;
  subtitle: string;
  status: "completed" | "pending" | "overdue";
};

function toClassroomMaterialType(value?: string): "video" | "reading" | "template" {
  if (value === "video") return "video";
  if (value === "pdf") return "reading";
  return "reading";
}

export default function RoadmapViewPage() {
  const { roadmapId } = useParams();

  const loadForView = useRoadmapBuilderStore((s) => s.loadForView);
  const isLoading = useRoadmapBuilderStore((s) => s.isSaving);
  const error = useRoadmapBuilderStore((s) => s.error);

  const basicInfo = useRoadmapBuilderStore((s) => s.basicInfo);
  const phases = useRoadmapBuilderStore((s) => s.phases);

  const [expandedPhaseIds, setExpandedPhaseIds] = useState<string[]>([]);
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([]);
  const [checkedMaterialIds, setCheckedMaterialIds] = useState<string[]>([]);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const id = roadmapId ? Number(roadmapId) : NaN;
    if (Number.isFinite(id)) {
      loadForView(id);
    }
  }, [loadForView, roadmapId]);

  const classroomPhases = useMemo(() => {
    return phases.map((phase, phaseIndex) => {
      const modules = phase.topics.map((topic, topicIndex) => ({
        id: `module-${phaseIndex + 1}-${topicIndex + 1}`,
        title: topic.title || `Module ${topicIndex + 1}`,
        subtitle: topic.summary || "",
        materials: topic.materials.map((material, materialIndex) => ({
          id: `material-${phaseIndex + 1}-${topicIndex + 1}-${materialIndex + 1}`,
          title: material.title || "Material",
          type: toClassroomMaterialType(material.materialType),
          duration: "10 min",
        })),
        tasks: topic.tasks.map((task, taskIndex) => ({
          id: `task-${phaseIndex + 1}-${topicIndex + 1}-${taskIndex + 1}`,
          title: task.title || "Task",
          subtitle: task.description || "Pending task",
          status: "pending" as const,
        })),
      }));

      const totalTasks = modules.reduce((sum, module) => sum + module.tasks.length, 0);

      return {
        id: `phase-${phaseIndex + 1}`,
        title: `PHASE ${phaseIndex + 1}`,
        subtitle: phase.title || `Phase ${phaseIndex + 1}`,
        progressLabel: `${modules.length} modules • ${totalTasks} tasks`,
        modules,
      };
    });
  }, [phases]);

  useEffect(() => {
    if (classroomPhases.length === 0) {
      setExpandedPhaseIds([]);
      setExpandedModuleIds([]);
      return;
    }

    if (expandedPhaseIds.length === 0) {
      setExpandedPhaseIds([classroomPhases[0].id]);
    }

    if (expandedModuleIds.length === 0) {
      const firstModuleId = classroomPhases[0].modules[0]?.id;
      if (firstModuleId) setExpandedModuleIds([firstModuleId]);
    }
  }, [classroomPhases, expandedModuleIds.length, expandedPhaseIds.length]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhaseIds((current) =>
      current.includes(phaseId)
        ? current.filter((id) => id !== phaseId)
        : [...current, phaseId]
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  };

  const toggleMaterialCheck = (materialId: string) => {
    setCheckedMaterialIds((current) =>
      current.includes(materialId)
        ? current.filter((id) => id !== materialId)
        : [...current, materialId]
    );
  };

  const toggleTaskCheck = (taskId: string) => {
    setCheckedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  };

  const getTaskProgressPercent = (tasks: ClassroomTask[]) => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(
      (task) => task.status === "completed" || checkedTaskIds.includes(task.id)
    ).length;
    return Math.round((completedCount / tasks.length) * 100);
  };

  return (
    <Layout>
      <div className="max-w-[1050px] mx-auto px-4 space-y-6">
        <div className="rounded-2xl border border-[#E7EBF0] bg-white p-5">
          <h2 className="text-[24px] font-bold text-[#1F2432]">{basicInfo.title || "Roadmap"}</h2>
          <p className="mt-2 text-[15px] text-[#6F7689]">{basicInfo.description || "Sharpen your skills through step-by-step challenges and expert tips."}</p>
        </div>

        {/* Loading / Error */}
        {isLoading ? (
          <div className="text-center py-14 text-[#667085]">
            Loading roadmap...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 font-medium">{error}</div>
        ) : null}

        {!isLoading && !error && (
          <div className="space-y-6">
            <MenteeRoadmap
              phases={classroomPhases}
              expandedPhaseIds={expandedPhaseIds}
              expandedModuleIds={expandedModuleIds}
              checkedMaterialIds={checkedMaterialIds}
              checkedTaskIds={checkedTaskIds}
              onTogglePhase={togglePhase}
              onToggleModule={toggleModule}
              onToggleMaterial={toggleMaterialCheck}
              onToggleTask={toggleTaskCheck}
              getTaskProgressPercent={getTaskProgressPercent}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

