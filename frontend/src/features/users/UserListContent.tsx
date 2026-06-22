"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { fetchBranches } from "@/features/branches/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import { fetchUsers, formatUserDate } from "@/features/users/api";
import { ResetPasswordDialog } from "@/features/users/ResetPasswordDialog";
import { TransferBranchDialog } from "@/features/users/TransferBranchDialog";
import { UserStatusDialog } from "@/features/users/UserStatusDialog";
import type { BranchOption, User } from "@/features/users/types";
import {
  DEFAULT_USER_PAGE,
  DEFAULT_USER_PAGE_SIZE,
  USER_PAGE_SIZE_OPTIONS,
} from "@/features/users/types";

const SEARCH_DEBOUNCE_MS = 300;

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "BRANCH_MANAGER", label: "Branch Manager" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function UserListContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    ""
  );
  const [page, setPage] = useState(DEFAULT_USER_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_USER_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUsers({
        search: debouncedSearch,
        branchId: branchFilter ? Number(branchFilter) : undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: pageSize,
      });

      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      if (data.totalPages > 0 && page > data.totalPages) {
        setPage(data.totalPages);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load users. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchFilter, debouncedSearch, page, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_USER_PAGE);
      }

      setDebouncedSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    if (!isReady) return;

    async function loadBranches() {
      try {
        const data = await fetchBranches({ limit: 100 });
        setBranchOptions(
          data.branches.map((branch) => ({
            value: String(branch.id),
            label: `${branch.branchCode} — ${branch.branchName}`,
          }))
        );
      } catch {
        setBranchOptions([]);
      }
    }

    void loadBranches();
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    void loadUsers();
  }, [isReady, loadUsers]);

  function handleClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setBranchFilter("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(DEFAULT_USER_PAGE);
  }

  function handleFilterChange(
    setter: (value: string) => void,
    value: string
  ) {
    setter(value);
    setPage(DEFAULT_USER_PAGE);
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(DEFAULT_USER_PAGE);
  }

  function openStatusDialog(targetUser: User) {
    setSelectedUser(targetUser);
    setIsStatusDialogOpen(true);
  }

  function openResetDialog(targetUser: User) {
    setSelectedUser(targetUser);
    setIsResetDialogOpen(true);
  }

  function openTransferDialog(targetUser: User) {
    setSelectedUser(targetUser);
    setIsTransferDialogOpen(true);
  }

  function handleStatusUpdated(updatedUser: User) {
    setUsers((current) =>
      current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    );
  }

  function handleTransferUpdated(updatedUser: User) {
    setUsers((current) =>
      current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    );
  }

  function canTransferUser(targetUser: User): boolean {
    return (
      targetUser.role === "EMPLOYEE" || targetUser.role === "BRANCH_MANAGER"
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
            <h1 className="text-2xl font-bold text-brand-blue">Users</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Manage staff accounts across branches
            </p>
          </div>
          <Link href="/admin/users/new">
            <Button>Add User</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader
            title="Search & Filters"
            description="Filter users by name, branch, role, or status"
          />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Input
                label="Search"
                placeholder="Name, username, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                label="Branch"
                options={[
                  { value: "", label: "All branches" },
                  ...branchOptions,
                ]}
                value={branchFilter}
                onChange={(event) =>
                  handleFilterChange(setBranchFilter, event.target.value)
                }
              />
              <Select
                label="Role"
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={(event) =>
                  handleFilterChange(setRoleFilter, event.target.value)
                }
              />
              <Select
                label="Status"
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as "" | "active" | "inactive"
                  );
                  setPage(DEFAULT_USER_PAGE);
                }}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="User List"
            description={`${total} user${total === 1 ? "" : "s"} found`}
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
            ) : users.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">No users found</p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Try adjusting your filters or add a new user.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-end gap-2">
                  <label
                    htmlFor="user-page-size"
                    className="text-sm font-medium text-brand-black-75"
                  >
                    Page size
                  </label>
                  <select
                    id="user-page-size"
                    value={String(pageSize)}
                    onChange={(event) => handlePageSizeChange(event.target.value)}
                    className="rounded-lg border border-brand-black-15 bg-white px-3 py-2 text-sm text-brand-black shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {USER_PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Full Name</TableHeaderCell>
                      <TableHeaderCell>Username</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Branch Code</TableHeaderCell>
                      <TableHeaderCell>Branch Name</TableHeaderCell>
                      <TableHeaderCell>Role</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Created Date</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-brand-blue">
                          {item.fullName}
                        </TableCell>
                        <TableCell>{item.username}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.branchCode || "—"}</TableCell>
                        <TableCell>{item.branchName || "—"}</TableCell>
                        <TableCell>{item.role}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "success" : "neutral"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatUserDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/users/${item.id}`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                View
                              </Button>
                            </Link>
                            <Link href={`/admin/users/${item.id}/edit`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => openStatusDialog(item)}
                            >
                              {item.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              variant="outline"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => openResetDialog(item)}
                            >
                              Reset Password
                            </Button>
                            {canTransferUser(item) ? (
                              <Button
                                variant="outline"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => openTransferDialog(item)}
                              >
                                Transfer Branch
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination
                  className="mt-4"
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  itemLabel="users"
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UserStatusDialog
        user={selectedUser}
        open={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleStatusUpdated}
      />

      <ResetPasswordDialog
        user={selectedUser}
        open={isResetDialogOpen}
        onClose={() => {
          setIsResetDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      <TransferBranchDialog
        user={selectedUser}
        branchOptions={branchOptions}
        open={isTransferDialogOpen}
        onClose={() => {
          setIsTransferDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleTransferUpdated}
      />
    </AdminLayout>
  );
}
