"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getCreditTrainingMaterialViewObjectUrl } from "@/features/credit-training-materials/api";

interface CreditTrainingMaterialViewerProps {
  documentId: number;
  title: string;
}

export function CreditTrainingMaterialViewer({ documentId, title }: CreditTrainingMaterialViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getCreditTrainingMaterialViewObjectUrl}
      documentLabel="Credit training material"
    />
  );
}
