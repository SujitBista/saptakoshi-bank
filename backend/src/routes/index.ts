import { Router } from "express";
import { APP_NAME } from "@saptakoshi/shared";
import adminAuthRoutes from "./admin-auth.routes";
import dbTestRoutes from "./db-test.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: `${APP_NAME} API` });
});

router.use("/admin/auth", adminAuthRoutes);
router.use("/health", healthRoutes);
router.use("/db-test", dbTestRoutes);

export default router;
