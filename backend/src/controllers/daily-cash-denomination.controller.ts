import type { Request, Response } from "express";
import {
  createDailyCashDenomination,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE,
  DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE,
  DailyCashDenominationError,
  listDailyCashDenominations,
  MAX_DAILY_CASH_DENOMINATION_PAGE_SIZE,
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
