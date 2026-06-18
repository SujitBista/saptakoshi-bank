"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
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
  DEFAULT_ACCOUNT_OPENING_PAGE,
  DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
} from "@/features/account-opening/types";
import { useUserAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function AccountOpeningDocumentListContent() {
  const { user, isReady, handleLogout } = useUserAuth();
  const [documents, setDocuments] = useState<AccountOpeningDocument[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_ACCOUNT_OPENING_PAGE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAccountOpeningDocuments({
        search: debouncedSearch,
        page,
        limit: DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
      });

      setDocuments(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      if (data.totalPages > 0 && page > data.totalPages) {
        setPage(data.totalPages);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load documents. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

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
    if (!isReady) return;
    void loadDocuments();
  }, [isReady, loadDocuments]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <UserLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-blue">Documents</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              View and manage account opening documents for your branch
            </p>
          </div>
          <Link href="/dashboard/account-opening-upload">
            <Button>Upload Document</Button>
          </Link>
        </div>

        <Card>
          <CardHeader
            title="Branch Documents"
            description={`Showing documents for branch ${user.branchCode ?? "—"}`}
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
      </div>
    </UserLayout>
  );
}
