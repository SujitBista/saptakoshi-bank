import { Router } from "express";
import {
  getAmlTrainingMaterials,
  getAmlTrainingMaterial,
  getAmlTrainingMaterialView,
} from "../controllers/aml-training-material.controller";

const router = Router();

router.get("/", getAmlTrainingMaterials);
router.get("/:id", getAmlTrainingMaterial);
router.get("/:id/view", getAmlTrainingMaterialView);

export default router;
