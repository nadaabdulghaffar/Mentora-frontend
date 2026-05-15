import {
  Brain,
  Code2,
  Palette,
  BriefcaseBusiness,
} from "lucide-react";

export const ROADMAP_DOMAIN_META = {
  1: {
    bg: "bg-[#E8F3FF]",
    color: "text-[#2563EB]",
    icon: Brain,
  },
  2: {
    bg: "bg-[#ECFDF3]",
    color: "text-[#059669]",
    icon: Code2,
  },
  3: {
    bg: "bg-[#FFF4E5]",
    color: "text-[#D97706]",
    icon: Palette,
  },
  4: {
    bg: "bg-[#F3E8FF]",
    color: "text-[#7C3AED]",
    icon: BriefcaseBusiness,
  },
} as const;
