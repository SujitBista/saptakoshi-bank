import { Router } from "express";
import {
  deleteOperationTrainingMaterialHandler,
  postOperationTrainingMaterial,
  putOperationTrainingMaterial,
} from "../controllers/operation-training-material.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleOperationTrainingMaterialUpload } from "../middleware/operation-training-material-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleOperationTrainingMaterialUpload, postOperationTrainingMaterial);
router.put("/:id", handleOperationTrainingMaterialUpload, putOperationTrainingMaterial);
router.delete("/:id", deleteOperationTrainingMaterialHandler);

export default router;
