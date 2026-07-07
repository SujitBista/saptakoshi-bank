"use client";

import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { createDailyCashDenomination } from "@/features/daily-cash-denominations/api";
import { DailyCashDenominationForm } from "@/features/daily-cash-denominations/DailyCashDenominationForm";
import { useTellerAuth } from "@/hooks/useUserAuth";

export function DailyCashDenominationContent() {
  const { user, isReady, handleLogout } = useTellerAuth();

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
            title="Daily Entry"
            description={`Branch: ${user.branchName ?? "Assigned branch"} (${user.branchCode ?? "N/A"})`}
          />
          <CardContent>
            <DailyCashDenominationForm onSubmit={createDailyCashDenomination} />
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
