import { Router } from "express";
import {
  deletePolicyHandler,
  postPolicy,
} from "../controllers/policy.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handlePolicyUpload } from "../middleware/policy-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handlePolicyUpload, postPolicy);
router.delete("/:id", deletePolicyHandler);

export default router;
