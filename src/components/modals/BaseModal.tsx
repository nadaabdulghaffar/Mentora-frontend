/* =========================================
FILE: src/components/modals/BaseModal.tsx
========================================= */

import {
  type ReactNode,
  useState,
} from "react";
import { X } from "lucide-react";
import DiscardPopup from "./DiscardPopup";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;

  /* Called only when user confirms discard */
  onDiscard?: () => void;

  title: string;
  subtitle?: string;

  width?: string;

  hasChanges?: boolean;

  children: ReactNode;
  footer?: ReactNode;

  headerExtra?: ReactNode;
};

export default function BaseModal({
  isOpen,
  onClose,
  onDiscard,

  title,
  subtitle,

  width = "lg:max-w-4xl",

  hasChanges = false,

  children,
  footer,
  headerExtra,
}: BaseModalProps) {
  const [showDiscard, setShowDiscard] =
    useState(false);

  if (!isOpen) return null;

  /* =========================
     CLOSE REQUEST
  ========================= */

  const requestClose = () => {
    if (hasChanges) {
      setShowDiscard(true);
      return;
    }

    onClose();
  };

  /* =========================
     CONFIRM DISCARD
  ========================= */

  const confirmDiscard = () => {
    setShowDiscard(false);

    if (onDiscard) {
      onDiscard();
      return;
    }

    onClose();
  };

  /* =========================
     CANCEL DISCARD
  ========================= */

  const cancelDiscard = () => {
    setShowDiscard(false);
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={requestClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4 py-4"
      >
        {/* DESKTOP X */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            requestClose();
          }}
          className="hidden lg:flex fixed top-6 right-6 w-12 h-12 rounded-full bg-white shadow-2xl items-center justify-center hover:bg-gray-100 z-[70]"
        >
          <X size={24} />
        </button>

        {/* MOBILE X */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            requestClose();
          }}
          className="lg:hidden fixed top-4 right-4 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center z-[70]"
        >
          <X size={22} />
        </button>

        {/* MODAL */}
        <div className={`w-full ${width}`}>
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-h-[90vh] bg-white lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HEADER */}
            <div className="border-b px-4 sm:px-6 md:px-8 py-5 shrink-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slateInk">
                {title}
              </h2>

              {subtitle && (
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                  {subtitle}
                </p>
              )}

              {headerExtra}
            </div>

            {/* BODY */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-5">
              {children}
            </div>

            {/* FOOTER */}
            {footer && (
              <div className="border-t bg-white px-4 sm:px-6 md:px-8 py-4 shrink-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISCARD POPUP */}
      <DiscardPopup
        open={showDiscard}
        onDiscard={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}