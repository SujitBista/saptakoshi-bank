"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getCircularViewObjectUrl } from "@/features/circulars/api";

interface CircularViewerProps {
  documentId: number;
  title: string;
}

export function CircularViewer({ documentId, title }: CircularViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getCircularViewObjectUrl}
      documentLabel="circular"
    />
  );
}
