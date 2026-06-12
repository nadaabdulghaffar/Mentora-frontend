import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  description?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  isLoading,
  isError,
  onRetry,
  description,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group">
      {/* Decorative subtle background element */}
      <div className="absolute -right-6 -top-6 text-primary/5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
        {icon}
      </div>

      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
      </div>

      <div className="relative z-10 mt-auto">
        {isLoading ? (
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md mt-1" />
        ) : isError ? (
          <div className="flex items-center gap-2 text-red-500 mt-1">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">Failed to load</span>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="ml-auto text-xs underline hover:text-red-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold text-slateInk font-poppins">{value ?? 0}</span>
            {description && <span className="text-sm text-gray-500">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
