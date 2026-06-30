import { Router } from "express";
import {
  getOperationTrainingMaterials,
  getOperationTrainingMaterial,
  getOperationTrainingMaterialView,
} from "../controllers/operation-training-material.controller";

const router = Router();

router.get("/", getOperationTrainingMaterials);
router.get("/:id", getOperationTrainingMaterial);
router.get("/:id/view", getOperationTrainingMaterialView);

export default router;
