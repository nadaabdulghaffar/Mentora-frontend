import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'task';
  ariaLabel?: string;
}

export const Checkbox = ({ checked, onChange, variant = 'default', ariaLabel }: CheckboxProps) => {
  const baseClasses = 'flex shrink-0 items-center justify-center rounded-md border-2 transition';
  
  const variantStyles = {
    default: {
      checked: 'border-[#6E56CF] bg-[#EEE8FF] text-[#6E56CF]',
      unchecked: 'border-[#C9D4EA] text-[#8B95A8]',
    },
    task: {
      checked: 'border-[#0E7A5F] bg-[#DDF6F0] text-[#0E7A5F]',
      unchecked: 'border-[#C9D4EA] text-[#8B95A8]',
    },
  };

  const style = variantStyles[variant];
  const classes = `${baseClasses} ${checked ? style.checked : style.unchecked}`;

  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      aria-label={ariaLabel}
      className={`${classes} h-7 w-7`}
    >
      {checked && <Check size={14} strokeWidth={2.5} />}
    </button>
  );
};
