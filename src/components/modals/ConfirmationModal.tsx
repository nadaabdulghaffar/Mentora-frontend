/* =========================================
FILE: src/components/modals/ConfirmationModal.tsx
========================================= */

import { Loader2 } from 'lucide-react';

type ConfirmationModalProps = {
  isOpen: boolean;

  /* Confirm action */
  onConfirm: () => void;

  /* Cancel action */
  onCancel: () => void;

  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;
  
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
};

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  
  const confirmBtnClass = isDanger 
    ? "w-full h-14 text-red-600 font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    : "w-full h-14 text-[#5E4BC5] font-semibold hover:bg-[#F6F3FF] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Content */}
        <div className="p-7 text-center">
          <h3 className="text-2xl font-bold text-[#1E2330]">
            {title}
          </h3>

          <p className="mt-3 text-gray-500 leading-6">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmBtnClass}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {confirmText}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full h-14 border-t hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-[#4D5670]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
