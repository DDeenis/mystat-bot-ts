import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string(),
    BOT_TOKEN: z.string(),
    ENABLE_USERS_CACHE: z
      .string()
      .transform((v) => JSON.parse(v))
      .pipe(z.boolean())
      .optional()
      .nullable(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnvStrict: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    BOT_TOKEN: process.env.BOT_TOKEN,
    ENABLE_USERS_CACHE: process.env.ENABLE_USERS_CACHE,
  },
  client: {},
  emptyStringAsUndefined: true,
});
