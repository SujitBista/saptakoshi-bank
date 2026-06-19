"use client";

import { useCallback, useEffect, useState } from "react";
import { DOCUMENT_STATUSES } from "@saptakoshi/shared";
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
import { DocumentStatusBadge } from "@/features/account-opening/DocumentStatusBadge";
import type {
  AccountOpeningDocument,
  DocumentStatusFilter,
} from "@/features/account-opening/types";
import {
  DEFAULT_ACCOUNT_OPENING_PAGE,
  DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
} from "@/features/account-opening/types";
import type { Branch } from "@/features/branches/types";
import { getApiErrorMessage } from "@/lib/api-client";
import { getToken } from "@/lib/auth";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_FILTER_OPTIONS: Array<{ value: DocumentStatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: DOCUMENT_STATUSES.PENDING, label: "Pending" },
  { value: DOCUMENT_STATUSES.APPROVED, label: "Approved" },
  { value: DOCUMENT_STATUSES.REJECTED, label: "Rejected" },
];

interface DocumentReviewListProps {
  branchCode?: string;
  branchId?: number;
  branches?: Branch[];
  selectedBranchId?: number;
  onBranchChange?: (branchId: number | undefined) => void;
  reviewBasePath?: string;
  showBranchColumn?: boolean;
  refreshKey?: number;
  enabled?: boolean;
}

export function DocumentReviewList({
  branchCode,
  branchId,
  branches = [],
  selectedBranchId,
  onBranchChange,
  reviewBasePath = "/dashboard/document-review",
  showBranchColumn = false,
  refreshKey = 0,
  enabled = true,
}: DocumentReviewListProps) {
  const [documents, setDocuments] = useState<AccountOpeningDocument[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("ALL");
  const [page, setPage] = useState(DEFAULT_ACCOUNT_OPENING_PAGE);
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
        status: statusFilter === "ALL" ? undefined : statusFilter,
        branchId,
        page,
        limit: DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
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
  }, [branchId, debouncedSearch, enabled, page, statusFilter]);

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
        title="Documents"
        description={
          showBranchColumn
            ? "Review and view account opening documents across branches"
            : `Review and view account opening documents for branch ${branchCode ?? "—"}`
        }
      />
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xs flex-1">
            <label
              htmlFor="status-filter"
              className="mb-1.5 block text-sm font-medium text-brand-black"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as DocumentStatusFilter);
                setPage(DEFAULT_ACCOUNT_OPENING_PAGE);
              }}
              className="w-full rounded-lg border border-brand-black-15 bg-white px-3 py-2 text-sm text-brand-black"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {showBranchColumn && onBranchChange ? (
            <div className="max-w-xs flex-1">
              <label
                htmlFor="branch-filter"
                className="mb-1.5 block text-sm font-medium text-brand-black"
              >
                Branch
              </label>
              <select
                id="branch-filter"
                value={selectedBranchId ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onBranchChange(value ? Number(value) : undefined);
                  setPage(DEFAULT_ACCOUNT_OPENING_PAGE);
                }}
                className="w-full rounded-lg border border-brand-black-15 bg-white px-3 py-2 text-sm text-brand-black"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchCode} — {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

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
          <div className="rounded-lg border border-brand-blue-15 bg-brand-blue-05 px-4 py-6 text-center text-sm text-brand-black-75">
            <p>No documents found{branchCode ? ` for branch ${branchCode}` : ""}.</p>
            <p className="mt-2">
              Try adjusting your search or status filter. Documents remain visible
              after approval or rejection.
            </p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Document No.</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                {showBranchColumn ? (
                  <TableHeaderCell>Branch</TableHeaderCell>
                ) : null}
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Uploaded By</TableHeaderCell>
                <TableHeaderCell>Uploaded</TableHeaderCell>
                <TableHeaderCell>Reviewed By</TableHeaderCell>
                <TableHeaderCell>Reviewed At</TableHeaderCell>
                <TableHeaderCell>Rejection Remarks</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium text-brand-blue">
                    {document.documentNo}
                  </TableCell>
                  <TableCell>
                    {document.firstName} {document.lastName}
                  </TableCell>
                  {showBranchColumn ? (
                    <TableCell>
                      {document.branchCode} — {document.branchName}
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <DocumentStatusBadge status={document.status} />
                  </TableCell>
                  <TableCell>{document.uploadedByName}</TableCell>
                  <TableCell>{formatDocumentDate(document.createdAt)}</TableCell>
                  <TableCell>{document.reviewedByName ?? "—"}</TableCell>
                  <TableCell>
                    {document.reviewedAt
                      ? formatDocumentDate(document.reviewedAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {document.rejectionRemarks ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        href={`${reviewBasePath}/${document.id}`}
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                      >
                        {document.status === DOCUMENT_STATUSES.PENDING
                          ? "Review"
                          : "View"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={DEFAULT_ACCOUNT_OPENING_PAGE_SIZE}
          itemLabel="documents"
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
