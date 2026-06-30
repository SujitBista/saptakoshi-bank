import { Router } from "express";
import {
  getRiskTrainingMaterials,
  getRiskTrainingMaterial,
  getRiskTrainingMaterialView,
} from "../controllers/risk-training-material.controller";

const router = Router();

router.get("/", getRiskTrainingMaterials);
router.get("/:id", getRiskTrainingMaterial);
router.get("/:id/view", getRiskTrainingMaterialView);

export default router;
