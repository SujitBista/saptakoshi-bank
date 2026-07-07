import { Router } from "express";
import { postDailyCashDenomination } from "../controllers/daily-cash-denomination.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, postDailyCashDenomination);

export default router;
