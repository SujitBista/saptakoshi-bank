"use client";

import { PolicyViewer } from "@/features/policies/PolicyViewer";
import { getRiskTrainingMaterialViewObjectUrl } from "@/features/risk-training-materials/api";

interface RiskTrainingMaterialViewerProps {
  documentId: number;
  title: string;
}

export function RiskTrainingMaterialViewer({ documentId, title }: RiskTrainingMaterialViewerProps) {
  return (
    <PolicyViewer
      documentId={documentId}
      title={title}
      getViewObjectUrl={getRiskTrainingMaterialViewObjectUrl}
      documentLabel="Risks training material"
    />
  );
}
