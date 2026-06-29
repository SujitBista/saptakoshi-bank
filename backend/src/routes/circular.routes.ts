import { Router } from "express";
import {
  getCirculars,
  getCircular,
  getCircularView,
} from "../controllers/circular.controller";

const router = Router();

router.get("/", getCirculars);
router.get("/:id", getCircular);
router.get("/:id/view", getCircularView);

export default router;
