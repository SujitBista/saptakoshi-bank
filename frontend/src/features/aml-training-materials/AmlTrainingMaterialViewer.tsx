"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getAmlTrainingMaterialViewObjectUrl } from "@/features/aml-training-materials/api";

interface AmlTrainingMaterialViewerProps {
  documentId: number;
  title: string;
}

export function AmlTrainingMaterialViewer({ documentId, title }: AmlTrainingMaterialViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getAmlTrainingMaterialViewObjectUrl}
      documentLabel="AML training material"
    />
  );
}
