import type { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'edit' | 'delete';
  ariaLabel: string;
}

export const IconButton = ({ icon, onClick, variant = 'default', ariaLabel }: IconButtonProps) => {
  const variantStyles = {
    default: 'text-[#6F7689] hover:bg-[#F1F3F7]',
    edit: 'text-[#5B45BE] hover:bg-[#EEE8FF]',
    delete: 'text-[#B33A3A] hover:bg-[#FFE9E9]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${variantStyles[variant]}`}
    >
      {icon}
    </button>
  );
};
