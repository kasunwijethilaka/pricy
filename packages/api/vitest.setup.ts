// Loaded once before any test file. @pricy/db reads DATABASE_URL the moment
// it's imported (and throws if it's missing), so the real-DB integration tests
// need it present up front. We reuse the db package's own local .env.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../db/.env") });
