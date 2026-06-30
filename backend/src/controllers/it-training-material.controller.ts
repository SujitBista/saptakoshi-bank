import type { Request, Response } from "express";
import {
  DEFAULT_IT_TRAINING_MATERIAL_PAGE,
  DEFAULT_IT_TRAINING_MATERIAL_PAGE_SIZE,
  MAX_IT_TRAINING_MATERIAL_PAGE_SIZE,
  ItTrainingMaterialError,
  createItTrainingMaterial,
  deleteItTrainingMaterial,
  getItTrainingMaterialById,
  getItTrainingMaterialFile,
  listItTrainingMaterials,
  updateItTrainingMaterial,
} from "../services/it-training-material.service";

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

function handleItTrainingMaterialError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof ItTrainingMaterialError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getItTrainingMaterials(req: Request, res: Response): Promise<void> {
  try {
    const result = await listItTrainingMaterials({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_IT_TRAINING_MATERIAL_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_IT_TRAINING_MATERIAL_PAGE_SIZE,
        MAX_IT_TRAINING_MATERIAL_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleItTrainingMaterialError(error, res, "Unable to load IT training materials");
  }
}

export async function getItTrainingMaterial(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid IT training material id" });
    return;
  }

  try {
    const itTrainingMaterial = await getItTrainingMaterialById(id);
    res.json({ itTrainingMaterial });
  } catch (error) {
    handleItTrainingMaterialError(error, res, "Unable to load IT training material");
  }
}

export async function getItTrainingMaterialView(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid IT training material id" });
    return;
  }

  try {
    const file = await getItTrainingMaterialFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleItTrainingMaterialError(error, res, "Unable to load IT training material PDF");
  }
}

export async function postItTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const itTrainingMaterial = await createItTrainingMaterial({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ itTrainingMaterial });
  } catch (error) {
    handleItTrainingMaterialError(error, res, "IT training material upload failed");
  }
}

export async function putItTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid IT training material id" });
    return;
  }

  try {
    const itTrainingMaterial = await updateItTrainingMaterial({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ itTrainingMaterial });
  } catch (error) {
    handleItTrainingMaterialError(error, res, "Unable to update IT training material");
  }
}

export async function deleteItTrainingMaterialHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid IT training material id" });
    return;
  }

  try {
    await deleteItTrainingMaterial(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleItTrainingMaterialError(error, res, "Unable to delete IT training material");
  }
}
