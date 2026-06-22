import { Router } from "express";
import {
  getUser,
  getUsers,
  patchUserResetPassword,
  patchUserStatus,
  patchUserTransfer,
  postUser,
  putUser,
} from "../controllers/user.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:id", getUser);
router.put("/:id", putUser);
router.patch("/:id/status", patchUserStatus);
router.patch("/:id/transfer", patchUserTransfer);
router.patch("/:id/reset-password", patchUserResetPassword);

export default router;
