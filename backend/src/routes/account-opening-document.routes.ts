import { Router } from "express";
import { postAccountOpeningDocument } from "../controllers/account-opening-document.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { handleAccountOpeningUpload } from "../middleware/account-opening-upload.middleware";

const router = Router();

router.post("/", requireAuth, handleAccountOpeningUpload, postAccountOpeningDocument);

export default router;
