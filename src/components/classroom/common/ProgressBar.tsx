interface ProgressBarProps {
  percentage: number;
  barFromColor: string;
  barToColor: string;
  label?: string;
}

export const ProgressBar = ({ percentage, barFromColor, barToColor, label }: ProgressBarProps) => {
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-[#71809A]">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-[#E7EBF2]">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${barFromColor} ${barToColor}`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};
