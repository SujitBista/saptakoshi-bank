"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getItTrainingMaterialViewObjectUrl } from "@/features/it-training-materials/api";

interface ItTrainingMaterialViewerProps {
  documentId: number;
  title: string;
}

export function ItTrainingMaterialViewer({ documentId, title }: ItTrainingMaterialViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getItTrainingMaterialViewObjectUrl}
      documentLabel="IT training material"
    />
  );
}
