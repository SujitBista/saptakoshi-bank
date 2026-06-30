import type { Request, Response } from "express";
import {
  DEFAULT_AML_TRAINING_MATERIAL_PAGE,
  DEFAULT_AML_TRAINING_MATERIAL_PAGE_SIZE,
  MAX_AML_TRAINING_MATERIAL_PAGE_SIZE,
  AmlTrainingMaterialError,
  createAmlTrainingMaterial,
  deleteAmlTrainingMaterial,
  getAmlTrainingMaterialById,
  getAmlTrainingMaterialFile,
  listAmlTrainingMaterials,
  updateAmlTrainingMaterial,
} from "../services/aml-training-material.service";

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

function handleAmlTrainingMaterialError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof AmlTrainingMaterialError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getAmlTrainingMaterials(req: Request, res: Response): Promise<void> {
  try {
    const result = await listAmlTrainingMaterials({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_AML_TRAINING_MATERIAL_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_AML_TRAINING_MATERIAL_PAGE_SIZE,
        MAX_AML_TRAINING_MATERIAL_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "Unable to load AML training materials");
  }
}

export async function getAmlTrainingMaterial(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid AML training material id" });
    return;
  }

  try {
    const amlTrainingMaterial = await getAmlTrainingMaterialById(id);
    res.json({ amlTrainingMaterial });
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "Unable to load AML training material");
  }
}

export async function getAmlTrainingMaterialView(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid AML training material id" });
    return;
  }

  try {
    const file = await getAmlTrainingMaterialFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "Unable to load AML training material PDF");
  }
}

export async function postAmlTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const amlTrainingMaterial = await createAmlTrainingMaterial({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ amlTrainingMaterial });
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "AML training material upload failed");
  }
}

export async function putAmlTrainingMaterial(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid AML training material id" });
    return;
  }

  try {
    const amlTrainingMaterial = await updateAmlTrainingMaterial({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ amlTrainingMaterial });
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "Unable to update AML training material");
  }
}

export async function deleteAmlTrainingMaterialHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid AML training material id" });
    return;
  }

  try {
    await deleteAmlTrainingMaterial(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleAmlTrainingMaterialError(error, res, "Unable to delete AML training material");
  }
}
