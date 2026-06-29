"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchPolicies,
  formatFileSize,
  formatPolicyDate,
} from "@/features/policies/api";
import { DeletePolicyDialog } from "@/features/policies/DeletePolicyDialog";
import {
  DEFAULT_POLICY_PAGE,
  DEFAULT_POLICY_PAGE_SIZE,
  POLICY_PAGE_SIZE_OPTIONS,
  type Policy,
} from "@/features/policies/types";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function AdminPolicyListContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_POLICY_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_POLICY_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPolicies({
        search: debouncedSearch,
        page,
        limit: pageSize,
      });

      setPolicies(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load policies. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_POLICY_PAGE);
      }

      setDebouncedSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadPolicies();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, loadPolicies]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout userEmail={user.email} userRole={user.role} onLogout={handleLogout}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Policies</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Upload and manage public-facing bank policy PDFs.
            </p>
          </div>
          <Link href="/admin/policies/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Upload Policy</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader title="Search Policies" description="Search by title" />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                label="Search"
                placeholder="Search policies by title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setPage(DEFAULT_POLICY_PAGE);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Policy Table"
            description={`${total} polic${total === 1 ? "y" : "ies"} found`}
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
            ) : policies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">No policies found</p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Upload a new policy or adjust your search.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Title</TableHeaderCell>
                        <TableHeaderCell>File Size</TableHeaderCell>
                        <TableHeaderCell>Uploaded</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {policies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="max-w-md whitespace-normal font-medium text-brand-blue">
                            {policy.title}
                          </TableCell>
                          <TableCell>{formatFileSize(policy.fileSize)}</TableCell>
                          <TableCell>{formatPolicyDate(policy.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/policies/${policy.id}`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/policies/${policy.id}/edit`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <DataListCards className="md:hidden">
                  {policies.map((policy) => (
                    <DataListCard
                      key={policy.id}
                      title={policy.title}
                      actions={
                        <>
                          <Link href={`/admin/policies/${policy.id}`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/policies/${policy.id}/edit`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      }
                    >
                      <DataListCardField
                        label="File Size"
                        value={formatFileSize(policy.fileSize)}
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
                  itemLabel="policies"
                  pageSizeOptions={POLICY_PAGE_SIZE_OPTIONS}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(DEFAULT_POLICY_PAGE);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DeletePolicyDialog
        policy={selectedPolicy}
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPolicy(null);
        }}
        onSuccess={(deletedId) => {
          setPolicies((current) => current.filter((policy) => policy.id !== deletedId));
          setTotal((current) => Math.max(0, current - 1));
        }}
      />
    </AdminLayout>
  );
}
