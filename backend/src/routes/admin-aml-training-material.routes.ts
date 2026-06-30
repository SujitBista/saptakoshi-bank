import { Router } from "express";
import {
  deleteAmlTrainingMaterialHandler,
  postAmlTrainingMaterial,
  putAmlTrainingMaterial,
} from "../controllers/aml-training-material.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleAmlTrainingMaterialUpload } from "../middleware/aml-training-material-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleAmlTrainingMaterialUpload, postAmlTrainingMaterial);
router.put("/:id", handleAmlTrainingMaterialUpload, putAmlTrainingMaterial);
router.delete("/:id", deleteAmlTrainingMaterialHandler);

export default router;
