"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getOperationTrainingMaterialViewObjectUrl } from "@/features/operation-training-materials/api";

interface OperationTrainingMaterialViewerProps {
  documentId: number;
  title: string;
}

export function OperationTrainingMaterialViewer({ documentId, title }: OperationTrainingMaterialViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getOperationTrainingMaterialViewObjectUrl}
      documentLabel="Operation training material"
    />
  );
}
