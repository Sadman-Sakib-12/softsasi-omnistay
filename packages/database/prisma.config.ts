import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

loadEnv({
  path: path.resolve(currentDirectory, "../../.env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
