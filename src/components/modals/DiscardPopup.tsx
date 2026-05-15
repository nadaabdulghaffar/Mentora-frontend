/* =========================================
FILE: src/components/modals/DiscardPopup.tsx
========================================= */

type DiscardPopupProps = {
  open: boolean;

  /* Confirm discard */
  onDiscard: () => void;

  /* Continue editing */
  onCancel: () => void;

  title?: string;
  description?: string;

  discardText?: string;
  cancelText?: string;
};

export default function DiscardPopup({
  open,
  onDiscard,
  onCancel,

  title = "Discard Changes?",
  description = "If you leave now, your progress will not be saved.",

  discardText = "Discard",
  cancelText = "Keep Editing",
}: DiscardPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Content */}
        <div className="p-7 text-center">
          <h3 className="text-2xl font-bold text-slateInk">
            {title}
          </h3>

          <p className="mt-3 text-gray-500 leading-6">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t">
          <button
            type="button"
            onClick={onDiscard}
            className="w-full h-14 text-primary font-semibold hover:bg-[#F6F3FF] transition"
          >
            {discardText}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full h-14 border-t hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}