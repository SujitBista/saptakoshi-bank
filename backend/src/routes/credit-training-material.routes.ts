import { Router } from "express";
import {
  getCreditTrainingMaterials,
  getCreditTrainingMaterial,
  getCreditTrainingMaterialView,
} from "../controllers/credit-training-material.controller";

const router = Router();

router.get("/", getCreditTrainingMaterials);
router.get("/:id", getCreditTrainingMaterial);
router.get("/:id/view", getCreditTrainingMaterialView);

export default router;
