import type { Request, Response } from "express";
import {
  DEFAULT_CIRCULAR_PAGE,
  DEFAULT_CIRCULAR_PAGE_SIZE,
  MAX_CIRCULAR_PAGE_SIZE,
  CircularError,
  createCircular,
  deleteCircular,
  getCircularById,
  getCircularFile,
  listCirculars,
  updateCircular,
} from "../services/circular.service";

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

function handleCircularError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof CircularError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getCirculars(req: Request, res: Response): Promise<void> {
  try {
    const result = await listCirculars({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_CIRCULAR_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_CIRCULAR_PAGE_SIZE,
        MAX_CIRCULAR_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleCircularError(error, res, "Unable to load circulars");
  }
}

export async function getCircular(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid circular id" });
    return;
  }

  try {
    const circular = await getCircularById(id);
    res.json({ circular });
  } catch (error) {
    handleCircularError(error, res, "Unable to load circular");
  }
}

export async function getCircularView(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid circular id" });
    return;
  }

  try {
    const file = await getCircularFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleCircularError(error, res, "Unable to load circular PDF");
  }
}

export async function postCircular(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const circular = await createCircular({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ circular });
  } catch (error) {
    handleCircularError(error, res, "Circular upload failed");
  }
}

export async function putCircular(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid circular id" });
    return;
  }

  try {
    const circular = await updateCircular({
      authenticatedUser: req.user,
      id,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.json({ circular });
  } catch (error) {
    handleCircularError(error, res, "Unable to update circular");
  }
}

export async function deleteCircularHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid circular id" });
    return;
  }

  try {
    await deleteCircular(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleCircularError(error, res, "Unable to delete circular");
  }
}
