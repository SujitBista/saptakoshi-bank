import { Router } from "express";
import type { HealthResponse } from "@saptakoshi/shared";

const router = Router();

router.get("/", (_req, res) => {
  const response: HealthResponse = {
    status: "ok",
    service: "backend",
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

export default router;
