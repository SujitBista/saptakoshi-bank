import { Router } from "express";
import {
  getPolicies,
  getPolicy,
  getPolicyView,
} from "../controllers/policy.controller";

const router = Router();

router.get("/", getPolicies);
router.get("/:id", getPolicy);
router.get("/:id/view", getPolicyView);

export default router;
