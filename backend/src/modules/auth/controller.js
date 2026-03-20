import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { mutateStore, readStore } from "../../config/store.js";
import { ApiError } from "../../utils/ApiError.js";
import { sanitizeText } from "../../utils/sanitize.js";

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.validated.body;
    const safeName = sanitizeText(name);
    const safeEmail = sanitizeText(email).toLowerCase();

    const user = await mutateStore(async (store) => {
      const exists = store.users.some((u) => u.email === safeEmail);
      if (exists) {
        throw new ApiError(409, "Email already registered");
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const now = new Date().toISOString();
      const newUser = {
        id: store.meta.nextUserId++,
        name: safeName,
        email: safeEmail,
        password_hash: passwordHash,
        role: role || "user",
        created_at: now
      };

      store.users.push(newUser);
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      };
    });

    const token = issueToken(user);
    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const safeEmail = sanitizeText(email).toLowerCase();

    const store = await readStore();
    const dbUser = store.users.find((u) => u.email === safeEmail);

    if (!dbUser) {
      throw new ApiError(401, "Invalid credentials");
    }

    const ok = await bcrypt.compare(password, dbUser.password_hash);
    if (!ok) {
      throw new ApiError(401, "Invalid credentials");
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      created_at: dbUser.created_at
    };

    const token = issueToken(user);
    return res.json({ success: true, data: { user, token } });
  } catch (err) {
    return next(err);
  }
}