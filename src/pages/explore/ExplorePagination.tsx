import { getPaginationPages } from "./getPaginationPages";

type Props = {
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
};

export default function ExplorePagination({
  pageNumber,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = getPaginationPages(pageNumber, totalPages);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(pageNumber - 1)}
        className="rounded-lg border border-[#DFE3ED] bg-white px-4 py-2 text-sm font-medium text-[#3D4559] transition hover:bg-[#F7F8FB] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-[#8A92A6]"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-semibold transition ${
              page === pageNumber
                ? "bg-primary text-white shadow-sm"
                : "border border-[#DFE3ED] bg-white text-[#3D4559] hover:bg-[#F7F8FB]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(pageNumber + 1)}
        className="rounded-lg border border-[#DFE3ED] bg-white px-4 py-2 text-sm font-medium text-[#3D4559] transition hover:bg-[#F7F8FB] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
