import { ensureStore } from "./store.js";

async function init() {
  await ensureStore();
  console.log("Local JSON store initialized at backend/data/db.json");
}

init().catch((err) => {
  console.error("Failed to initialize local store:", err.message);
  process.exit(1);
});