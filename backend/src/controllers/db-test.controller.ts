import type { Request, Response } from "express";
import * as dbTestService from "../services/db-test.service";

export async function getDbTest(_req: Request, res: Response): Promise<void> {
  try {
    const timestamp = await dbTestService.getDatabaseTimestamp();
    res.json({ timestamp });
  } catch {
    res.status(500).json({ error: "Database connection failed" });
  }
}
