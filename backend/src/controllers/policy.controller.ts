import type { Request, Response } from "express";
import {
  DEFAULT_POLICY_PAGE,
  DEFAULT_POLICY_PAGE_SIZE,
  MAX_POLICY_PAGE_SIZE,
  PolicyError,
  createPolicy,
  deletePolicy,
  getPolicyById,
  getPolicyFile,
  listPolicies,
} from "../services/policy.service";

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

function handlePolicyError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof PolicyError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getPolicies(req: Request, res: Response): Promise<void> {
  try {
    const result = await listPolicies({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_POLICY_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_POLICY_PAGE_SIZE,
        MAX_POLICY_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handlePolicyError(error, res, "Unable to load policies");
  }
}

export async function getPolicy(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid policy id" });
    return;
  }

  try {
    const policy = await getPolicyById(id);
    res.json({ policy });
  } catch (error) {
    handlePolicyError(error, res, "Unable to load policy");
  }
}

export async function getPolicyView(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid policy id" });
    return;
  }

  try {
    const file = await getPolicyFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handlePolicyError(error, res, "Unable to load policy PDF");
  }
}

export async function postPolicy(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const policy = await createPolicy({
      authenticatedUser: req.user,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      file: req.file,
    });

    res.status(201).json({ policy });
  } catch (error) {
    handlePolicyError(error, res, "Policy upload failed");
  }
}

export async function deletePolicyHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid policy id" });
    return;
  }

  try {
    await deletePolicy(req.user, id);
    res.status(204).send();
  } catch (error) {
    handlePolicyError(error, res, "Unable to delete policy");
  }
}
