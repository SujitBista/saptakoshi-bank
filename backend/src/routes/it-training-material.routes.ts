import { Router } from "express";
import {
  getItTrainingMaterials,
  getItTrainingMaterial,
  getItTrainingMaterialView,
} from "../controllers/it-training-material.controller";

const router = Router();

router.get("/", getItTrainingMaterials);
router.get("/:id", getItTrainingMaterial);
router.get("/:id/view", getItTrainingMaterialView);

export default router;
