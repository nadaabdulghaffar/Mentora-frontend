/** Builds page numbers with ellipsis for: Previous | 1 2 3 ... N | Next */
export function getPaginationPages(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis"> = [];
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };

  add(1);

  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) pages.push("ellipsis");

  for (let p = windowStart; p <= windowEnd; p += 1) add(p);

  if (windowEnd < totalPages - 1) pages.push("ellipsis");

  add(totalPages);

  return pages;
}
