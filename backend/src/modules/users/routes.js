import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { listUsers } from "./controller.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), listUsers);

export default router;