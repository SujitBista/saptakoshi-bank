import type { Request, Response } from "express";
import {
  createDailyCashDenomination,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE,
  deleteDailyCashDenomination,
  DailyCashDenominationError,
  getDailyCashDenominationById,
  listDailyCashDenominations,
  MAX_DAILY_CASH_DENOMINATION_PAGE_SIZE,
  updateDailyCashDenomination,
} from "../services/daily-cash-denomination.service";

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  if (max !== undefined) {
    return Math.min(parsed, max);
  }

  return parsed;
}

function parseId(value: string | string[] | undefined): number | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function handleDailyCashDenominationError(error: unknown, res: Response): void {
  if (error instanceof DailyCashDenominationError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error("Daily cash denomination operation failed:", error);
  res.status(500).json({ error: "Daily cash denomination operation failed" });
}

export async function postDailyCashDenomination(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const denomination = await createDailyCashDenomination({
      authenticatedUser: req.user,
      ...req.body,
    });

    res.status(201).json({ denomination });
  } catch (error) {
    handleDailyCashDenominationError(error, res);
  }
}

export async function getDailyCashDenominations(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await listDailyCashDenominations({
      authenticatedUser: req.user,
      page: parsePositiveInt(req.query.page, DEFAULT_DAILY_CASH_DENOMINATION_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE,
        MAX_DAILY_CASH_DENOMINATION_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleDailyCashDenominationError(error, res);
  }
}

export async function getDailyCashDenomination(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid denomination id" });
    return;
  }

  try {
    const denomination = await getDailyCashDenominationById({
      authenticatedUser: req.user,
      id,
    });

    res.json({ denomination });
  } catch (error) {
    handleDailyCashDenominationError(error, res);
  }
}

export async function putDailyCashDenomination(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid denomination id" });
    return;
  }

  try {
    const denomination = await updateDailyCashDenomination({
      authenticatedUser: req.user,
      id,
      ...req.body,
    });

    res.json({ denomination });
  } catch (error) {
    handleDailyCashDenominationError(error, res);
  }
}

export async function deleteDailyCashDenominationHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid denomination id" });
    return;
  }

  try {
    await deleteDailyCashDenomination({
      authenticatedUser: req.user,
      id,
    });

    res.status(204).send();
  } catch (error) {
    handleDailyCashDenominationError(error, res);
  }
}
