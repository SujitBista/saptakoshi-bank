import { Router } from "express";
import { login, resetOwnPassword } from "../controllers/admin-auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.patch("/reset-password", requireAuth, resetOwnPassword);

export default router;
