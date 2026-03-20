import { z } from "zod";

const taskBody = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo")
});

export const createTaskSchema = z.object({
  body: taskBody,
  params: z.object({}),
  query: z.object({})
});

export const updateTaskSchema = z.object({
  body: taskBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  }),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

export const taskIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: z.object({})
});