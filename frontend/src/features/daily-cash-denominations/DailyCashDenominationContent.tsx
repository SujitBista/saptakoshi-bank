"use client";

import { useCallback, useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
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
  createDailyCashDenomination,
  deleteDailyCashDenomination,
  fetchDailyCashDenominationById,
  fetchDailyCashDenominations,
  updateDailyCashDenomination,
} from "@/features/daily-cash-denominations/api";
import { DailyCashDenominationForm } from "@/features/daily-cash-denominations/DailyCashDenominationForm";
import {
  DAILY_CASH_DENOMINATION_PAGE_SIZE_OPTIONS,
  type DailyCashDenomination,
  type DailyCashDenominationFormValues,
  type DailyCashDenominationListItem,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE,
} from "@/features/daily-cash-denominations/types";
import { useTellerAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

const actionButtonClass = "rounded-md px-2 py-1 text-xs font-medium";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-NP").format(value);
}

function denominationToFormValues(
  denomination: DailyCashDenomination
): DailyCashDenominationFormValues {
  return {
    denominationDate: denomination.denominationDate,
    thousandCount: String(denomination.thousandCount),
    fiveHundredCount: String(denomination.fiveHundredCount),
    oneHundredCount: String(denomination.oneHundredCount),
    fiftyCount: String(denomination.fiftyCount),
    twentyCount: String(denomination.twentyCount),
    tenCount: String(denomination.tenCount),
    fiveCount: String(denomination.fiveCount),
    twoCount: String(denomination.twoCount),
    oneCount: String(denomination.oneCount),
    coin10Count: String(denomination.coin10Count),
    coin5Count: String(denomination.coin5Count),
    coin2Count: String(denomination.coin2Count),
    coin1Count: String(denomination.coin1Count),
    notes: denomination.notes ?? "",
  };
}

export function DailyCashDenominationContent() {
  const { user, isReady, handleLogout } = useTellerAuth();
  const [entries, setEntries] = useState<DailyCashDenominationListItem[]>([]);
  const [page, setPage] = useState(DEFAULT_DAILY_CASH_DENOMINATION_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editInitialValues, setEditInitialValues] =
    useState<DailyCashDenominationFormValues | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<DailyCashDenominationListItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    setEntriesError(null);

    try {
      const response = await fetchDailyCashDenominations({
        page,
        limit: pageSize,
      });

      setEntries(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setEntriesError(error.message);
      } else {
        setEntriesError("Unable to load denomination entries. Please try again.");
      }
    } finally {
      setIsLoadingEntries(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadEntries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isReady, loadEntries, user]);

  async function handleEntrySaved() {
    setEditingEntryId(null);
    setEditInitialValues(null);
    setEditError(null);

    if (page !== DEFAULT_DAILY_CASH_DENOMINATION_PAGE) {
      setPage(DEFAULT_DAILY_CASH_DENOMINATION_PAGE);
      return;
    }

    await loadEntries();
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(DEFAULT_DAILY_CASH_DENOMINATION_PAGE);
  }

  async function handleEditClick(entryId: number) {
    setIsEditLoading(true);
    setEditError(null);

    try {
      const denomination = await fetchDailyCashDenominationById(entryId);
      setEditingEntryId(entryId);
      setEditInitialValues(denominationToFormValues(denomination));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiError) {
        setEditError(error.message);
      } else {
        setEditError("Unable to load denomination entry for editing. Please try again.");
      }
    } finally {
      setIsEditLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditingEntryId(null);
    setEditInitialValues(null);
    setEditError(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteEntry) {
      return;
    }

    setIsDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteDailyCashDenomination(deleteEntry.id);
      setDeleteEntry(null);

      if (editingEntryId === deleteEntry.id) {
        handleCancelEdit();
      }

      if (entries.length === 1 && page > DEFAULT_DAILY_CASH_DENOMINATION_PAGE) {
        setPage((current) => Math.max(DEFAULT_DAILY_CASH_DENOMINATION_PAGE, current - 1));
        return;
      }

      await loadEntries();
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Unable to delete denomination entry. Please try again.");
      }
    } finally {
      setIsDeleteLoading(false);
    }
  }

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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">
            Daily Cash Denomination
          </h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Enter denomination counts for your assigned branch. Branch and teller
            details are captured automatically from your signed-in session.
          </p>
        </div>

        <Card>
          <CardHeader
            title={
              editingEntryId
                ? "Edit Daily Cash Denomination Entry"
                : "Daily Cash Denomination Entry Form"
            }
            description={`Branch: ${user.branchName ?? "Assigned branch"} (${user.branchCode ?? "N/A"})`}
          />
          <CardContent>
            {editError ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {editError}
              </div>
            ) : null}

            {isEditLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : (
            <DailyCashDenominationForm
              key={editingEntryId ?? "create"}
              initialValues={editInitialValues ?? undefined}
              onSubmit={(values) =>
                editingEntryId
                  ? updateDailyCashDenomination(editingEntryId, values)
                  : createDailyCashDenomination(values)
              }
              onSuccess={handleEntrySaved}
              submitLabel={editingEntryId ? "Update Denomination" : "Save Denomination"}
              successMessage={(denomination) =>
                editingEntryId
                  ? `Daily cash denomination updated successfully for ${denomination.denominationDate}.`
                  : `Daily cash denomination saved successfully for ${denomination.denominationDate}.`
              }
              onCancel={editingEntryId ? handleCancelEdit : undefined}
            />
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader
            title="Saved Denomination Entries"
            description={`${total} entr${total === 1 ? "y" : "ies"} found`}
          />
          <CardContent>
            {entriesError ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {entriesError}
              </div>
            ) : null}

            {isLoadingEntries ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">
                  No denomination entries found.
                </p>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Branch</TableHeaderCell>
                    <TableHeaderCell>Teller</TableHeaderCell>
                    <TableHeaderCell className="text-right">Total Amount</TableHeaderCell>
                    <TableHeaderCell>Created At</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.denomination_date)}</TableCell>
                      <TableCell>{entry.branch_name}</TableCell>
                      <TableCell>{entry.teller_name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(entry.total_amount)}
                      </TableCell>
                      <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className={actionButtonClass}
                            onClick={() => void handleEditClick(entry.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={actionButtonClass}
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteEntry(entry);
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
            )}

            {!isLoadingEntries ? (
              <Pagination
                className="mt-4"
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                itemLabel="entries"
                pageSizeOptions={DAILY_CASH_DENOMINATION_PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={deleteEntry !== null}
        title="Delete Denomination Entry"
        description={
          deleteEntry
            ? `Delete the denomination entry for ${formatDate(deleteEntry.denomination_date)}?`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={isDeleteLoading}
        variant="danger"
        onConfirm={() => void handleDeleteConfirm()}
        onClose={() => {
          if (isDeleteLoading) {
            return;
          }

          setDeleteEntry(null);
          setDeleteError(null);
        }}
      >
        {deleteError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {deleteError}
          </div>
        ) : null}
      </Dialog>
    </UserLayout>
  );
}
