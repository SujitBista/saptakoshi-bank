import { Router } from "express";
import { APP_NAME } from "@saptakoshi/shared";
import adminAmlTrainingMaterialRoutes from "./admin-aml-training-material.routes";
import adminCircularRoutes from "./admin-circular.routes";
import adminPolicyRoutes from "./admin-policy.routes";
import adminProductPaperRoutes from "./admin-product-paper.routes";
import accountOpeningDocumentRoutes from "./account-opening-document.routes";
import adminAuthRoutes from "./admin-auth.routes";
import branchRoutes from "./branch.routes";
import dbTestRoutes from "./db-test.routes";
import healthRoutes from "./health.routes";
import amlTrainingMaterialRoutes from "./aml-training-material.routes";
import circularRoutes from "./circular.routes";
import policyRoutes from "./policy.routes";
import productPaperRoutes from "./product-paper.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: `${APP_NAME} API` });
});

router.use("/account-opening-documents", accountOpeningDocumentRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/branches", branchRoutes);
router.use("/admin/aml-training-materials", adminAmlTrainingMaterialRoutes);
router.use("/admin/circulars", adminCircularRoutes);
router.use("/admin/policies", adminPolicyRoutes);
router.use("/admin/product-papers", adminProductPaperRoutes);
router.use("/admin/users", userRoutes);
router.use("/health", healthRoutes);
router.use("/aml-training-materials", amlTrainingMaterialRoutes);
router.use("/circulars", circularRoutes);
router.use("/policies", policyRoutes);
router.use("/product-papers", productPaperRoutes);
router.use("/db-test", dbTestRoutes);

export default router;
