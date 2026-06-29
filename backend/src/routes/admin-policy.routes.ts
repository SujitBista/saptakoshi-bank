import { Router } from "express";
import {
  deletePolicyHandler,
  postPolicy,
  putPolicy,
} from "../controllers/policy.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handlePolicyUpload } from "../middleware/policy-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handlePolicyUpload, postPolicy);
router.put("/:id", handlePolicyUpload, putPolicy);
router.delete("/:id", deletePolicyHandler);

export default router;
