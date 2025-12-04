// src/lib/db.ts
import { Pool, type PoolConfig } from "pg";

const config: PoolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 6543,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : false,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
};

// 👇 ESTA línea es la importante
export const pool = new Pool(config);
