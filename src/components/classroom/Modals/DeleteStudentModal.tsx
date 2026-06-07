import { ClassroomUserLink } from '../common/ClassroomUserLink';

type Props = {
  open: boolean;
  loading?: boolean;
  studentName?: string;
  studentId?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteStudentModal({
  open,
  loading,
  studentName,
  studentId,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[420px] rounded-3xl bg-white p-8 shadow-2xl">
        <h2 className="text-[24px] font-bold text-[#1F2432]">Remove Student?</h2>

        <p className="mt-3 text-[15px] leading-7 text-gray-500">
          Are you sure you want to remove
          {studentName ? (
            <>
              {' '}
              <ClassroomUserLink
                userId={studentId}
                name={studentName}
                className="font-semibold text-[#1F2432]"
              />
            </>
          ) : null}{' '}
          from this classroom? This action cannot be undone.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-5 py-2.5 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-[#DC2626] px-5 py-2.5 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Removing...' : 'Remove Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
