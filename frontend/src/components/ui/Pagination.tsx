import type { HTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  itemLabel = "items",
  onPageChange,
  className = "",
  ...props
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div
      className={`flex flex-col gap-4 border-t border-brand-black-15 pt-4 ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-black-75">
          Showing {start}-{end} of {total} {itemLabel}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5 text-xs"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? "primary" : "outline"}
              className="min-w-9 px-3 py-1.5 text-xs"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5 text-xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <label
          htmlFor="pagination-page-select"
          className="text-sm font-medium text-brand-black-75"
        >
          Go to page
        </label>
        <select
          id="pagination-page-select"
          value={String(page)}
          onChange={(event) => onPageChange(Number(event.target.value))}
          className="rounded-lg border border-brand-black-15 bg-white px-3 py-2 text-sm text-brand-black shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Select page number"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <option key={pageNumber} value={pageNumber}>
                Page {pageNumber} of {totalPages}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}
