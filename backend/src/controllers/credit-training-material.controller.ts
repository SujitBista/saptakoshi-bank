import type { Request, Response } from "express";
import {
  DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE,
  DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE_SIZE,
  MAX_CREDIT_TRAINING_MATERIAL_PAGE_SIZE,
  CreditTrainingMaterialError,
  createCreditTrainingMaterial,
  deleteCreditTrainingMaterial,
  getCreditTrainingMaterialById,
  getCreditTrainingMaterialFile,
  listCreditTrainingMaterials,
  updateCreditTrainingMaterial,
} from "../services/credit-training-material.service";

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

function handleCreditTrainingMaterialError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof CreditTrainingMaterialError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getCreditTrainingMaterials(req: Request, res: Response): Promise<void> {
  try {
    const result = await listCreditTrainingMaterials({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE_SIZE,
        MAX_CREDIT_TRAINING_MATERIAL_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Unable to load Credit training materials");
  }
}

export async function getCreditTrainingMaterial(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Credit training material id" });
    return;
  }

  try {
    const creditTrainingMaterial = await getCreditTrainingMaterialById(id);
    res.json({ creditTrainingMaterial });
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Unable to load Credit training material");
  }
}

export async function getCreditTrainingMaterialView(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Credit training material id" });
    return;
  }

  try {
    const file = await getCreditTrainingMaterialFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Unable to load Credit training material PDF");
  }
}

export async function postCreditTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const creditTrainingMaterial = await createCreditTrainingMaterial({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ creditTrainingMaterial });
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Credit training material upload failed");
  }
}

export async function putCreditTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Credit training material id" });
    return;
  }

  try {
    const creditTrainingMaterial = await updateCreditTrainingMaterial({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ creditTrainingMaterial });
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Unable to update Credit training material");
  }
}

export async function deleteCreditTrainingMaterialHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Credit training material id" });
    return;
  }

  try {
    await deleteCreditTrainingMaterial(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleCreditTrainingMaterialError(error, res, "Unable to delete Credit training material");
  }
}
