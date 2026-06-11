import { Router } from "express";
import { getDbTest } from "../controllers/db-test.controller";

const router = Router();

router.get("/", getDbTest);

export default router;
