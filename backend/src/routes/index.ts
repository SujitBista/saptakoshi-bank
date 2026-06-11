import { Router } from "express";
import { APP_NAME } from "@saptakoshi/shared";
import healthRoutes from "./health.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: `${APP_NAME} API` });
});

router.use("/health", healthRoutes);

export default router;
