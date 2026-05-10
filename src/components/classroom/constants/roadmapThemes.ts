export type PhaseTheme = {
  accent: string;
  badgeBg: string;
  badgeText: string;
  barFrom: string;
  barTo: string;
  panelBorder: string;
  panelBg: string;
  moduleBg: string;
};

export const PHASE_THEMES: PhaseTheme[] = [
  {
    accent: 'text-[#5E48C3]',
    badgeBg: 'bg-[#ECE9FB]',
    badgeText: 'text-[#5E48C3]',
    barFrom: 'from-[#7A67D4]',
    barTo: 'to-[#6E56CF]',
    panelBorder: 'border-[#E6E9F2]',
    panelBg: 'bg-[#F9F7FF]',
    moduleBg: 'bg-white',
  },
  {
    accent: 'text-[#49B1A2]',
    badgeBg: 'bg-[#E1F7F3]',
    badgeText: 'text-[#0E7A5F]',
    barFrom: 'from-[#49B1A2]',
    barTo: 'to-[#0E7A5F]',
    panelBorder: 'border-[#D0E8E3]',
    panelBg: 'bg-[#F5FFFE]',
    moduleBg: 'bg-white',
  },
  {
    accent: 'text-[#D97706]',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#B45309]',
    barFrom: 'from-[#F59E0B]',
    barTo: 'to-[#D97706]',
    panelBorder: 'border-[#FED7AA]',
    panelBg: 'bg-[#FFFBF0]',
    moduleBg: 'bg-white',
  },
];
