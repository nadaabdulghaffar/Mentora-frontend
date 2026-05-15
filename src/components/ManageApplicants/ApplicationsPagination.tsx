type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function ApplicationsPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex justify-between items-center text-[14px] text-gray-500 pt-4">
      <span>
        Showing {start} to {end} of {totalItems} applicants
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="w-9 h-9 rounded-full border"
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full ${currentPage === page ? 'bg-primary text-white' : 'border'}`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="w-9 h-9 border rounded-full"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}