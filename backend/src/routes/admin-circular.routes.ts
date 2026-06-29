import { Router } from "express";
import {
  deleteCircularHandler,
  postCircular,
  putCircular,
} from "../controllers/circular.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";
import { handleCircularUpload } from "../middleware/circular-upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);
router.post("/", handleCircularUpload, postCircular);
router.put("/:id", handleCircularUpload, putCircular);
router.delete("/:id", deleteCircularHandler);

export default router;
