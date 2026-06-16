"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import { fetchBranches, formatBranchDate } from "@/features/branches/api";
import { DisableBranchDialog } from "@/features/branches/DisableBranchDialog";
import type { Branch, BranchPagination } from "@/features/branches/types";
import { DEFAULT_BRANCH_PAGE, DEFAULT_BRANCH_PAGE_SIZE } from "@/features/branches/types";

const INITIAL_PAGINATION: BranchPagination = {
  page: DEFAULT_BRANCH_PAGE,
  limit: DEFAULT_BRANCH_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

const SEARCH_DEBOUNCE_MS = 300;

export function BranchListContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchCodeSearch, setBranchCodeSearch] = useState("");
  const [branchNameSearch, setBranchNameSearch] = useState("");
  const [debouncedBranchCode, setDebouncedBranchCode] = useState("");
  const [debouncedBranchName, setDebouncedBranchName] = useState("");
  const [page, setPage] = useState(DEFAULT_BRANCH_PAGE);
  const [pagination, setPagination] = useState<BranchPagination>(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBranches({
        branchCode: debouncedBranchCode,
        branchName: debouncedBranchName,
        page,
        limit: DEFAULT_BRANCH_PAGE_SIZE,
      });
      setBranches(data.branches);
      setPagination(data.pagination);

      if (data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
        setPage(data.pagination.totalPages);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load branches. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedBranchCode, debouncedBranchName, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextCode = branchCodeSearch.trim();
      const nextName = branchNameSearch.trim();

      if (nextCode !== debouncedBranchCode || nextName !== debouncedBranchName) {
        setPage(DEFAULT_BRANCH_PAGE);
      }

      setDebouncedBranchCode(nextCode);
      setDebouncedBranchName(nextName);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    branchCodeSearch,
    branchNameSearch,
    debouncedBranchCode,
    debouncedBranchName,
  ]);

  useEffect(() => {
    if (!isReady) return;
    void loadBranches();
  }, [isReady, loadBranches]);

  function handleClearSearch() {
    setBranchCodeSearch("");
    setBranchNameSearch("");
    setDebouncedBranchCode("");
    setDebouncedBranchName("");
    setPage(DEFAULT_BRANCH_PAGE);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function openStatusDialog(branch: Branch) {
    setSelectedBranch(branch);
    setIsDialogOpen(true);
  }

  function handleStatusUpdated(updatedBranch: Branch) {
    setBranches((current) =>
      current.map((branch) =>
        branch.id === updatedBranch.id ? updatedBranch : branch
      )
    );
  }

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-blue">Branches</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Manage bank branches across the network
            </p>
          </div>
          <Link href="/admin/branches/new">
            <Button>Add Branch</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader
            title="Search Branches"
            description="Filter by branch code or branch name as you type"
          />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Input
                label="Branch Code"
                placeholder="Search by code"
                value={branchCodeSearch}
                onChange={(event) => setBranchCodeSearch(event.target.value)}
              />
              <Input
                label="Branch Name"
                placeholder="Search by name"
                value={branchNameSearch}
                onChange={(event) => setBranchNameSearch(event.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={handleClearSearch}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Branch List"
            description={`${pagination.total} branch${pagination.total === 1 ? "" : "es"} found`}
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
            ) : branches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">No branches found</p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Try adjusting your search or add a new branch.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Branch Code</TableHeaderCell>
                      <TableHeaderCell>Branch Name</TableHeaderCell>
                      <TableHeaderCell>Address</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Created Date</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium text-brand-blue">
                          {branch.branchCode}
                        </TableCell>
                        <TableCell>{branch.branchName}</TableCell>
                        <TableCell className="max-w-xs whitespace-normal">
                          {branch.address || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={branch.isActive ? "success" : "neutral"}>
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatBranchDate(branch.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/branches/${branch.id}/edit`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/admin/branches/${branch.id}`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => openStatusDialog(branch)}
                            >
                              {branch.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination
                  className="mt-4"
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DisableBranchDialog
        branch={selectedBranch}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedBranch(null);
        }}
        onSuccess={handleStatusUpdated}
      />
    </AdminLayout>
  );
}
