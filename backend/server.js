import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDatabase } from "./src/config/db.js";

await connectDatabase(env.mongoUri);
createApp().listen(env.port, () =>
  console.log(`API ELLP+ctrl em http://localhost:${env.port}`),
);
