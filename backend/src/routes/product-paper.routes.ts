import { Router } from "express";
import {
  getProductPaper,
  getProductPapers,
  getProductPaperView,
} from "../controllers/product-paper.controller";

const router = Router();

router.get("/", getProductPapers);
router.get("/:id", getProductPaper);
router.get("/:id/view", getProductPaperView);

export default router;
