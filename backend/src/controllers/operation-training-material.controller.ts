import type { Request, Response } from "express";
import {
  DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE,
  DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE_SIZE,
  MAX_OPERATION_TRAINING_MATERIAL_PAGE_SIZE,
  OperationTrainingMaterialError,
  createOperationTrainingMaterial,
  deleteOperationTrainingMaterial,
  getOperationTrainingMaterialById,
  getOperationTrainingMaterialFile,
  listOperationTrainingMaterials,
  updateOperationTrainingMaterial,
} from "../services/operation-training-material.service";

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

function handleOperationTrainingMaterialError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof OperationTrainingMaterialError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getOperationTrainingMaterials(req: Request, res: Response): Promise<void> {
  try {
    const result = await listOperationTrainingMaterials({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE_SIZE,
        MAX_OPERATION_TRAINING_MATERIAL_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Unable to load Operation training materials");
  }
}

export async function getOperationTrainingMaterial(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Operation training material id" });
    return;
  }

  try {
    const operationTrainingMaterial = await getOperationTrainingMaterialById(id);
    res.json({ operationTrainingMaterial });
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Unable to load Operation training material");
  }
}

export async function getOperationTrainingMaterialView(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid Operation training material id" });
    return;
  }

  try {
    const file = await getOperationTrainingMaterialFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Unable to load Operation training material PDF");
  }
}

export async function postOperationTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const operationTrainingMaterial = await createOperationTrainingMaterial({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ operationTrainingMaterial });
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Operation training material upload failed");
  }
}

export async function putOperationTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Operation training material id" });
    return;
  }

  try {
    const operationTrainingMaterial = await updateOperationTrainingMaterial({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ operationTrainingMaterial });
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Unable to update Operation training material");
  }
}

export async function deleteOperationTrainingMaterialHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid Operation training material id" });
    return;
  }

  try {
    await deleteOperationTrainingMaterial(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleOperationTrainingMaterialError(error, res, "Unable to delete Operation training material");
  }
}
