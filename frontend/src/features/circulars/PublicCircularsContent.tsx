"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  DataListCard,
  DataListCardField,
  DataListCards,
} from "@/components/ui/DataListCard";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import {
  fetchCirculars,
  formatCircularDate,
} from "@/features/circulars/api";
import {
  DEFAULT_CIRCULAR_PAGE,
  DEFAULT_CIRCULAR_PAGE_SIZE,
  CIRCULAR_PAGE_SIZE_OPTIONS,
  type Circular,
} from "@/features/circulars/types";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function PublicCircularsContent() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_CIRCULAR_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_CIRCULAR_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCirculars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchCirculars({
        search: debouncedSearch,
        page,
        limit: pageSize,
      });

      setCirculars(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load circulars. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_CIRCULAR_PAGE);
      }

      setDebouncedSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCirculars();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCirculars]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">Circulars</h1>
          <p className="mt-2 text-sm text-brand-black-75">
            View public bank circular documents.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader title="Search Circulars" description="Search by title" />
          <CardContent>
            <Input
              label="Search"
              placeholder="Search circulars by title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Circular List"
            description={`${total} circular${total === 1 ? "" : "s"} found`}
          />
          <CardContent>
            {error ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : circulars.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">No circulars found</p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Title</TableHeaderCell>
                        <TableHeaderCell>Updated</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {circulars.map((circular) => (
                        <TableRow key={circular.id}>
                          <TableCell className="max-w-md whitespace-normal font-medium text-brand-blue">
                            {circular.title}
                          </TableCell>
                          <TableCell>{formatCircularDate(circular.updatedAt)}</TableCell>
                          <TableCell>
                            <Link href={`/circulars/view/${circular.id}`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <DataListCards className="md:hidden">
                  {circulars.map((circular) => (
                    <DataListCard
                      key={circular.id}
                      title={circular.title}
                      actions={
                        <Link href={`/circulars/view/${circular.id}`}>
                          <Button variant="outline" className="px-3 py-1.5 text-xs">
                            View
                          </Button>
                        </Link>
                      }
                    >
                      <DataListCardField
                        label="Updated"
                        value={formatCircularDate(circular.updatedAt)}
                      />
                    </DataListCard>
                  ))}
                </DataListCards>

                <Pagination
                  className="mt-4"
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  itemLabel="circulars"
                  pageSizeOptions={CIRCULAR_PAGE_SIZE_OPTIONS}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(DEFAULT_CIRCULAR_PAGE);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicPortalLayout>
  );
}
