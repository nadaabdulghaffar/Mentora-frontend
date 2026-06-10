export interface SuggestionChip {
  label: string;
  className: string;
}

export const MENTEE_DASHBOARD_CHIPS: SuggestionChip[] = [
  { label: "How to use Mentora", className: "bg-[#fef3c7] hover:bg-[#fde68a]" },
  { label: "Recommend Mentorship program", className: "bg-[#d1fae5] hover:bg-[#a7f3d0]" },
  { label: "Recommend Mentor", className: "bg-[#ffedd5] hover:bg-[#fed7aa]" },
  { label: "Create Roadmap", className: "bg-[#fee2e2] hover:bg-[#fecaca]" },
  { label: "Study Partner", className: "bg-[#99f6e4] hover:bg-[#5eead4]" },
];

export const MENTEE_CHAT_CHIPS: SuggestionChip[] = [
  { label: "How to use Mentora", className: "bg-[#FFF9DB] text-gray-800" },
  { label: "Recommend Mentorship program", className: "bg-[#E8F5E9] text-gray-800" },
  { label: "Recommend Mentor", className: "bg-[#FFE8D6] text-gray-800" },
  { label: "Recommend materials", className: "bg-[#FCE4EC] text-gray-800" },
  { label: "Explain a topic", className: "bg-[#E0F7FA] text-gray-800" },
];

export const MENTOR_DASHBOARD_CHIPS: SuggestionChip[] = [
  { label: "Show my mentor analytics", className: "bg-[#d1fae5] hover:bg-[#a7f3d0]" },
  { label: "Recommend mentorship materials", className: "bg-[#fef3c7] hover:bg-[#fde68a]" },
  { label: "How to use Mentora", className: "bg-[#ffedd5] hover:bg-[#fed7aa]" }
];

export const MENTOR_CHAT_CHIPS: SuggestionChip[] = [
  { label: "Show my mentor analytics", className: "bg-[#E8F5E9] text-gray-800" },
  { label: "Recommend mentorship materials", className: "bg-[#FFF9DB] text-gray-800" },
  { label: "How to use Mentora", className: "bg-[#FFE8D6] text-gray-800" },
];
