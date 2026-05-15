import {
  useEffect,
} from "react";

import type {
  ReactNode,
} from "react";

import { createPortal } from "react-dom";

interface Props {
  open: boolean;

  onClose: () => void;

  title?: string;

  children: ReactNode;

  maxWidth?: string;
}

export default function ModalBase({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-[620px]",
}: Props) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[999]
        flex items-center justify-center
        p-4
      "
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="
          absolute inset-0
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${maxWidth}
          bg-white
          rounded-[32px]
          p-7 md:p-8
          shadow-2xl
          max-h-[90vh]
          overflow-y-auto
        `}
      >
        {title && (
          <h2
            className="
              text-[28px]
              leading-[34px]
              font-bold
              text-[#1F2432]
              mb-7
            "
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}