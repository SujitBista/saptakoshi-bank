"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DOCUMENT_STATUSES, USER_ROLES } from "@saptakoshi/shared";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AccountOpeningDocumentPdfViewer } from "@/features/account-opening/AccountOpeningDocumentPdfViewer";
import {
  approveAccountOpeningDocument,
  downloadAccountOpeningDocument,
  fetchAccountOpeningDocumentById,
  formatDocumentDate,
  formatFileSize,
  rejectAccountOpeningDocument,
} from "@/features/account-opening/api";
import type { AccountOpeningDocument } from "@/features/account-opening/types";
import { useDocumentReviewerAuth } from "@/hooks/useUserAuth";
import { ApiError } from "@/lib/api-client";

interface DocumentReviewViewContentProps {
  documentId: number;
  variant?: "branch-manager" | "admin";
}

export function DocumentReviewViewContent({
  documentId,
  variant = "branch-manager",
}: DocumentReviewViewContentProps) {
  const router = useRouter();
  const { user, isReady, handleLogout } = useDocumentReviewerAuth(variant);
  const [document, setDocument] = useState<AccountOpeningDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
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

  async function handleApprove() {
    setIsApproving(true);
    setError(null);

    try {
      const updated = await approveAccountOpeningDocument(documentId);
      setDocument(updated);
      router.push(reviewListPath);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to approve document. Please try again."
      );
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setIsRejecting(true);
    setError(null);

    try {
      const updated = await rejectAccountOpeningDocument(
        documentId,
        rejectionRemarks.trim()
      );
      setDocument(updated);
      router.push(reviewListPath);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to reject document. Please try again."
      );
    } finally {
      setIsRejecting(false);
    }
  }

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

  const reviewListPath =
    variant === "admin" ? "/admin/document-review" : "/dashboard/document-review";
  const canReview =
    document?.status === DOCUMENT_STATUSES.PENDING &&
    ((variant === "branch-manager" && user?.role === USER_ROLES.BRANCH_MANAGER) ||
      (variant === "admin" && user?.role === USER_ROLES.ADMIN));
  const pageTitle = canReview ? "Review Document" : "View Document";
  const pageDescription = canReview
    ? "Approve or reject this account opening document"
    : "View this account opening document and review history";

  const layoutProps = {
    userEmail: user?.email,
    userRole: user?.role,
    onLogout: handleLogout,
  };

  const content = (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">{pageTitle}</h1>
          <p className="mt-1 text-sm text-brand-black-75">{pageDescription}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={reviewListPath} variant="outline">
            Back
          </Button>
          {document ? (
            <Button
              variant="outline"
              onClick={handleDownload}
              isLoading={isDownloading}
            >
              Download PDF
            </Button>
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

              {canReview ? (
                <div className="space-y-4 rounded-xl border border-brand-blue-15 bg-brand-blue-05 p-5">
                  <p className="text-sm font-medium text-brand-black">
                    Review actions
                  </p>
                  <Input
                    label="Rejection remarks"
                    placeholder="Required when rejecting a document"
                    value={rejectionRemarks}
                    onChange={(event) => setRejectionRemarks(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleApprove} isLoading={isApproving}>
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      isLoading={isRejecting}
                      disabled={!rejectionRemarks.trim()}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (variant === "admin") {
    return (
      <AdminLayout {...layoutProps}>{content}</AdminLayout>
    );
  }

  return <UserLayout {...layoutProps}>{content}</UserLayout>;
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
