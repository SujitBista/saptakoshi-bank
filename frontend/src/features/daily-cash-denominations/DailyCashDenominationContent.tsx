"use client";

import { useCallback, useEffect, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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
  fetchDailyCashDenominations,
} from "@/features/daily-cash-denominations/api";
import { DailyCashDenominationForm } from "@/features/daily-cash-denominations/DailyCashDenominationForm";
import type { DailyCashDenominationListItem } from "@/features/daily-cash-denominations/types";
import {
  DAILY_CASH_DENOMINATION_PAGE_SIZE_OPTIONS,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE,
} from "@/features/daily-cash-denominations/types";
import { useTellerAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

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

export function DailyCashDenominationContent() {
  const { user, isReady, handleLogout } = useTellerAuth();
  const [entries, setEntries] = useState<DailyCashDenominationListItem[]>([]);
  const [page, setPage] = useState(DEFAULT_DAILY_CASH_DENOMINATION_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

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
            title="Daily Cash Denomination Entry Form"
            description={`Branch: ${user.branchName ?? "Assigned branch"} (${user.branchCode ?? "N/A"})`}
          />
          <CardContent>
            <DailyCashDenominationForm
              onSubmit={createDailyCashDenomination}
              onSuccess={handleEntrySaved}
            />
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
    </UserLayout>
  );
}
