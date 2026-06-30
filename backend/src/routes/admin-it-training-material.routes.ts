import { Router } from "express";
import {
  deleteItTrainingMaterialHandler,
  postItTrainingMaterial,
  putItTrainingMaterial,
} from "../controllers/it-training-material.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleItTrainingMaterialUpload } from "../middleware/it-training-material-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleItTrainingMaterialUpload, postItTrainingMaterial);
router.put("/:id", handleItTrainingMaterialUpload, putItTrainingMaterial);
router.delete("/:id", deleteItTrainingMaterialHandler);

export default router;
