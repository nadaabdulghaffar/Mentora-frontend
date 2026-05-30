import PhaseCard from "./roadmap/PhaseCard";

type Props = {
  phases: any[];
};

export default function EmbeddedRoadmapStructure({
  phases,
}: Props) {
  return (
    <div className="space-y-6">
      {phases.map((phase) => (
        <PhaseCard
          key={phase._localId}
          phase={phase}
        />
      ))}
    </div>
  );
}