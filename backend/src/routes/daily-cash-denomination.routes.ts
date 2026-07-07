import { Router } from "express";
import {
  deleteDailyCashDenominationHandler,
  getDailyCashDenomination,
  getDailyCashDenominations,
  postDailyCashDenomination,
  putDailyCashDenomination,
} from "../controllers/daily-cash-denomination.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getDailyCashDenominations);
router.get("/:id", requireAuth, getDailyCashDenomination);
router.post("/", requireAuth, postDailyCashDenomination);
router.put("/:id", requireAuth, putDailyCashDenomination);
router.delete("/:id", requireAuth, deleteDailyCashDenominationHandler);

export default router;
