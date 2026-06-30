import { Router } from "express";
import {
  deleteRiskTrainingMaterialHandler,
  postRiskTrainingMaterial,
  putRiskTrainingMaterial,
} from "../controllers/risk-training-material.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleRiskTrainingMaterialUpload } from "../middleware/risk-training-material-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleRiskTrainingMaterialUpload, postRiskTrainingMaterial);
router.put("/:id", handleRiskTrainingMaterialUpload, putRiskTrainingMaterial);
router.delete("/:id", deleteRiskTrainingMaterialHandler);

export default router;
