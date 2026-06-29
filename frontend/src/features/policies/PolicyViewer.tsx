"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import { getPolicyViewObjectUrl } from "@/features/policies/api";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PolicyViewerProps {
  documentId: number;
  title: string;
  getViewObjectUrl?: (id: number) => Promise<string>;
  documentLabel?: string;
}

const MAC_SCREENSHOT_KEYS = new Set(["3", "4", "5", "6"]);
const SCREENSHOT_SHIELD_MS = 1_200;
const PRINT_BLOCK_STYLE_ID = "policy-print-block";

function isScreenshotOrExportShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  const hasMeta = event.metaKey;
  const hasCtrl = event.ctrlKey;
  const hasShift = event.shiftKey;
  const hasModifier = hasMeta || hasCtrl;

  if (event.code === "PrintScreen" || key === "printscreen") {
    return true;
  }

  if (hasModifier && (key === "p" || key === "s")) {
    return true;
  }

  if (hasModifier && hasShift && key === "s") {
    return true;
  }

  if (hasMeta && hasShift && MAC_SCREENSHOT_KEYS.has(key)) {
    return true;
  }

  if (hasMeta && hasCtrl && hasShift && (key === "3" || key === "4")) {
    return true;
  }

  return false;
}

function blockClipboardEvent(event: Event) {
  event.preventDefault();
}

interface PdfPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  containerWidth: number;
  priority?: boolean;
  onRendered?: () => void;
}

function PdfPage({
  pdf,
  pageNumber,
  containerWidth,
  priority = false,
  onRendered,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(priority);

  useEffect(() => {
    if (priority || shouldRender) {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      {
        rootMargin: "600px 0px",
      }
    );

    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [priority, shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    let isCancelled = false;

    async function renderPage() {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.max((containerWidth - 32) / baseViewport.width, 0.5);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");

      if (!context || isCancelled) {
        return;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      if (!isCancelled) {
        onRendered?.();
      }
    }

    void renderPage();

    return () => {
      isCancelled = true;
    };
  }, [containerWidth, pageNumber, pdf, shouldRender]);

  return (
    <div ref={wrapperRef} className="w-full">
      <canvas
        ref={canvasRef}
        aria-label={`${pageNumber}`}
        className={`mx-auto block max-w-full bg-white shadow-sm ${
          shouldRender ? "" : "hidden"
        }`}
        draggable={false}
      />
      {!shouldRender ? (
        <div className="mx-auto h-[70vh] max-w-4xl animate-pulse bg-white shadow-sm" />
      ) : null}
    </div>
  );
}

export function PolicyViewer({
  documentId,
  title,
  getViewObjectUrl = getPolicyViewObjectUrl,
  documentLabel = "policy",
}: PolicyViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstPageRendering, setIsFirstPageRendering] = useState(true);
  const [isShielded, setIsShielded] = useState(false);
  const [isObscured, setIsObscured] = useState(false);
  const [watermarkTime, setWatermarkTime] = useState(() => new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewerRootRef = useRef<HTMLDivElement>(null);
  const shieldTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWatermarkTime(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    function updateWidth() {
      if (!container) {
        return;
      }

      setContainerWidth(container.clientWidth);
    }

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    let objectUrl: string | null = null;
    let loadedPdf: PDFDocumentProxy | null = null;
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setIsFirstPageRendering(true);
      setError(null);
      setPdf(null);
      setPageCount(0);

      try {
        objectUrl = await getViewObjectUrl(documentId);
        const loadingTask = getDocument(objectUrl);
        loadedPdf = await loadingTask.promise;

        if (isCancelled) {
          return;
        }

        setPdf(loadedPdf);
        setPageCount(loadedPdf.numPages);
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : `Unable to load ${documentLabel} PDF.`
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
      void loadedPdf?.destroy();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId, getViewObjectUrl, documentLabel]);

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    function activateShield() {
      setIsShielded(true);

      if (shieldTimeoutRef.current !== null) {
        window.clearTimeout(shieldTimeoutRef.current);
      }

      shieldTimeoutRef.current = window.setTimeout(() => {
        setIsShielded(false);
        shieldTimeoutRef.current = null;
      }, SCREENSHOT_SHIELD_MS);
    }

    function handleKeyEvent(event: KeyboardEvent) {
      if (!isScreenshotOrExportShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activateShield();
    }

    function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
    }

    function handleBeforePrint(event: Event) {
      event.preventDefault();
      activateShield();
    }

    function handleVisibilityChange() {
      setIsObscured(document.hidden);
    }

    const viewerRoot = viewerRootRef.current;
    const originalPrint = window.print;
    window.print = () => {
      activateShield();
    };

    if (!document.getElementById(PRINT_BLOCK_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = PRINT_BLOCK_STYLE_ID;
      style.textContent = "@media print { body { display: none !important; } }";
      document.head.appendChild(style);
    }

    window.addEventListener("keydown", handleKeyEvent, { capture: true });
    window.addEventListener("keyup", handleKeyEvent, { capture: true });
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    viewerRoot?.addEventListener("contextmenu", handleContextMenu, { capture: true });
    viewerRoot?.addEventListener("copy", blockClipboardEvent, { capture: true });
    viewerRoot?.addEventListener("cut", blockClipboardEvent, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyEvent, { capture: true });
      window.removeEventListener("keyup", handleKeyEvent, { capture: true });
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      viewerRoot?.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      viewerRoot?.removeEventListener("copy", blockClipboardEvent, { capture: true });
      viewerRoot?.removeEventListener("cut", blockClipboardEvent, { capture: true });

      window.print = originalPrint;
      document.getElementById(PRINT_BLOCK_STYLE_ID)?.remove();

      if (shieldTimeoutRef.current !== null) {
        window.clearTimeout(shieldTimeoutRef.current);
      }
    };
  }, [isLoading, error]);

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
          <p className="text-sm text-brand-black-75">Loading {documentLabel} PDF...</p>
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

  const showLoadingOverlay = isLoading || isFirstPageRendering;

  return (
    <div
      ref={viewerRootRef}
      className="relative overflow-hidden rounded-xl border border-brand-black-15 bg-white"
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div
        ref={scrollContainerRef}
        aria-label={title}
        className="relative h-[85vh] min-h-[600px] overflow-y-auto bg-brand-black-05 p-4 select-none [-webkit-touch-callout:none]"
      >
        {showLoadingOverlay ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white/90 px-5 py-4 shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              <p className="text-sm text-brand-black-75">
                {isLoading ? `Loading ${documentLabel} PDF...` : "Rendering PDF preview..."}
              </p>
            </div>
          </div>
        ) : null}

        {pdf && containerWidth > 0
          ? Array.from({ length: pageCount }, (_, index) => (
              <div key={index + 1} className="mb-4 flex justify-center">
                <PdfPage
                  pdf={pdf}
                  pageNumber={index + 1}
                  containerWidth={containerWidth}
                  priority={index === 0}
                  onRendered={
                    index === 0 ? () => setIsFirstPageRendering(false) : undefined
                  }
                />
              </div>
            ))
          : null}

        {isShielded || isObscured ? (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-white"
            aria-hidden
          >
            <p className="text-sm font-medium text-brand-black-50">Content protected</p>
          </div>
        ) : null}

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
