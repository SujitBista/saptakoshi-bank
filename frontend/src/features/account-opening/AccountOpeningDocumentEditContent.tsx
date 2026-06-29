"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_STATUSES } from "@saptakoshi/shared";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AccountOpeningEditForm } from "@/features/account-opening/AccountOpeningEditForm";
import {
  fetchAccountOpeningDocumentById,
  updateAccountOpeningDocument,
} from "@/features/account-opening/api";
import type {
  AccountOpeningDocument,
  AccountOpeningEditFormValues,
} from "@/features/account-opening/types";
import { useMakerAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

interface AccountOpeningDocumentEditContentProps {
  documentId: number;
}

export function AccountOpeningDocumentEditContent({
  documentId,
}: AccountOpeningDocumentEditContentProps) {
  const router = useRouter();
  const { user, isReady, handleLogout } = useMakerAuth();
  const [document, setDocument] = useState<AccountOpeningDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadDocument() {
      try {
        const data = await fetchAccountOpeningDocumentById(documentId);
        setDocument(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load document. Please try again.");
        }
      }
    }

    void loadDocument();
  }, [documentId, isReady]);

  async function handleSubmit(values: AccountOpeningEditFormValues) {
    await updateAccountOpeningDocument(documentId, values);
    router.push(`/dashboard/account-opening-documents/${documentId}`);
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">
            {document?.status === DOCUMENT_STATUSES.REJECTED
              ? "Resubmit Document"
              : "Edit Document"}
          </h1>
          <p className="mt-1 text-sm text-brand-black-75">
            {document?.status === DOCUMENT_STATUSES.REJECTED
              ? "Fix the issues noted in the rejection and resubmit for branch review"
              : "Update customer details or replace the uploaded PDF"}
          </p>
        </div>

        <Card>
          <CardHeader
            title="Document Details"
            description={
              document?.status === DOCUMENT_STATUSES.REJECTED
                ? "Saving changes will resubmit this document for review"
                : "Client code and document number cannot be changed"
            }
          />
          <CardContent>
            {document?.status === DOCUMENT_STATUSES.REJECTED &&
            document.rejectionRemarks ? (
              <div
                className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                role="status"
              >
                Rejection remarks: {document.rejectionRemarks}
              </div>
            ) : null}
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : !document ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : (
              <AccountOpeningEditForm
                document={document}
                onSubmit={handleSubmit}
                onCancel={() =>
                  router.push(`/dashboard/account-opening-documents/${documentId}`)
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
