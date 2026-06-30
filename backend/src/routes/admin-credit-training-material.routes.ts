import { Router } from "express";
import {
  deleteCreditTrainingMaterialHandler,
  postCreditTrainingMaterial,
  putCreditTrainingMaterial,
} from "../controllers/credit-training-material.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleCreditTrainingMaterialUpload } from "../middleware/credit-training-material-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleCreditTrainingMaterialUpload, postCreditTrainingMaterial);
router.put("/:id", handleCreditTrainingMaterialUpload, putCreditTrainingMaterial);
router.delete("/:id", deleteCreditTrainingMaterialHandler);

export default router;
