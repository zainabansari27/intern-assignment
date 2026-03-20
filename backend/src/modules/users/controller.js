import { readStore } from "../../config/store.js";

export async function listUsers(_req, res, next) {
  try {
    const store = await readStore();
    const users = [...store.users]
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ success: true, data: users });
  } catch (err) {
    return next(err);
  }
}