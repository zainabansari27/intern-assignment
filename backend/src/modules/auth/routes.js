import { Router } from "express";
import { login, register } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema, registerSchema } from "./schemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;