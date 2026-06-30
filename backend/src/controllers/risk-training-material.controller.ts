import type { Request, Response } from "express";
import {
  DEFAULT_RISK_TRAINING_MATERIAL_PAGE,
  DEFAULT_RISK_TRAINING_MATERIAL_PAGE_SIZE,
  MAX_RISK_TRAINING_MATERIAL_PAGE_SIZE,
  RiskTrainingMaterialError,
  createRiskTrainingMaterial,
  deleteRiskTrainingMaterial,
  getRiskTrainingMaterialById,
  getRiskTrainingMaterialFile,
  listRiskTrainingMaterials,
  updateRiskTrainingMaterial,
} from "../services/risk-training-material.service";

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max === undefined ? parsed : Math.min(parsed, max);
}

function parseId(value: string | string[] | undefined): number | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function handleRiskTrainingMaterialError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof RiskTrainingMaterialError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getRiskTrainingMaterials(req: Request, res: Response): Promise<void> {
  try {
    const result = await listRiskTrainingMaterials({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_RISK_TRAINING_MATERIAL_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_RISK_TRAINING_MATERIAL_PAGE_SIZE,
        MAX_RISK_TRAINING_MATERIAL_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Unable to load Risk training materials");
  }
}

export async function getRiskTrainingMaterial(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Risk training material id" });
    return;
  }

  try {
    const riskTrainingMaterial = await getRiskTrainingMaterialById(id);
    res.json({ riskTrainingMaterial });
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Unable to load Risk training material");
  }
}

export async function getRiskTrainingMaterialView(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Risk training material id" });
    return;
  }

  try {
    const file = await getRiskTrainingMaterialFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Unable to load Risk training material PDF");
  }
}

export async function postRiskTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const riskTrainingMaterial = await createRiskTrainingMaterial({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ riskTrainingMaterial });
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Risk training material upload failed");
  }
}

export async function putRiskTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Risk training material id" });
    return;
  }

  try {
    const riskTrainingMaterial = await updateRiskTrainingMaterial({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ riskTrainingMaterial });
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Unable to update Risk training material");
  }
}

export async function deleteRiskTrainingMaterialHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Risk training material id" });
    return;
  }

  try {
    await deleteRiskTrainingMaterial(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleRiskTrainingMaterialError(error, res, "Unable to delete Risk training material");
  }
}
