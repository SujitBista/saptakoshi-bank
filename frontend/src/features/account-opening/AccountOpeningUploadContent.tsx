"use client";

import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AccountOpeningDocumentList } from "@/features/account-opening/AccountOpeningDocumentList";
import { uploadAccountOpeningDocument } from "@/features/account-opening/api";
import { AccountOpeningUploadForm } from "@/features/account-opening/AccountOpeningUploadForm";
import { useEmployeeAuth } from "@/hooks/useUserAuth";

export function AccountOpeningUploadContent() {
  const { user, isReady, handleLogout } = useEmployeeAuth();
  const [listRefreshKey, setListRefreshKey] = useState(0);

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">
            Account Opening Upload
          </h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Upload account opening documents for your branch customers.
          </p>
        </div>

        <Card>
          <CardHeader
            title="Upload Document"
            description="The branch code is detected automatically from your signed-in session."
          />
          <CardContent>
            <AccountOpeningUploadForm
              branchCode={user.branchCode ?? ""}
              onSubmit={uploadAccountOpeningDocument}
              onUploadSuccess={() => setListRefreshKey((key) => key + 1)}
            />
          </CardContent>
        </Card>

        <div className="mt-8">
          <AccountOpeningDocumentList
            branchCode={user.branchCode ?? undefined}
            refreshKey={listRefreshKey}
            enabled={isReady}
          />
        </div>
      </div>
    </UserLayout>
  );
}
