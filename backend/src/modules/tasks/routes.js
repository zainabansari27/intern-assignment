import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask
} from "./controller.js";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "./schemas.js";

const router = Router();

router.use(authenticate);
router.get("/", listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", validate(taskIdSchema), getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", validate(taskIdSchema), deleteTask);

export default router;