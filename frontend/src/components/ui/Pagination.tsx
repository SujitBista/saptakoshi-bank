import type { HTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";

const selectClassName =
  "rounded-lg border border-brand-black-15 bg-white px-3 py-2 text-sm text-brand-black shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemLabel?: string;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className = "",
  ...props
}: PaginationProps) {
  if (total <= 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);
  const showPageControls = totalPages > 1;
  const pageSelectId = `pagination-page-select-${itemLabel}`;
  const pageSizeSelectId = `pagination-page-size-${itemLabel}`;

  return (
    <div
      className={`flex flex-col gap-4 border-t border-brand-black-15 pt-4 ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-black-75">
          Showing {start}-{end} of {total} {itemLabel}
        </p>

        {showPageControls ? (
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
        ) : null}
      </div>

      {showPageControls || pageSizeOptions?.length ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {pageSizeOptions?.length && onPageSizeChange ? (
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              <label
                htmlFor={pageSizeSelectId}
                className="text-sm font-medium text-brand-black-75"
              >
                Page size
              </label>
              <select
                id={pageSizeSelectId}
                value={String(pageSize)}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className={selectClassName}
                aria-label={`Select number of ${itemLabel} per page`}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showPageControls ? (
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              <label
                htmlFor={pageSelectId}
                className="text-sm font-medium text-brand-black-75"
              >
                Go to page
              </label>
              <select
                id={pageSelectId}
                value={String(page)}
                onChange={(event) => onPageChange(Number(event.target.value))}
                className={selectClassName}
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
