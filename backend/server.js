import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";
import { ensureStore } from "./src/data/store.js";

await ensureStore();
createApp().listen(env.port, () =>
  console.log(`API ELLP+ctrl em http://localhost:${env.port}`),
);
