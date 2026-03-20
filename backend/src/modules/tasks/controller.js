import { mutateStore, readStore } from "../../config/store.js";
import { ApiError } from "../../utils/ApiError.js";
import { sanitizeText } from "../../utils/sanitize.js";

function normalizeTaskInput(input) {
  const output = {};
  if (input.title !== undefined) output.title = sanitizeText(input.title);
  if (input.description !== undefined) output.description = sanitizeText(input.description);
  if (input.status !== undefined) output.status = input.status;
  return output;
}

function ensureAccess(task, user) {
  if (user.role === "admin") return;
  if (task.user_id !== user.id) {
    throw new ApiError(403, "Forbidden: task does not belong to this user");
  }
}

export async function createTask(req, res, next) {
  try {
    const payload = normalizeTaskInput(req.validated.body);

    const task = await mutateStore((store) => {
      const now = new Date().toISOString();
      const newTask = {
        id: store.meta.nextTaskId++,
        user_id: req.user.id,
        title: payload.title,
        description: payload.description || "",
        status: payload.status || "todo",
        created_at: now,
        updated_at: now
      };

      store.tasks.push(newTask);
      return newTask;
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
}

export async function listTasks(req, res, next) {
  try {
    const store = await readStore();
    const rows = req.user.role === "admin"
      ? store.tasks
      : store.tasks.filter((t) => t.user_id === req.user.id);

    const data = [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const { id } = req.validated.params;
    const store = await readStore();
    const task = store.tasks.find((t) => t.id === id);

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    ensureAccess(task, req.user);
    return res.json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.validated.params;
    const patch = normalizeTaskInput(req.validated.body);

    const updatedTask = await mutateStore((store) => {
      const idx = store.tasks.findIndex((t) => t.id === id);
      if (idx === -1) {
        throw new ApiError(404, "Task not found");
      }

      const task = store.tasks[idx];
      ensureAccess(task, req.user);

      const updated = {
        ...task,
        title: patch.title ?? task.title,
        description: patch.description ?? task.description,
        status: patch.status ?? task.status,
        updated_at: new Date().toISOString()
      };

      store.tasks[idx] = updated;
      return updated;
    });

    return res.json({ success: true, data: updatedTask });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.validated.params;

    await mutateStore((store) => {
      const idx = store.tasks.findIndex((t) => t.id === id);
      if (idx === -1) {
        throw new ApiError(404, "Task not found");
      }

      const task = store.tasks[idx];
      ensureAccess(task, req.user);
      store.tasks.splice(idx, 1);
    });

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}