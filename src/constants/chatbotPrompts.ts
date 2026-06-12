export interface SuggestionChip {
  label: string;
  className: string;
}

export const MENTEE_DASHBOARD_CHIPS: SuggestionChip[] = [
  { label: "How to find my programs?", className: "bg-[#fef3c7] hover:bg-[#fde68a]" },
  { label: "Recommend mentorship program", className: "bg-[#d1fae5] hover:bg-[#a7f3d0]" },
  { label: "Help me find materials", className: "bg-[#ffedd5] hover:bg-[#fed7aa]" },
  { label: "Create roadmap", className: "bg-[#fee2e2] hover:bg-[#fecaca]" },
];

export const MENTEE_CHAT_CHIPS: SuggestionChip[] = [
  { label: "How to find my programs?", className: "bg-[#FFF9DB] text-gray-800" },
  { label: "Recommend mentorship program", className: "bg-[#E8F5E9] text-gray-800" },
  { label: "Help me find materials", className: "bg-[#FFE8D6] text-gray-800" },
  { label: "Create roadmap", className: "bg-[#FCE4EC] text-gray-800" },
];

export const MENTOR_DASHBOARD_CHIPS: SuggestionChip[] = [
  { label: "What's my programs", className: "bg-[#d1fae5] hover:bg-[#a7f3d0]" },
  { label: "How to create a program", className: "bg-[#fef3c7] hover:bg-[#fde68a]" },
  { label: "Find materials", className: "bg-[#ffedd5] hover:bg-[#fed7aa]" }
];

export const MENTOR_CHAT_CHIPS: SuggestionChip[] = [
  { label: "What's my programs", className: "bg-[#E8F5E9] text-gray-800" },
  { label: "How to create a program", className: "bg-[#FFF9DB] text-gray-800" },
  { label: "Find materials", className: "bg-[#FFE8D6] text-gray-800" },
];
