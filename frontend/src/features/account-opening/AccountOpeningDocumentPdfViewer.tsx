"use client";

import { useEffect, useState } from "react";
import { getAccountOpeningDocumentFileObjectUrl } from "@/features/account-opening/api";

interface AccountOpeningDocumentPdfViewerProps {
  documentId: number;
}

export function AccountOpeningDocumentPdfViewer({
  documentId,
}: AccountOpeningDocumentPdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      setPdfUrl(null);

      try {
        objectUrl = await getAccountOpeningDocumentFileObjectUrl(documentId);

        if (!isCancelled) {
          setPdfUrl(objectUrl);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load document PDF."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-lg border border-brand-black-15 bg-brand-blue-05 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl ?? undefined}
      title="Uploaded document PDF"
      className="h-[70vh] w-full rounded-lg border border-brand-black-15 bg-white"
    />
  );
}
