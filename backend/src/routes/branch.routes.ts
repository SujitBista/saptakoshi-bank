import { Router } from "express";
import {
  getBranch,
  getBranches,
  patchBranchStatus,
  postBranch,
  putBranch,
} from "../controllers/branch.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getBranches);
router.post("/", postBranch);
router.get("/:id", getBranch);
router.put("/:id", putBranch);
router.patch("/:id/status", patchBranchStatus);

export default router;
