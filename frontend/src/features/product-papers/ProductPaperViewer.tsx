"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductPaperViewObjectUrl } from "@/features/product-papers/api";

interface ProductPaperViewerProps {
  documentId: number;
  title: string;
}

function isBlockedShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const modifierPressed = event.ctrlKey || event.metaKey;

  if (!modifierPressed) {
    return false;
  }

  if (key === "p" || key === "s") {
    return true;
  }

  return event.shiftKey && key === "s";
}

export function ProductPaperViewer({ documentId, title }: ProductPaperViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watermarkTime, setWatermarkTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWatermarkTime(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      setPdfUrl(null);

      try {
        objectUrl = await getProductPaperViewObjectUrl(documentId);

        if (!isCancelled) {
          setPdfUrl(`${objectUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load product paper PDF."
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isBlockedShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  const watermarkLabel = useMemo(() => {
    return `Saptakoshi Development Bank • ${new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(watermarkTime)}`;
  }, [watermarkTime]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-xl border border-brand-black-15 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
          <p className="text-sm text-brand-black-75">Loading product paper PDF...</p>
        </div>
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
    <div
      className="relative overflow-hidden rounded-xl border border-brand-black-15 bg-white"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="border-b border-brand-black-15 bg-brand-blue-05 px-4 py-3 text-sm text-brand-black-75">
        <p className="font-semibold text-brand-blue">{title}</p>
        <p className="mt-1">
          Protected inline viewer. Download, print, and save actions are hidden where
          possible.
        </p>
      </div>

      <div className="relative h-[78vh] min-h-[600px] bg-brand-black-05">
        <iframe
          src={pdfUrl ?? undefined}
          title={title}
          className="h-full w-full bg-white"
          sandbox="allow-same-origin allow-scripts"
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-4 top-4 rounded bg-white/65 px-3 py-1 text-xs font-semibold text-brand-blue shadow-sm">
            {watermarkLabel}
          </div>

          {Array.from({ length: 12 }).map((_, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;

            return (
              <div
                key={`${row}-${col}`}
                className="absolute text-sm font-semibold text-brand-blue/20"
                style={{
                  top: `${12 + row * 24}%`,
                  left: `${2 + col * 31}%`,
                  transform: "rotate(-28deg)",
                }}
              >
                {watermarkLabel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
