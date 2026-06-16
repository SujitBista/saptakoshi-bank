import { Router } from "express";
import {
  getBranch,
  getBranches,
  patchBranchStatus,
  postBranch,
  putBranch,
} from "../controllers/branch.controller";

const router = Router();

router.get("/", getBranches);
router.post("/", postBranch);
router.get("/:id", getBranch);
router.put("/:id", putBranch);
router.patch("/:id/status", patchBranchStatus);

export default router;
