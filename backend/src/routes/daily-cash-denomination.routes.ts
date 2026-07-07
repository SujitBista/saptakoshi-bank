import { Router } from "express";
import {
  getDailyCashDenominations,
  postDailyCashDenomination,
} from "../controllers/daily-cash-denomination.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getDailyCashDenominations);
router.post("/", requireAuth, postDailyCashDenomination);

export default router;
