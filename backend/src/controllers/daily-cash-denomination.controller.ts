import type { Request, Response } from "express";
import {
  createDailyCashDenomination,
  DailyCashDenominationError,
} from "../services/daily-cash-denomination.service";

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
