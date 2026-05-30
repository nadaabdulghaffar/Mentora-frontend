type Props = {
  open: boolean;
  loading?: boolean;
  studentName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteStudentModal({
  open,
  loading,
  studentName,
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

Remove Student?
        </h2>

        <p
  className="
    mt-3 text-gray-500
    leading-7 text-[15px]
  "
>
  Are you sure you want to remove

  <span className="font-semibold text-[#1F2432]">
    {" "}
    {studentName}
  </span>

  {" "}from this classroom?

  This action cannot be undone.
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
bg-[#DC2626]
              text-white
              hover:opacity-90
              disabled:opacity-50
            "
          >

            {loading
              ? "Removing..."
              : "Remove Student"}

          </button>

        </div>

      </div>

    </div>
  );
}