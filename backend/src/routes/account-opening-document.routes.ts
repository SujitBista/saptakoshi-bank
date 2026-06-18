import { Router } from "express";
import {
  getAccountOpeningDocument,
  getAccountOpeningDocumentFileHandler,
  getAccountOpeningDocuments,
  postAccountOpeningDocument,
  putAccountOpeningDocument,
} from "../controllers/account-opening-document.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { handleAccountOpeningUpload } from "../middleware/account-opening-upload.middleware";

const router = Router();

router.get("/", requireAuth, getAccountOpeningDocuments);
router.post("/", requireAuth, handleAccountOpeningUpload, postAccountOpeningDocument);
router.get("/:id/file", requireAuth, getAccountOpeningDocumentFileHandler);
router.get("/:id", requireAuth, getAccountOpeningDocument);
router.put("/:id", requireAuth, handleAccountOpeningUpload, putAccountOpeningDocument);

export default router;
