const badgeToneClasses = {
  danger: 'bg-[#FFE7E7] text-[#B02D2D]',
  success: 'bg-[#D9F6EE] text-[#0E7A5F]',
  neutral: 'bg-[#EEE8FF] text-[#5E48C3]',
};

type TaskBadgeProps = {
  label: string;
  tone: keyof typeof badgeToneClasses;
};

const TaskBadge = ({ label, tone }: TaskBadgeProps) => (
  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeToneClasses[tone]}`}>{label}</span>
);

export default TaskBadge;
