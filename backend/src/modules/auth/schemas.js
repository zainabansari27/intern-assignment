import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(4).max(64),
    role: z.enum(["user", "admin"]).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(4).max(64)
  }),
  params: z.object({}),
  query: z.object({})
});
