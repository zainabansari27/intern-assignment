import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");
const dbPath = path.join(dataDir, "db.json");

const defaultStore = {
  users: [],
  tasks: [],
  meta: {
    nextUserId: 1,
    nextTaskId: 1
  }
};

export async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultStore, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(dbPath, "utf8");
  const data = JSON.parse(raw);

  if (!data.meta) {
    data.meta = { nextUserId: 1, nextTaskId: 1 };
  }
  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.tasks)) data.tasks = [];

  return data;
}

export async function writeStore(store) {
  await fs.writeFile(dbPath, JSON.stringify(store, null, 2));
}

export async function mutateStore(mutator) {
  const store = await readStore();
  const result = await mutator(store);
  await writeStore(store);
  return result;
}