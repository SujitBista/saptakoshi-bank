"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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
  fetchAccountOpeningDocuments,
  formatDocumentDate,
} from "@/features/account-opening/api";
import type { AccountOpeningDocument } from "@/features/account-opening/types";
import {
  ACCOUNT_OPENING_PAGE_SIZE_OPTIONS,
  DEFAULT_ACCOUNT_OPENING_PAGE,
  DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
} from "@/features/account-opening/types";
import { getApiErrorMessage } from "@/lib/api-client";
import { getToken } from "@/lib/auth";

const SEARCH_DEBOUNCE_MS = 300;

interface AccountOpeningDocumentListProps {
  branchCode?: string;
  refreshKey?: number;
  enabled?: boolean;
}

export function AccountOpeningDocumentList({
  branchCode,
  refreshKey = 0,
  enabled = true,
}: AccountOpeningDocumentListProps) {
  const [documents, setDocuments] = useState<AccountOpeningDocument[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_ACCOUNT_OPENING_PAGE);
  const [pageSize, setPageSize] = useState<number>(
    DEFAULT_ACCOUNT_OPENING_PAGE_SIZE
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!enabled || !getToken()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAccountOpeningDocuments({
        search: debouncedSearch,
        page,
        limit: pageSize,
      });

      setDocuments(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);

      if ((data.totalPages ?? 0) > 0 && page > (data.totalPages ?? 0)) {
        setPage(data.totalPages ?? DEFAULT_ACCOUNT_OPENING_PAGE);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to load documents. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, enabled, page, pageSize]);

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(DEFAULT_ACCOUNT_OPENING_PAGE);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_ACCOUNT_OPENING_PAGE);
      }

      setDebouncedSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadDocuments();
  }, [enabled, loadDocuments, refreshKey]);

  return (
    <Card>
      <CardHeader
        title="Branch Documents"
        description={`Showing documents for branch ${branchCode ?? "—"}`}
      />
      <CardContent className="space-y-5">
        <Input
          label="Search"
          placeholder="Search by name, citizen no., mobile, client code, or document no."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
          </div>
        ) : documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-black-50">
            No documents found.
          </p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Document No.</TableHeaderCell>
                <TableHeaderCell>Client Code</TableHeaderCell>
                <TableHeaderCell>Customer Name</TableHeaderCell>
                <TableHeaderCell>Citizen No.</TableHeaderCell>
                <TableHeaderCell>Mobile</TableHeaderCell>
                <TableHeaderCell>Uploaded</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium text-brand-blue">
                    {document.documentNo}
                  </TableCell>
                  <TableCell>{document.clientCode}</TableCell>
                  <TableCell>
                    {document.firstName} {document.lastName}
                  </TableCell>
                  <TableCell>{document.citizenNo}</TableCell>
                  <TableCell>{document.mobileNumber}</TableCell>
                  <TableCell>{formatDocumentDate(document.createdAt)}</TableCell>
                  <TableCell>{document.status}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/account-opening-documents/${document.id}`}>
                        <Button variant="outline" className="px-3 py-1.5 text-xs">
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/account-opening-documents/${document.id}/edit`}
                      >
                        <Button className="px-3 py-1.5 text-xs">Edit</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading ? (
          <Pagination
            className="mt-4"
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            itemLabel="documents"
            pageSizeOptions={ACCOUNT_OPENING_PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
