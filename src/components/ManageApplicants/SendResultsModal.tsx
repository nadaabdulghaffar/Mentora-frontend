type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SendResultsModal({
  open,
  loading,
  onClose,
  onConfirm,
}: Props) {

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center
        justify-center
        bg-black/30
      "
    >

      <div
        className="
          bg-white rounded-3xl
          p-8 w-[420px]
          shadow-2xl
        "
      >

        <h2
          className="
            text-[24px]
            font-bold text-[#1F2432]
          "
        >

          Send Results?

        </h2>

        <p
          className="
            mt-3 text-gray-500
            leading-7 text-[15px]
          "
        >

          This will notify all applicants
          about their current application
          status.

        </p>

        <div
          className="
            mt-8 flex justify-end
            gap-3
          "
        >

          {/* CANCEL */}
          <button
            onClick={onClose}
            className="
              px-5 py-2.5 rounded-xl
              border text-gray-600
              hover:bg-gray-50
            "
          >

            Cancel

          </button>

          {/* CONFIRM */}
          <button
            disabled={loading}
            onClick={onConfirm}
            className="
              px-5 py-2.5 rounded-xl
              bg-[#6D5DD3]
              text-white
              hover:opacity-90
              disabled:opacity-50
            "
          >

            {loading
              ? "Sending..."
              : "Send Results"}

          </button>

        </div>

      </div>

    </div>
  );
}