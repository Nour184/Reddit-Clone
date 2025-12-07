// src/db.ts
import { Pool } from "pg";

export const pool = new Pool({
    user: 'neondb_owner',
    host: 'ep-cool-pond-ag6dlbgu-pooler.c-2.eu-central-1.aws.neon.tech',
    database: 'neondb',
    password: 'npg_ohLxKP8CJR9U',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});
