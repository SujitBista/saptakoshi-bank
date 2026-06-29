import { Router } from "express";
import {
  deleteProductPaperHandler,
  postProductPaper,
  putProductPaper,
} from "../controllers/product-paper.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleProductPaperUpload } from "../middleware/product-paper-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleProductPaperUpload, postProductPaper);
router.put("/:id", putProductPaper);
router.delete("/:id", deleteProductPaperHandler);

export default router;
