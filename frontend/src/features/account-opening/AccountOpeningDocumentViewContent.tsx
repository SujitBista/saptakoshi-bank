"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DOCUMENT_STATUSES } from "@saptakoshi/shared";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AccountOpeningDocumentPdfViewer } from "@/features/account-opening/AccountOpeningDocumentPdfViewer";
import {
  downloadAccountOpeningDocument,
  fetchAccountOpeningDocumentById,
  formatDocumentDate,
  formatFileSize,
} from "@/features/account-opening/api";
import type { AccountOpeningDocument } from "@/features/account-opening/types";
import { useEmployeeAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

interface AccountOpeningDocumentViewContentProps {
  documentId: number;
}

export function AccountOpeningDocumentViewContent({
  documentId,
}: AccountOpeningDocumentViewContentProps) {
  const { user, isReady, handleLogout } = useEmployeeAuth();
  const [document, setDocument] = useState<AccountOpeningDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);

    try {
      await downloadAccountOpeningDocument(documentId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to download document."
      );
    } finally {
      setIsDownloading(false);
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Document Details</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              View account opening document information
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/account-opening-upload">
              <Button variant="outline">Back</Button>
            </Link>
            {document ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  isLoading={isDownloading}
                >
                  Download PDF
                </Button>
                {document.status !== DOCUMENT_STATUSES.APPROVED ? (
                  <Link href={`/dashboard/account-opening-documents/${document.id}/edit`}>
                    <Button>
                      {document.status === DOCUMENT_STATUSES.REJECTED
                        ? "Edit & Resubmit"
                        : "Edit Document"}
                    </Button>
                  </Link>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader
            title={document?.documentNo ?? "Document"}
            description={document ? `${document.firstName} ${document.lastName}` : undefined}
          />
          <CardContent>
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
              <div className="space-y-6">
                {document.status === DOCUMENT_STATUSES.REJECTED ? (
                  <div
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                    role="status"
                  >
                    This document was rejected
                    {document.rejectionRemarks
                      ? `: ${document.rejectionRemarks}`
                      : "."}{" "}
                    Update the details or PDF and save to resubmit for review.
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Status" value={document.status} />
                  <DetailItem label="Document No." value={document.documentNo} />
                  <DetailItem label="Client Code" value={document.clientCode} />
                  <DetailItem label="First Name" value={document.firstName} />
                  <DetailItem label="Last Name" value={document.lastName} />
                  <DetailItem
                    label="Father Name"
                    value={document.fatherName || "—"}
                  />
                  <DetailItem label="Citizen No." value={document.citizenNo} />
                  <DetailItem label="Mobile Number" value={document.mobileNumber} />
                  <DetailItem label="Branch Code" value={document.branchCode} />
                  <DetailItem label="Branch Name" value={document.branchName} />
                  <DetailItem
                    label="Uploaded By"
                    value={document.uploadedByName}
                  />
                  <DetailItem
                    label="File Size"
                    value={formatFileSize(document.fileSize)}
                  />
                  <DetailItem
                    label="Uploaded Date"
                    value={formatDocumentDate(document.createdAt)}
                  />
                  <DetailItem
                    label="Last Updated"
                    value={formatDocumentDate(document.updatedAt)}
                  />
                  {document.reviewedAt ? (
                    <>
                      <DetailItem
                        label="Reviewed By"
                        value={document.reviewedByName ?? "—"}
                      />
                      <DetailItem
                        label="Reviewed At"
                        value={formatDocumentDate(document.reviewedAt)}
                      />
                    </>
                  ) : null}
                  {document.rejectionRemarks ? (
                    <div className="sm:col-span-2">
                      <DetailItem
                        label="Rejection Remarks"
                        value={document.rejectionRemarks}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                    Uploaded Document
                  </p>
                  <AccountOpeningDocumentPdfViewer documentId={document.id} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-brand-black">{value}</p>
    </div>
  );
}
